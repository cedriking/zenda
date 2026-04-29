import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { workspaces, subscriptions, users, whatsappConnections } from '@zenda/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { authBase } from '../../middleware/auth.js'
import { ADMIN_SECRET } from '../../config/env.js'
import { logger } from '../../infra/logger.js'

const forbiddenRes = new Response(JSON.stringify({ error: 'Admin access denied' }), {
  status: 403,
  headers: { 'Content-Type': 'application/json' },
})

export const adminModule = new Elysia({ prefix: '/admin' })
  .use(authBase)
  .onBeforeHandle(({ headers, userId }) => {
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const secret = headers['x-admin-secret']
    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return forbiddenRes
    }
  })

  // Workspace overview
  .get('/workspaces', async () => {
    const wsList = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        onboardingStep: workspaces.onboardingStep,
        createdAt: workspaces.createdAt,
      })
      .from(workspaces)
      .orderBy(desc(workspaces.createdAt))
      .limit(100)

    return wsList
  })

  .get('/workspaces/:id', async ({ params }) => {
    const [ws] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, params.id))
      .limit(1)

    if (!ws) return { error: 'Workspace not found' }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, ws.id))
      .limit(1)

    const connections = await db
      .select()
      .from(whatsappConnections)
      .where(eq(whatsappConnections.workspaceId, ws.id))
      .limit(5)

    return { workspace: ws, subscription: sub, connections }
  })

  // Subscription overview
  .get('/subscriptions', async () => {
    const subs = await db
      .select({
        workspaceId: subscriptions.workspaceId,
        planTier: subscriptions.planTier,
        status: subscriptions.status,
        billingPeriod: subscriptions.billingPeriod,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt))
      .limit(100)

    return subs
  })

  // Override plan
  .post('/workspaces/:id/override-plan', async ({ params, body }) => {
    const data = body as Record<string, string>
    await db
      .update(subscriptions)
      .set({
        planTier: data.planTier as any,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.workspaceId, params.id))

    logger.info('Plan override', { workspaceId: params.id, plan: data.planTier })
    return { success: true }
  })

  // Stats
  .get('/stats', async () => {
    const [workspaceCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workspaces)

    const [activeSubs] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'))

    return {
      totalWorkspaces: workspaceCount?.count ?? 0,
      activeSubscriptions: activeSubs?.count ?? 0,
    }
  })
