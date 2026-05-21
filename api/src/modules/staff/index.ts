import { typedContext } from '../../middleware/typed-context.js'
import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { staffMembers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { createStaffMemberSchema, updateStaffMemberSchema } from '@zenda/shared'
import { logger } from '../../infra/logger.js'
import { notFound, badRequest, serverError } from '../../utils/errors.js'

export const staffModule = new Elysia({ prefix: '/staff' })
  .use(typedContext)

  .get('/', async ({ workspaceId, set }) => {
    try {
      return db.select().from(staffMembers).where(eq(staffMembers.workspaceId, workspaceId!))
    } catch (err) {
      logger.error('Failed to list staff', { error: (err as Error).message })
      return serverError(set, 'Failed to list staff')
    }
  })

  .post('/', async ({ workspaceId, body, set }) => {
    try {
      const parsed = createStaffMemberSchema.safeParse(body)
      if (!parsed.success) {
        return badRequest(set, 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '))
      }

      const { name, serviceIds } = parsed.data
      const [member] = await db
        .insert(staffMembers)
        .values({
          workspaceId: workspaceId!,
          name,
          serviceIds: serviceIds ?? [],
        })
        .returning()
      return member
    } catch (err) {
      logger.error('Failed to create staff member', { error: (err as Error).message })
      return serverError(set, 'Failed to create staff member')
    }
  }, {
    body: t.Object({
      name: t.String(),
      serviceIds: t.Optional(t.Array(t.String())),
    }),
  })

  .patch('/:id', async ({ workspaceId, params, body, set }) => {
    try {
      const parsed = updateStaffMemberSchema.safeParse(body)
      if (!parsed.success) {
        return badRequest(set, 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '))
      }

      const [updated] = await db
        .update(staffMembers)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(and(eq(staffMembers.id, params.id), eq(staffMembers.workspaceId, workspaceId!)))
        .returning()
      if (!updated) return notFound(set, 'Staff member not found')
      return updated
    } catch (err) {
      logger.error('Failed to update staff member', { error: (err as Error).message })
      return serverError(set, 'Failed to update staff member')
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      serviceIds: t.Optional(t.Array(t.String())),
      active: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params, set }) => {
    try {
      const result = await db
        .delete(staffMembers)
        .where(and(eq(staffMembers.id, params.id), eq(staffMembers.workspaceId, workspaceId!)))
        .returning()
      return { deleted: result.length > 0 }
    } catch (err) {
      logger.error('Failed to delete staff member', { error: (err as Error).message })
      return serverError(set, 'Failed to delete staff member')
    }
  })
