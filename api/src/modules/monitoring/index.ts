import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { sql } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'
import { getCircuitStatus } from '../ai/circuit-breaker/index.js'
import { serverError } from '../../utils/errors.js'

export const monitoringModule = new Elysia({ prefix: '/monitoring' })

  // Extended health check
  .get('/health', async ({ set }) => {
    try {
      const checks: Record<string, { status: string; latency?: number; details?: string }> = {}

      // Database check
      const dbStart = Date.now()
      try {
        await db.execute(sql`SELECT 1`)
        checks.database = { status: 'ok', latency: Date.now() - dbStart }
      } catch (err) {
        checks.database = { status: 'error', latency: Date.now() - dbStart, details: (err as Error).message }
      }

      // AI providers circuit breaker
      checks.circuitBreaker = { status: 'ok', details: JSON.stringify(getCircuitStatus()) }

      // Queue status — count pending messages in persistent queue
      const queueResult = await db.execute(sql`
        SELECT count(*) as pending FROM outbound_queue WHERE status = 'pending'
      `)
      const pendingCount = Number(queueResult.rows[0]?.pending ?? 0)
      checks.queues = {
        status: pendingCount > 100 ? 'warn' : 'ok',
        details: `${pendingCount} pending messages`,
      }

      const allOk = Object.values(checks).every(c => c.status === 'ok')
      const hasError = Object.values(checks).some(c => c.status === 'error')

      return {
        status: hasError ? 'unhealthy' : allOk ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '0.3.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks,
      }
    } catch (err) {
      logger.error('Health check failed', { error: (err as Error).message })
      return serverError(set, 'Health check failed')
    }
  })

  // Readiness probe (for load balancers)
  .get('/ready', async ({ set }) => {
    try {
      await db.execute(sql`SELECT 1`)
      return { ready: true }
    } catch (err) {
      logger.error('Readiness check failed', { error: (err as Error).message })
      set.status = 503
      return { ready: false }
    }
  })

  // Error reporting endpoint (for Sentry-style client reports)
  .post('/errors', async ({ body }) => {
    const data = body as Record<string, unknown>
    logger.error('Client error report', data)
    return { received: true }
  })
