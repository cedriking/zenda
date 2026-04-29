import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { messages, conversations, appointments } from '@zenda/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import { getAnalytics } from './service.js'

export const analyticsModule = new Elysia({ prefix: '/analytics' })

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

  .get('/dashboard-stats', async ({ workspaceId }) => {
    const today = new Date().toISOString().split('T')[0]

    const [todayAppts, activeConvs, needsAttention, todayMsgs] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(appointments)
        .where(and(
          eq(appointments.workspaceId, workspaceId!),
          sql`DATE(${appointments.startAt}) = ${today}`,
          sql`${appointments.status} NOT IN ('cancelled', 'completed', 'no_show')`,
        )),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(conversations)
        .where(and(
          eq(conversations.workspaceId, workspaceId!),
          eq(conversations.mode, 'auto'),
        )),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(conversations)
        .where(and(
          eq(conversations.workspaceId, workspaceId!),
          sql`${conversations.mode} IN ('needs_attention', 'human_takeover')`,
        )),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(messages)
        .where(and(
          eq(messages.workspaceId, workspaceId!),
          gte(messages.createdAt, new Date(today)),
        )),
    ])

    return {
      todayAppointments: todayAppts[0]?.count ?? 0,
      activeConversations: activeConvs[0]?.count ?? 0,
      needsAttention: needsAttention[0]?.count ?? 0,
      todayMessages: todayMsgs[0]?.count ?? 0,
    }
  })
