import { Elysia } from 'elysia'
import { getNotifications, markNotificationRead } from './service.js'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'

export const notificationModule = new Elysia({ prefix: '/notifications' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async ({ workspaceId, query }) => {
    const { limit } = (query as Record<string, string>) ?? {}
    return getNotifications(workspaceId!, limit ? Number(limit) : 50)
  })

  .patch('/:id/read', async ({ workspaceId, params }) => {
    return markNotificationRead(workspaceId!, params.id)
  })
