import { Elysia } from 'elysia'
import { getNotifications, markNotificationRead } from './service.js'
import { logger } from '../../infra/logger.js'
import { serverError, notFound } from '../../utils/errors.js'

export const notificationModule = new Elysia({ prefix: '/notifications' })

  .get('/', async ({ workspaceId, query, set }) => {
    try {
      const { limit } = (query as Record<string, string>) ?? {}
      return await getNotifications(workspaceId!, limit ? Number(limit) : 50)
    } catch (err) {
      logger.error('Failed to get notifications', { error: (err as Error).message })
      return serverError(set, 'Failed to get notifications')
    }
  })

  .patch('/:id/read', async ({ workspaceId, params, set }) => {
    try {
      const result = await markNotificationRead(workspaceId!, params.id)
      if (!result) return notFound(set, 'Notification not found')
      return result
    } catch (err) {
      logger.error('Failed to mark notification read', { error: (err as Error).message })
      return serverError(set, 'Failed to mark notification read')
    }
  })
