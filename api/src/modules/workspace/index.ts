import { typedContext } from '../../middleware/typed-context.js'
import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { workspaces } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'
import { notFound, serverError } from '../../utils/errors.js'

export const workspaceModule = new Elysia({ prefix: '/workspace' })
  .use(typedContext)
  .get('/', async ({ workspaceId, set }) => {
    try {
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId!)).limit(1)
      if (!ws) return notFound(set, 'Workspace not found')
      return ws
    } catch (err) {
      logger.error('Failed to get workspace', { error: (err as Error).message })
      return serverError(set, 'Failed to get workspace')
    }
  })
  .patch('/', async ({ workspaceId, body, set }) => {
    try {
      const [updated] = await db
        .update(workspaces)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId))
        .returning()
      if (!updated) return notFound(set, 'Workspace not found')
      return updated
    } catch (err) {
      logger.error('Failed to update workspace', { error: (err as Error).message })
      return serverError(set, 'Failed to update workspace')
    }
  }, {
    body: {
      name: 'string?',
      timezone: 'string?',
      country: 'string?',
      defaultLanguage: 'string?',
    },
  })
