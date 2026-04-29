import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { availabilityRules } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { createAppPlugin } from '../../middleware/app-plugin.js'

export const availabilityModule = new Elysia({ prefix: '/availability' })
  .use(createAppPlugin())

  .get('/', async ({ workspaceId, query }) => {
    const { staffMemberId } = query as Record<string, string>
    const conditions = [eq(availabilityRules.workspaceId, workspaceId!)]
    if (staffMemberId) conditions.push(eq(availabilityRules.staffMemberId, staffMemberId))

    return db.select().from(availabilityRules).where(and(...conditions))
  })

  .post('/', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const [rule] = await db
      .insert(availabilityRules)
      .values({
        workspaceId: workspaceId!,
        staffMemberId: (data.staffMemberId as string) ?? null,
        dayOfWeek: data.dayOfWeek as number,
        startTime: data.startTime as string,
        endTime: data.endTime as string,
        available: (data.available as boolean) ?? true,
      })
      .returning()
    return rule
  }, {
    body: t.Object({
      staffMemberId: t.Optional(t.String()),
      dayOfWeek: t.Number(),
      startTime: t.String(),
      endTime: t.String(),
      available: t.Optional(t.Boolean()),
    }),
  })

  .patch('/:id', async ({ workspaceId, params, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(availabilityRules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(availabilityRules.id, params.id), eq(availabilityRules.workspaceId, workspaceId!)))
      .returning()
    if (!updated) return { error: 'Availability rule not found' }
    return updated
  }, {
    body: t.Object({
      dayOfWeek: t.Optional(t.Number()),
      startTime: t.Optional(t.String()),
      endTime: t.Optional(t.String()),
      available: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params }) => {
    const result = await db
      .delete(availabilityRules)
      .where(and(eq(availabilityRules.id, params.id), eq(availabilityRules.workspaceId, workspaceId!)))
      .returning()
    return { deleted: result.length > 0 }
  })
