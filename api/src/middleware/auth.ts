import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config/env.js'

export const authPlugin = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
      exp: '1h',
    })
  )
  .use(
    jwt({
      name: 'refreshJwt',
      secret: JWT_REFRESH_SECRET,
      exp: '7d',
    })
  )
  .derive(async ({ jwt, headers }): Promise<{ userId: string | null; workspaceId: string | null }> => {
    const authHeader = headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return { userId: null, workspaceId: null }
    }
    const token = authHeader.slice(7)
    const payload = await jwt.verify(token)
    if (!payload) {
      return { userId: null, workspaceId: null }
    }
    return {
      userId: payload.sub ?? null,
      workspaceId: (payload as Record<string, unknown>).workspaceId as string ?? null,
    }
  })
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return
      onBeforeHandle(({ userId }) => {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    },
  }))
