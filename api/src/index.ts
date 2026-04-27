import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authPlugin } from './middleware/auth.js'
import { workspaceContext } from './middleware/workspace-context.js'
import { authModule } from './modules/auth/index.js'
import { workspaceModule } from './modules/workspace/index.js'
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
  .use(authModule)
  .use(workspaceModule)
  .onError(({ error, set }) => {
    logger.error('Unhandled error', { error: error.message, stack: error.stack })
    set.status = 500
    return { error: 'Internal server error' }
  })
  .listen(Number(API_PORT))

logger.info(`Zenda API running on port ${API_PORT}`)
