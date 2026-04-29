import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { users, workspaces, workspaceMembers, businessProfiles, receptionistProfiles } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema, signupSchema } from '@zenda/shared'
import { logger } from '../../infra/logger.js'

export const authModule = new Elysia({ prefix: '/auth' })
  .post('/signup', async ({ body, jwt, refreshJwt, set }) => {
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { error: 'Validation failed', details: parsed.error.issues }
    }
    const { name, email, password, businessName } = parsed.data

    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      set.status = 409
      return { error: 'Email already registered' }
    }

    // Hash password with Bun
    const passwordHash = await Bun.password.hash(password)

    // Create user
    const [user] = await db.insert(users).values({ email, name, passwordHash }).returning()

    // Create workspace
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100)
    const [workspace] = await db.insert(workspaces).values({
      name: businessName,
      slug,
    }).returning()

    // Create workspace membership
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    })

    // Create default business profile
    await db.insert(businessProfiles).values({
      workspaceId: workspace.id,
      name: businessName,
    })

    // Create default receptionist profile
    await db.insert(receptionistProfiles).values({
      workspaceId: workspace.id,
      name: 'Noa',
      tone: 'professional',
    })

    // Generate tokens
    const accessToken = await jwt.sign({ sub: user.id, workspaceId: workspace.id })
    const refreshToken = await refreshJwt.sign({ sub: user.id, workspaceId: workspace.id })

    logger.info('User signed up', { userId: user.id, workspaceId: workspace.id })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, planTier: 'starter' as const, onboardingStep: workspace.onboardingStep },
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
      businessName: t.String(),
    }),
  })
  .post('/login', async ({ body, jwt, refreshJwt, set }) => {
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      set.status = 400
      return { error: 'Validation failed', details: parsed.error.issues }
    }
    const { email, password } = parsed.data

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) {
      set.status = 401
      return { error: 'Invalid credentials' }
    }

    // Verify password
    const valid = await Bun.password.verify(password, user.passwordHash)
    if (!valid) {
      set.status = 401
      return { error: 'Invalid credentials' }
    }

    // Get workspace
    const [membership] = await db.select().from(workspaceMembers).where(eq(workspaceMembers.userId, user.id)).limit(1)
    const [workspace] = membership ? await db.select().from(workspaces).where(eq(workspaces.id, membership.workspaceId)).limit(1) : []

    // Generate tokens
    const accessToken = await jwt.sign({ sub: user.id, workspaceId: workspace?.id })
    const refreshToken = await refreshJwt.sign({ sub: user.id, workspaceId: workspace?.id })

    logger.info('User logged in', { userId: user.id })

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: workspace
        ? { id: workspace.id, name: workspace.name, slug: workspace.slug, planTier: 'starter' as const, onboardingStep: workspace.onboardingStep }
        : null,
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .post('/refresh', async ({ body, jwt, refreshJwt, set }) => {
    const { refreshToken: token } = body as { refreshToken: string }
    if (!token) {
      set.status = 400
      return { error: 'Refresh token required' }
    }

    const payload = await refreshJwt.verify(token)
    if (!payload) {
      set.status = 401
      return { error: 'Invalid refresh token' }
    }

    const accessToken = await jwt.sign({ sub: payload.sub, workspaceId: (payload as Record<string, unknown>).workspaceId })
    const newRefreshToken = await refreshJwt.sign({ sub: payload.sub, workspaceId: (payload as Record<string, unknown>).workspaceId })

    return { accessToken, refreshToken: newRefreshToken }
  }, {
    body: t.Object({
      refreshToken: t.String(),
    }),
  })
  .post('/logout', async ({ jwt, set }) => {
    // Client-side should discard tokens. Server-side token revocation
    // can be added later with a token blacklist in Redis or DB.
    logger.info('User logged out')
    return { success: true }
  })
