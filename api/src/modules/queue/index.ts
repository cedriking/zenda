import { Elysia } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { getQueuedItems, clearQueue } from './offline-queue.js'
import { getQueueStats } from './retry-queue.js'

export const queueModule = new Elysia({ prefix: '/queue' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async () => {
    const stats = getQueueStats()
    const items = getQueuedItems()
    return {
      retryQueue: stats,
      offlineQueue: {
        total: items.length,
        safe: items.filter(i => i.type === 'safe').length,
        unsafe: items.filter(i => i.type === 'unsafe').length,
      },
    }
  })

  .delete('/', async ({ query }) => {
    const { type } = (query as Record<string, string>) ?? {}
    const cleared = clearQueue(type as any)
    return { cleared }
  })
