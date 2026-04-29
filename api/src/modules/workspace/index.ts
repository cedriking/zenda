import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { workspaces } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'

export const workspaceModule = new Elysia({ prefix: '/workspace' })
  .get('/', async ({ workspaceId, set }) => {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId!)).limit(1)
    if (!ws) {
      set.status = 404
      return { error: 'Workspace not found' }
    }
    return ws
  })
  .patch('/', async ({ workspaceId, body, set }) => {
    const [updated] = await db
      .update(workspaces)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning()
    if (!updated) {
      set.status = 404
      return { error: 'Workspace not found' }
    }
    return updated
  }, {
    body: {
      name: 'string?',
      timezone: 'string?',
      country: 'string?',
      defaultLanguage: 'string?',
    },
  })
