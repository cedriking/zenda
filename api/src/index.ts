import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authBase } from './middleware/auth.js'
import { authModule } from './modules/auth/index.js'
import { workspaceModule } from './modules/workspace/index.js'
import { wsModule } from './modules/whatsapp/ws-handler.js'
import { conversationModule } from './modules/conversation/index.js'
import { appointmentModule } from './modules/appointment/index.js'
import { serviceModule } from './modules/service/index.js'
import { staffModule } from './modules/staff/index.js'
import { availabilityModule } from './modules/availability/index.js'
import { businessModule } from './modules/business/index.js'
import { notificationModule } from './modules/notification/index.js'
import { billingModule } from './modules/billing/index.js'
import { usageModule } from './modules/usage/index.js'
import { onboardingModule } from './modules/onboarding/index.js'
import { knowledgeBaseModule } from './modules/knowledge-base/index.js'
import { customerModule } from './modules/conversation/customer-endpoint.js'
import { analyticsModule } from './modules/analytics/index.js'
import { queueModule } from './modules/queue/index.js'
import { adminModule } from './modules/admin/index.js'
import { monitoringModule } from './modules/monitoring/index.js'
import { translationModule } from './modules/ai/translation.js'
import { supportModule } from './modules/support/index.js'
import { API_PORT, CORS_ORIGINS, NODE_ENV } from './config/env.js'
import { rateLimit } from './middleware/rate-limit.js'
import { db } from '@zenda/db/client'
import { sql } from 'drizzle-orm'
import { logger } from './infra/logger.js'

const corsOrigins = CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)

const app = new Elysia()
  .use(cors({
    origin: corsOrigins,
    credentials: true,
  }))
  .use(rateLimit())
  .get('/health', async () => {
    let dbOk = false
    try {
      await db.execute(sql`SELECT 1`)
      dbOk = true
    } catch (err) {
      logger.error('Health check DB query failed', { error: (err as Error).message })
      dbOk = false
    }
    return {
      status: dbOk ? 'ok' : 'degraded',
      db: dbOk,
      timestamp: new Date().toISOString(),
    }
  })
  // Debug endpoint — remove after fixing auth
  .get('/debug/auth', async ({ headers }) => {
    const authHeader = headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return { error: 'No Bearer token', hasAuth: !!authHeader }
    }
    try {
      const { jwtVerify } = await import('jose')
      const { JWT_SECRET } = await import('./config/env.js')
      const secret = new TextEncoder().encode(JWT_SECRET)
      const token = authHeader.slice(7)
      const { payload } = await jwtVerify(token, secret)
      return {
        payload,
        sub: payload.sub,
        workspaceId: payload.workspaceId,
        workspaceIdType: typeof payload.workspaceId,
        allKeys: Object.keys(payload),
      }
    } catch (err: any) {
      return { error: err.message, name: err.name }
    }
  })
  // Public routes
  .use(authModule)
  .use(billingModule)
  // Authenticated routes — each module uses appPlugin internally
  .use(workspaceModule)
  .use(wsModule)
  .use(conversationModule)
  .use(appointmentModule)
  .use(serviceModule)
  .use(staffModule)
  .use(availabilityModule)
  .use(businessModule)
  .use(notificationModule)
  .use(usageModule)
  .use(onboardingModule)
  .use(knowledgeBaseModule)
  .use(customerModule)
  .use(analyticsModule)
  .use(queueModule)
  .use(adminModule)
  .use(monitoringModule)
  .use(translationModule)
  .use(supportModule)
  .onError(({ error, set }) => {
    const message = error instanceof Error ? error.message : 'Internal server error'
    logger.error('Unhandled error', { error: message, ...(NODE_ENV !== 'production' && { stack: error instanceof Error ? error.stack : undefined }) })
    set.status = 500
    return { error: 'Internal server error' }
  })
  .listen(Number(API_PORT))

logger.info(`Zenda API running on port ${API_PORT}`)
