import { db } from "@zenda/db/client";

interface AnalyticsPeriod {
  end: Date;
  start: Date;
}

interface AnalyticsData {
  ai: { providerBreakdown: Record<string, number>; totalTokens: number };
  appointments: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
    noShowRate: number;
  };
  conversations: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  escalations: { total: number; rate: number };
  messages: { total: number; avgResponseTimeMs: number };
}

export async function getAnalytics(
  workspaceId: string,
  period: AnalyticsPeriod
): Promise<AnalyticsData> {
  const [
    conversationStats,
    appointmentStats,
    messageStats,
    escalationStats,
    aiStats,
  ] = await Promise.all([
    getConversationStats(workspaceId, period),
    getAppointmentStats(workspaceId, period),
    getMessageStats(workspaceId, period),
    getEscalationStats(workspaceId, period),
    getAIStats(workspaceId, period),
  ]);

  return {
    conversations: conversationStats,
    appointments: appointmentStats,
    messages: messageStats,
    escalations: escalationStats,
    ai: aiStats,
  };
}

async function getConversationStats(
  workspaceId: string,
  period: AnalyticsPeriod
) {
  const [totalResult, byDayResult] = await Promise.all([
    db.conversation.count({
      where: {
        workspaceId,
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
    db.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM conversations
      WHERE workspace_id = ${workspaceId}
        AND created_at >= ${period.start}
        AND created_at <= ${period.end}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
  ]);

  return { total: totalResult, byDay: byDayResult };
}

async function getAppointmentStats(
  workspaceId: string,
  period: AnalyticsPeriod
) {
  const [totalResult, noShowResult, byDayResult] = await Promise.all([
    db.appointment.count({
      where: {
        workspaceId,
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
    db.appointment.count({
      where: {
        workspaceId,
        status: "no_show",
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
    db.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM appointments
      WHERE workspace_id = ${workspaceId}
        AND created_at >= ${period.start}
        AND created_at <= ${period.end}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
  ]);

  return {
    total: totalResult,
    byDay: byDayResult,
    noShowRate: totalResult > 0 ? noShowResult / totalResult : 0,
  };
}

async function getMessageStats(workspaceId: string, period: AnalyticsPeriod) {
  const totalResult = await db.message.count({
    where: {
      workspaceId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  // Calculate avg response time: time between first customer message and first AI response
  // per conversation, then average across all conversations in the period.
  const startIso = period.start.toISOString();
  const endIso = period.end.toISOString();

  const responseTimeResult = await db.$queryRaw<Array<{ avgMs: number }>>`
    SELECT COALESCE(
      AVG(
        EXTRACT(EPOCH FROM (
          first_reply.created_at - first_customer.created_at
        )) * 1000
      ),
      0
    ) as "avgMs"
    FROM (
      SELECT DISTINCT ON (m1.conversation_id)
        m1.conversation_id, m1.created_at
      FROM messages m1
      WHERE m1.sender_type = 'customer'
        AND m1.workspace_id = ${workspaceId}
        AND m1.created_at >= ${startIso}::timestamptz
        AND m1.created_at <= ${endIso}::timestamptz
      ORDER BY m1.conversation_id, m1.created_at ASC
    ) AS first_customer
    INNER JOIN (
      SELECT DISTINCT ON (m2.conversation_id)
        m2.conversation_id, m2.created_at
      FROM messages m2
      WHERE m2.sender_type = 'ai'
        AND m2.workspace_id = ${workspaceId}
        AND m2.created_at >= ${startIso}::timestamptz
        AND m2.created_at <= ${endIso}::timestamptz
      ORDER BY m2.conversation_id, m2.created_at ASC
    ) AS first_reply
    ON first_customer.conversation_id = first_reply.conversation_id
  `;

  return {
    total: totalResult,
    avgResponseTimeMs: Math.round(responseTimeResult[0]?.avgMs ?? 0),
  };
}

async function getEscalationStats(
  workspaceId: string,
  period: AnalyticsPeriod
) {
  const [escalatedResult, totalResult] = await Promise.all([
    db.conversation.count({
      where: {
        workspaceId,
        mode: { in: ["needs_attention", "human_takeover"] },
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
    db.conversation.count({
      where: {
        workspaceId,
        createdAt: { gte: period.start, lte: period.end },
      },
    }),
  ]);

  return {
    total: escalatedResult,
    rate: totalResult > 0 ? escalatedResult / totalResult : 0,
  };
}

async function getAIStats(workspaceId: string, period: AnalyticsPeriod) {
  const usage = await db.providerUsage.findMany({
    where: {
      workspaceId,
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const breakdown: Record<string, number> = {};
  let totalTokens = 0;

  for (const record of usage) {
    const provider = record.provider;
    breakdown[provider] = (breakdown[provider] ?? 0) + 1;
    totalTokens += record.inputTokens + record.outputTokens;
  }

  return { providerBreakdown: breakdown, totalTokens };
}
