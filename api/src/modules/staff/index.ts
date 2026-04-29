import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { staffMembers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { createAppPlugin } from '../../middleware/app-plugin.js'

export const staffModule = new Elysia({ prefix: '/staff' })
  .use(createAppPlugin())

  .get('/', async ({ workspaceId }) => {
    return db.select().from(staffMembers).where(eq(staffMembers.workspaceId, workspaceId!))
  })

  .post('/', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const [member] = await db
      .insert(staffMembers)
      .values({
        workspaceId: workspaceId!,
        name: data.name as string,
        serviceIds: (data.serviceIds as string[]) ?? [],
      })
      .returning()
    return member
  }, {
    body: t.Object({
      name: t.String(),
      serviceIds: t.Optional(t.Array(t.String())),
    }),
  })

  .patch('/:id', async ({ workspaceId, params, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(staffMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(staffMembers.id, params.id), eq(staffMembers.workspaceId, workspaceId!)))
      .returning()
    if (!updated) return { error: 'Staff member not found' }
    return updated
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      serviceIds: t.Optional(t.Array(t.String())),
      active: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params }) => {
    const result = await db
      .delete(staffMembers)
      .where(and(eq(staffMembers.id, params.id), eq(staffMembers.workspaceId, workspaceId!)))
      .returning()
    return { deleted: result.length > 0 }
  })
