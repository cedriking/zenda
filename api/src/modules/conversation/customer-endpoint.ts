import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { customers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCustomerProfile } from './customer-profile.js'
import { logger } from '../../infra/logger.js'
import { notFound, serverError } from '../../utils/errors.js'

export const customerModule = new Elysia({ prefix: '/customers' })

  .get('/', async ({ workspaceId, set }) => {
    try {
      return await db.select().from(customers).where(eq(customers.workspaceId, workspaceId!))
    } catch (err) {
      logger.error('Failed to list customers', { error: (err as Error).message })
      return serverError(set, 'Failed to list customers')
    }
  })

  .get('/:id', async ({ workspaceId, params, set }) => {
    try {
      const profile = await getCustomerProfile(workspaceId!, params.id)
      if (!profile) return notFound(set, 'Customer not found')
      return profile
    } catch (err) {
      logger.error('Failed to get customer', { error: (err as Error).message })
      return serverError(set, 'Failed to get customer')
    }
  })

  .patch('/:id', async ({ workspaceId, params, body, set }) => {
    try {
      const data = body as Record<string, unknown>
      const [updated] = await db
        .update(customers)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(customers.id, params.id), eq(customers.workspaceId, workspaceId!)))
        .returning()
      if (!updated) return notFound(set, 'Customer not found')
      return updated
    } catch (err) {
      logger.error('Failed to update customer', { error: (err as Error).message })
      return serverError(set, 'Failed to update customer')
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      language: t.Optional(t.String()),
    }),
  })
