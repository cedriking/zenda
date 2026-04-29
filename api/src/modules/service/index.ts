import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { services } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'

export const serviceModule = new Elysia({ prefix: '/services' })

  .get('/', async ({ workspaceId }) => {
    return db.select().from(services).where(eq(services.workspaceId, workspaceId!))
  })

  .post('/', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const [svc] = await db
      .insert(services)
      .values({
        workspaceId: workspaceId!,
        name: data.name as string,
        description: (data.description as string) ?? null,
        durationMinutes: data.durationMinutes as number,
        priceCents: (data.priceCents as number) ?? null,
      })
      .returning()
    return svc
  }, {
    body: t.Object({
      name: t.String(),
      description: t.Optional(t.String()),
      durationMinutes: t.Number(),
      priceCents: t.Optional(t.Number()),
    }),
  })

  .patch('/:id', async ({ workspaceId, params, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(services.id, params.id), eq(services.workspaceId, workspaceId!)))
      .returning()
    if (!updated) return { error: 'Service not found' }
    return updated
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String()),
      durationMinutes: t.Optional(t.Number()),
      priceCents: t.Optional(t.Number()),
      active: t.Optional(t.Boolean()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params }) => {
    const result = await db
      .delete(services)
      .where(and(eq(services.id, params.id), eq(services.workspaceId, workspaceId!)))
      .returning()
    return { deleted: result.length > 0 }
  })
