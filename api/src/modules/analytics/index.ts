import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { messages } from '@zenda/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { createAppPlugin } from '../../middleware/app-plugin.js'
import { getAnalytics } from './service.js'

export const analyticsModule = new Elysia({ prefix: '/analytics' })
  .use(createAppPlugin())

  .get('/', async ({ workspaceId, query }) => {
    const { period } = (query as Record<string, string>) ?? {}
    const days = parseInt(period ?? '30')
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    return getAnalytics(workspaceId!, { start, end })
  })

  .get('/messages-today', async ({ workspaceId }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [result] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(messages)
      .where(and(
        eq(messages.workspaceId, workspaceId!),
        gte(messages.createdAt, today),
      ))

    return { todayCount: result?.count ?? 0 }
  })
