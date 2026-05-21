import { typedContext } from '../../middleware/typed-context.js'
import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { availabilityRules } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { createAvailabilityRuleSchema } from '@zenda/shared'
import { logger } from '../../infra/logger.js'
import { notFound, badRequest, serverError } from '../../utils/errors.js'

export const availabilityModule = new Elysia({ prefix: '/availability' })
  .use(typedContext)

  .get('/', async ({ workspaceId, query, set }) => {
    try {
      const { staffMemberId } = query as Record<string, string>
      const conditions = [eq(availabilityRules.workspaceId, workspaceId!)]
      if (staffMemberId) conditions.push(eq(availabilityRules.staffMemberId, staffMemberId))

      return db.select().from(availabilityRules).where(and(...conditions))
    } catch (err) {
      logger.error('Failed to list availability rules', { error: (err as Error).message })
      return serverError(set, 'Failed to list availability rules')
    }
  })

  .post('/', async ({ workspaceId, body, set }) => {
    try {
      const parsed = createAvailabilityRuleSchema.safeParse(body)
      if (!parsed.success) {
        return badRequest(set, 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '))
      }

      const { staffMemberId, dayOfWeek, startTime, endTime, available } = parsed.data
      const [rule] = await db
        .insert(availabilityRules)
        .values({
          workspaceId: workspaceId!,
          staffMemberId: staffMemberId ?? null,
          dayOfWeek,
          startTime,
          endTime,
          available: available ?? true,
        })
        .returning()
      return rule
    } catch (err) {
      logger.error('Failed to create availability rule', { error: (err as Error).message })
      return serverError(set, 'Failed to create availability rule')
    }
  }, {
    body: t.Object({
      staffMemberId: t.Optional(t.String()),
      dayOfWeek: t.Number(),
      startTime: t.String(),
      endTime: t.String(),
      available: t.Optional(t.Boolean()),
    }),
  })

  .patch('/:id', async ({ workspaceId, params, body, set }) => {
    try {
      const data = body as Record<string, unknown>
      const [updated] = await db
        .update(availabilityRules)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(availabilityRules.id, params.id), eq(availabilityRules.workspaceId, workspaceId!)))
        .returning()
      if (!updated) return notFound(set, 'Availability rule not found')
      return updated
    } catch (err) {
      logger.error('Failed to update availability rule', { error: (err as Error).message })
      return serverError(set, 'Failed to update availability rule')
    }
  }, {
    body: t.Object({
      dayOfWeek: t.Optional(t.Number()),
      startTime: t.Optional(t.String()),
      endTime: t.Optional(t.String()),
      available: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params, set }) => {
    try {
      const result = await db
        .delete(availabilityRules)
        .where(and(eq(availabilityRules.id, params.id), eq(availabilityRules.workspaceId, workspaceId!)))
        .returning()
      return { deleted: result.length > 0 }
    } catch (err) {
      logger.error('Failed to delete availability rule', { error: (err as Error).message })
      return serverError(set, 'Failed to delete availability rule')
    }
  })
