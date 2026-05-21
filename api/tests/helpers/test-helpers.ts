/**
 * Test helpers for creating Elysia app instances and JWT tokens.
 *
 * The main app in src/index.ts calls .listen() and starts side-effect timers,
 * so for route tests we build a minimal app that includes only the middleware
 * chain (derive + guard) plus the module under test.
 */
import { Elysia } from 'elysia'
import { SignJWT } from 'jose'
import { db } from '@zenda/db/client'
import { workspaces, workspaceMembers, revokedTokens } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'

// ── JWT helpers ────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-tests'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-for-tests'

const jwtSecret = new TextEncoder().encode(JWT_SECRET)
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET)

export async function createAccessToken(
  payload: { sub: string; workspaceId: string; jti?: string },
  expiresIn = '1h',
): Promise<string> {
  let jwt = new SignJWT({ workspaceId: payload.workspaceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setExpirationTime(expiresIn)

  if (payload.jti) jwt = jwt.setJti(payload.jti)

  return jwt.sign(jwtSecret)
}

export async function createRefreshToken(
  payload: { sub: string; workspaceId: string; jti?: string },
  expiresIn = '7d',
): Promise<string> {
  let jwt = new SignJWT({ workspaceId: payload.workspaceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setExpirationTime(expiresIn)

  if (payload.jti) jwt = jwt.setJti(payload.jti)

  return jwt.sign(refreshSecret)
}

// ── Mock DB helpers ────────────────────────────────────────────────

/**
 * Creates a minimal app with the same global auth derive/guard as the real app,
 * but accepts module(s) to register for testing.
 *
 * The DB calls in the auth derive are mocked via the actual DB — tests that
 * need isolation should mock `@zenda/db/client` at the module level.
 */
export function createTestApp(...modules: Elysia[]) {
  const jwtSecretBuf = new TextEncoder().encode(JWT_SECRET)

  return new Elysia()
    .derive(async ({ headers, path }) => {
      const PUBLIC_PATHS = ['/auth', '/health', '/billing/webhook']
      const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))
      if (isPublic) {
        return { userId: null as string | null, workspaceId: null as string | null, workspace: null as any }
      }

      const authHeader = headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return { userId: null as string | null, workspaceId: null as string | null, workspace: null as any }
      }

      try {
        const { jwtVerify } = await import('jose')
        const token = authHeader.slice(7)
        const { payload } = await jwtVerify(token, jwtSecretBuf)
        const userId = (payload.sub as string) ?? null
        const workspaceId = (payload as Record<string, unknown>).workspaceId as string ?? null

        // Check revoked tokens
        const jti = (payload as Record<string, unknown>).jti as string | undefined
        if (jti) {
          const [revoked] = await db
            .select({ id: revokedTokens.id })
            .from(revokedTokens)
            .where(eq(revokedTokens.tokenJti, jti))
            .limit(1)
          if (revoked) {
            return { userId: null as string | null, workspaceId: null as string | null, workspace: null as any }
          }
        }

        let workspace: any = null
        if (userId && workspaceId) {
          const [membership] = await db
            .select()
            .from(workspaceMembers)
            .where(and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)))
            .limit(1)

          if (membership) {
            const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1)
            workspace = ws ?? null
          }
        }

        return { userId, workspaceId, workspace }
      } catch {
        return { userId: null as string | null, workspaceId: null as string | null, workspace: null as any }
      }
    })
    .onBeforeHandle(({ userId, workspace, path }) => {
      const PUBLIC_PATHS = ['/auth', '/health', '/billing/webhook']
      const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))
      if (isPublic) return
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { 'Content-Type': 'application/json' },
        })
      }
      if (!workspace) {
        return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
          status: 403, headers: { 'Content-Type': 'application/json' },
        })
      }
    })
    .use(modules)
}
