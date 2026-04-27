import { db } from '@zenda/db/client'
import { conversations, messages, appointments, providerUsage } from '@zenda/db/schema'
import { eq, and, gte, lte, sql, count } from 'drizzle-orm'

interface AnalyticsPeriod {
  start: Date
  end: Date
}

interface AnalyticsData {
  conversations: { total: number; byDay: Array<{ date: string; count: number }> }
  appointments: { total: number; byDay: Array<{ date: string; count: number }>; noShowRate: number }
  messages: { total: number; avgResponseTimeMs: number }
  escalations: { total: number; rate: number }
  ai: { providerBreakdown: Record<string, number>; totalTokens: number }
}

export async function getAnalytics(workspaceId: string, period: AnalyticsPeriod): Promise<AnalyticsData> {
  const [conversationStats, appointmentStats, messageStats, escalationStats, aiStats] = await Promise.all([
    getConversationStats(workspaceId, period),
    getAppointmentStats(workspaceId, period),
    getMessageStats(workspaceId, period),
    getEscalationStats(workspaceId, period),
    getAIStats(workspaceId, period),
  ])

  return {
    conversations: conversationStats,
    appointments: appointmentStats,
    messages: messageStats,
    escalations: escalationStats,
    ai: aiStats,
  }
}

async function getConversationStats(workspaceId: string, period: AnalyticsPeriod) {
  const result = await db
    .select({
      count: count(),
    })
    .from(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      gte(conversations.createdAt, period.start),
      lte(conversations.createdAt, period.end),
    ))

  const byDay = await db
    .select({
      date: sql<string>`DATE(${conversations.createdAt})`,
      count: count(),
    })
    .from(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      gte(conversations.createdAt, period.start),
      lte(conversations.createdAt, period.end),
    ))
    .groupBy(sql`DATE(${conversations.createdAt})`)
    .orderBy(sql`DATE(${conversations.createdAt})`)

  return { total: result[0]?.count ?? 0, byDay }
}

async function getAppointmentStats(workspaceId: string, period: AnalyticsPeriod) {
  const totalResult = await db
    .select({ count: count() })
    .from(appointments)
    .where(and(
      eq(appointments.workspaceId, workspaceId),
      gte(appointments.createdAt, period.start),
      lte(appointments.createdAt, period.end),
    ))

  const noShowResult = await db
    .select({ count: count() })
    .from(appointments)
    .where(and(
      eq(appointments.workspaceId, workspaceId),
      eq(appointments.status, 'no_show' as any),
      gte(appointments.createdAt, period.start),
      lte(appointments.createdAt, period.end),
    ))

  const total = totalResult[0]?.count ?? 0
  const noShows = noShowResult[0]?.count ?? 0

  const byDay = await db
    .select({
      date: sql<string>`DATE(${appointments.createdAt})`,
      count: count(),
    })
    .from(appointments)
    .where(and(
      eq(appointments.workspaceId, workspaceId),
      gte(appointments.createdAt, period.start),
      lte(appointments.createdAt, period.end),
    ))
    .groupBy(sql`DATE(${appointments.createdAt})`)
    .orderBy(sql`DATE(${appointments.createdAt})`)

  return {
    total,
    byDay,
    noShowRate: total > 0 ? noShows / total : 0,
  }
}

async function getMessageStats(workspaceId: string, period: AnalyticsPeriod) {
  const totalResult = await db
    .select({ count: count() })
    .from(messages)
    .where(and(
      eq(messages.workspaceId, workspaceId),
      gte(messages.createdAt, period.start),
      lte(messages.createdAt, period.end),
    ))

  return {
    total: totalResult[0]?.count ?? 0,
    avgResponseTimeMs: 0, // Would need timestamp diff calculation
  }
}

async function getEscalationStats(workspaceId: string, period: AnalyticsPeriod) {
  const escalations = await db
    .select({ count: count() })
    .from(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      gte(conversations.createdAt, period.start),
      lte(conversations.createdAt, period.end),
    ))

  const totalResult = await db
    .select({ count: count() })
    .from(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      gte(conversations.createdAt, period.start),
      lte(conversations.createdAt, period.end),
    ))

  const total = totalResult[0]?.count ?? 0
  const escalated = escalations[0]?.count ?? 0

  return { total: escalated, rate: total > 0 ? escalated / total : 0 }
}

async function getAIStats(workspaceId: string, period: AnalyticsPeriod) {
  const usage = await db
    .select()
    .from(providerUsage)
    .where(and(
      eq(providerUsage.workspaceId, workspaceId),
      gte(providerUsage.createdAt, period.start),
      lte(providerUsage.createdAt, period.end),
    ))

  const breakdown: Record<string, number> = {}
  let totalTokens = 0

  for (const record of usage) {
    const provider = record.provider ?? 'unknown'
    breakdown[provider] = (breakdown[provider] ?? 0) + 1
    totalTokens += record.inputTokens ?? 0 + record.outputTokens ?? 0
  }

  return { providerBreakdown: breakdown, totalTokens }
}
