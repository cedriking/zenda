import { db } from '@zenda/db/client'
import { usageRecords, subscriptions } from '@zenda/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { PLANS, USAGE_WARNING_THRESHOLDS } from '@zenda/shared'
import type { PlanTier } from '@zenda/shared'
import { createNotification } from '../notification/service.js'
import { logger } from '../../infra/logger.js'

export type UsageMetric = 'conversations' | 'appointments' | 'voice_minutes'

export interface EnforcementResult {
  allowed: boolean
  metric: UsageMetric
  currentUsage: number
  limit: number
  percentage: number
  warningLevel: 'none' | 'warn' | 'critical' | 'limit'
  gracePeriodEnd: Date | null
}

/**
 * Check whether a workspace is allowed to perform an action that increments
 * the given metric. Returns a full enforcement result including whether
 * the action is allowed and the current warning level.
 *
 * At the limit (100%), the action is blocked unless the workspace is within
 * the grace period (7 days after first hitting the limit in the billing period).
 */
export async function enforceLimit(
  workspaceId: string,
  metric: UsageMetric,
): Promise<EnforcementResult> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Get current subscription / plan
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1)

  // If subscription is not active, default to starter limits
  const tier: PlanTier = (sub?.status === 'active' || sub?.status === 'trialing')
    ? (sub.planTier as PlanTier)
    : 'starter'
  const planConfig = PLANS[tier]

  const limit = getLimitForMetric(planConfig, metric)

  // Get current usage for this period
  const [record] = await db
    .select()
    .from(usageRecords)
    .where(and(
      eq(usageRecords.workspaceId, workspaceId),
      eq(usageRecords.metric, metric),
      gte(usageRecords.periodStart, periodStart),
      lte(usageRecords.periodEnd, periodEnd),
    ))
    .limit(1)

  const currentUsage = record?.value ?? 0
  const percentage = limit > 0 ? currentUsage / limit : 0

  let warningLevel: EnforcementResult['warningLevel'] = 'none'
  if (percentage >= USAGE_WARNING_THRESHOLDS.limit) warningLevel = 'limit'
  else if (percentage >= USAGE_WARNING_THRESHOLDS.critical) warningLevel = 'critical'
  else if (percentage >= USAGE_WARNING_THRESHOLDS.warn) warningLevel = 'warn'

  // Grace period: if at limit, check whether we're within 7 days of period end
  let gracePeriodEnd: Date | null = null
  let allowed = true

  if (warningLevel === 'limit') {
    const graceEnd = new Date(periodEnd)
    graceEnd.setDate(graceEnd.getDate() + USAGE_WARNING_THRESHOLDS.gracePeriodDays)
    gracePeriodEnd = graceEnd

    // Allow during grace period (billing period + 7 days)
    allowed = now <= graceEnd
  }

  return { allowed, metric, currentUsage, limit, percentage, warningLevel, gracePeriodEnd }
}

/**
 * Track usage for a metric and dispatch warning notifications when
 * thresholds are crossed (80% warn, 95% critical, 100% limit).
 *
 * Returns the updated enforcement result so callers can decide
 * what to do after tracking.
 */
export async function trackAndEnforce(
  workspaceId: string,
  metric: UsageMetric,
  increment = 1,
): Promise<EnforcementResult> {
  // Get state BEFORE increment
  const before = await enforceLimit(workspaceId, metric)

  // Increment usage
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

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

  // Get state AFTER increment
  const after = await enforceLimit(workspaceId, metric)

  // Dispatch notifications on threshold transitions
  if (before.warningLevel !== after.warningLevel) {
    await dispatchUsageNotification(workspaceId, metric, after)
  }

  return after
}

/**
 * Reset all usage records for a workspace when plan is downgraded.
 * This prevents a workspace from being immediately over-limit on
 * a lower tier — they start fresh with the new limits.
 */
export async function resetUsageOnPlanChange(workspaceId: string): Promise<void> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Delete current period usage records so they start from zero
  await db
    .delete(usageRecords)
    .where(and(
      eq(usageRecords.workspaceId, workspaceId),
      gte(usageRecords.periodStart, periodStart),
      lte(usageRecords.periodEnd, periodEnd),
    ))

  logger.info('Usage records reset for plan change', { workspaceId })
}

/**
 * Dispatch a usage warning/limit notification to the workspace owner.
 */
async function dispatchUsageNotification(
  workspaceId: string,
  metric: UsageMetric,
  enforcement: EnforcementResult,
): Promise<void> {
  const metricLabel = metric === 'voice_minutes' ? 'voice minutes' : metric
  const pct = Math.round(enforcement.percentage * 100)

  try {
    if (enforcement.warningLevel === 'limit') {
      await createNotification({
        workspaceId,
        type: 'usage_limit',
        title: `${metricLabel} limit reached`,
        body: `You've used ${enforcement.currentUsage} of ${enforcement.limit} ${metricLabel} this month (${pct}%). Upgrade your plan or wait for the next billing cycle.`,
      })
    } else if (enforcement.warningLevel === 'critical') {
      await createNotification({
        workspaceId,
        type: 'usage_warning',
        title: `${metricLabel} usage at ${pct}%`,
        body: `You've used ${enforcement.currentUsage} of ${enforcement.limit} ${metricLabel} this month. Consider upgrading to avoid hitting your limit.`,
      })
    } else if (enforcement.warningLevel === 'warn') {
      await createNotification({
        workspaceId,
        type: 'usage_warning',
        title: `${metricLabel} usage at ${pct}%`,
        body: `You've used ${enforcement.currentUsage} of ${enforcement.limit} ${metricLabel} this month.`,
      })
    }
  } catch (err) {
    // Non-blocking — don't fail the main flow if notification fails
    logger.error('Failed to send usage notification', {
      workspaceId,
      metric,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

function getLimitForMetric(planConfig: typeof PLANS.starter, metric: UsageMetric): number {
  switch (metric) {
    case 'conversations': return planConfig.conversationsLimit
    case 'appointments': return planConfig.appointmentsLimit
    case 'voice_minutes': return planConfig.voiceMinutesLimit
  }
}
