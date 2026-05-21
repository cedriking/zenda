import { Elysia } from 'elysia'
import { getUsageForPeriod } from './tracker.js'
import { enforceLimit } from './enforcement.js'
import { db } from '@zenda/db/client'
import { subscriptions } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { PLANS } from '@zenda/shared'
import type { PlanTier, UsageMetric } from './enforcement.js'
import { logger } from '../../infra/logger.js'
import { serverError } from '../../utils/errors.js'

export const usageModule = new Elysia({ prefix: '/usage' })

  // Current period usage summary for dashboard
  .get('/', async ({ workspaceId, set }) => {
    try {
      return await getUsageForPeriod(workspaceId!)
    } catch (err) {
      logger.error('Failed to get usage', { error: (err as Error).message })
      return serverError(set, 'Failed to get usage')
    }
  })

  // Detailed analytics: per-metric enforcement status + plan info
  .get('/analytics', async ({ workspaceId, set }) => {
    try {
      const wsId = workspaceId!

      // Get subscription/plan
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.workspaceId, wsId))
        .limit(1)

      const tier: PlanTier = (sub?.planTier as PlanTier) ?? 'starter'
      const plan = PLANS[tier]

      // Get enforcement status for each metric
      const metrics: UsageMetric[] = ['conversations', 'appointments', 'voice_minutes']
      const enforcementStatus = await Promise.all(
        metrics.map(async (metric) => {
          const result = await enforceLimit(wsId, metric)
          return { metric, ...result }
        }),
      )

      return {
        plan: {
          tier,
          name: plan.name,
          limits: {
            conversations: plan.conversationsLimit,
            appointments: plan.appointmentsLimit,
            voiceMinutes: plan.voiceMinutesLimit,
          },
        },
        billing: sub
          ? {
              status: sub.status,
              periodStart: sub.currentPeriodStart,
              periodEnd: sub.currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            }
          : null,
        usage: enforcementStatus,
        summary: {
          highestWarning: enforcementStatus.reduce(
            (max, s) => {
              const rank = { none: 0, warn: 1, critical: 2, limit: 3 }[s.warningLevel]
              return rank > max.rank ? { level: s.warningLevel, rank, metric: s.metric } : max
            },
            { level: 'none' as const, rank: 0, metric: '' },
          ).level,
          atLimit: enforcementStatus.some(s => s.warningLevel === 'limit'),
          nearLimit: enforcementStatus.some(s => s.warningLevel === 'critical'),
        },
      }
    } catch (err) {
      logger.error('Failed to get usage analytics', { error: (err as Error).message })
      return serverError(set, 'Failed to get usage analytics')
    }
  })
