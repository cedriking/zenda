import { Elysia } from 'elysia'
import { getNotifications, markNotificationRead } from './service.js'
import { appPlugin } from '../../middleware/app-plugin.js'

export const notificationModule = new Elysia({ prefix: '/notifications' })
  .use(appPlugin)

  .get('/', async ({ workspaceId, query }) => {
    const { limit } = (query as Record<string, string>) ?? {}
    return getNotifications(workspaceId!, limit ? Number(limit) : 50)
  })

  .patch('/:id/read', async ({ workspaceId, params }) => {
    return markNotificationRead(workspaceId!, params.id)
  })
