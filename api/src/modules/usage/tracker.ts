import { db } from '@zenda/db/client'
import { usageRecords, subscriptions } from '@zenda/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import type { PlanTier } from '@zenda/shared'
import { PLANS, USAGE_WARNING_THRESHOLDS } from '@zenda/shared'

interface UsageData {
  metric: string
  value: number
  limit: number
  percentage: number
  warningLevel: 'none' | 'warn' | 'critical' | 'limit'
}

export async function trackUsage(
  workspaceId: string,
  metric: 'conversations' | 'appointments' | 'voice_minutes',
  increment = 1,
): Promise<void> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Try to find existing record
  const [existing] = await db
    .select()
    .from(usageRecords)
    .where(and(
      eq(usageRecords.workspaceId, workspaceId),
      eq(usageRecords.metric, metric),
      gte(usageRecords.periodStart, periodStart),
      lte(usageRecords.periodEnd, periodEnd),
    ))
    .limit(1)

  if (existing) {
    await db
      .update(usageRecords)
      .set({ value: existing.value + increment })
      .where(eq(usageRecords.id, existing.id))
  } else {
    await db.insert(usageRecords).values({
      workspaceId,
      metric,
      value: increment,
      periodStart,
      periodEnd,
    })
  }
}

export async function getUsageForPeriod(workspaceId: string): Promise<UsageData[]> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Get current plan
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1)

  const tier: PlanTier = (sub?.planTier as PlanTier) ?? 'starter'
  const planConfig = PLANS[tier]

  // Get usage records
  const records = await db
    .select()
    .from(usageRecords)
    .where(and(
      eq(usageRecords.workspaceId, workspaceId),
      gte(usageRecords.periodStart, periodStart),
      lte(usageRecords.periodEnd, periodEnd),
    ))

  const metrics: Array<{ metric: string; limit: number }> = [
    { metric: 'conversations', limit: planConfig.conversationsLimit },
    { metric: 'appointments', limit: planConfig.appointmentsLimit },
    { metric: 'voice_minutes', limit: planConfig.voiceMinutesLimit },
  ]

  return metrics.map(({ metric, limit }) => {
    const record = records.find(r => r.metric === metric)
    const value = record?.value ?? 0
    const percentage = limit > 0 ? value / limit : 0

    let warningLevel: UsageData['warningLevel'] = 'none'
    if (percentage >= USAGE_WARNING_THRESHOLDS.limit) warningLevel = 'limit'
    else if (percentage >= USAGE_WARNING_THRESHOLDS.critical) warningLevel = 'critical'
    else if (percentage >= USAGE_WARNING_THRESHOLDS.warn) warningLevel = 'warn'

    return { metric, value, limit, percentage, warningLevel }
  })
}

export async function checkLimit(
  workspaceId: string,
  metric: 'conversations' | 'appointments' | 'voice_minutes',
): Promise<{ allowed: boolean; warningLevel: string }> {
  const usage = await getUsageForPeriod(workspaceId)
  const metricUsage = usage.find(u => u.metric === metric)

  if (!metricUsage) return { allowed: true, warningLevel: 'none' }
  if (metricUsage.warningLevel === 'limit') return { allowed: false, warningLevel: 'limit' }
  return { allowed: true, warningLevel: metricUsage.warningLevel }
}
