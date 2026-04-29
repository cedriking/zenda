import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { customers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCustomerProfile } from './customer-profile.js'

export const customerModule = new Elysia({ prefix: '/customers' })

  .get('/', async ({ workspaceId }) => {
    return db.select().from(customers).where(eq(customers.workspaceId, workspaceId!))
  })

  .get('/:id', async ({ workspaceId, params }) => {
    return getCustomerProfile(workspaceId!, params.id)
  })

  .patch('/:id', async ({ workspaceId, params, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(customers.id, params.id), eq(customers.workspaceId, workspaceId!)))
      .returning()
    if (!updated) return { error: 'Customer not found' }
    return updated
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      language: t.Optional(t.String()),
    }),
  })
