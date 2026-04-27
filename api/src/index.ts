import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authPlugin } from './middleware/auth.js'
import { workspaceContext } from './middleware/workspace-context.js'
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
import { API_PORT } from './config/env.js'
import { logger } from './infra/logger.js'

const app = new Elysia()
  .use(cors({
    origin: [
      'http://localhost:5173',   // Vite dev server (renderer)
      'http://localhost:3000',   // Next.js website
    ],
    credentials: true,
  }))
  .use(authPlugin)
  .use(workspaceContext)
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }))
  // Auth
  .use(authModule)
  .use(workspaceModule)
  // WebSocket (WhatsApp relay)
  .use(wsModule)
  // Core modules (all require auth + workspace)
  .use(conversationModule)
  .use(appointmentModule)
  .use(serviceModule)
  .use(staffModule)
  .use(availabilityModule)
  .use(businessModule)
  .use(notificationModule)
  .onError(({ error, set }) => {
    logger.error('Unhandled error', { error: error.message, stack: error.stack })
    set.status = 500
    return { error: 'Internal server error' }
  })
  .listen(Number(API_PORT))

logger.info(`Zenda API running on port ${API_PORT}`)
