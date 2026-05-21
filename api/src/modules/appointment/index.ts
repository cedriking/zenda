import { typedContext } from '../../middleware/typed-context.js'
import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { appointments } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { createAppointmentSchema, updateAppointmentStatusSchema } from '@zenda/shared'
import { validateTransition } from './state-machine.js'
import { getAvailableSlots } from './availability-engine.js'
import { logger } from '../../infra/logger.js'
import { notFound, badRequest, conflict, serverError } from '../../utils/errors.js'

export const appointmentModule = new Elysia({ prefix: '/appointments' })
  .use(typedContext)

  // List appointments
  .get('/', async ({ workspaceId, query, set }) => {
    try {
      const { status, limit = '50', offset = '0' } = query as Record<string, string>
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50))
      const parsedOffset = Math.max(0, Number(offset) || 0)

      const conditions = [eq(appointments.workspaceId, workspaceId!)]
      if (status) conditions.push(eq(appointments.status, status as any))

      return db
        .select()
        .from(appointments)
        .where(and(...conditions))
        .orderBy(desc(appointments.startAt))
        .limit(parsedLimit)
        .offset(parsedOffset)
    } catch (err) {
      logger.error('Failed to list appointments', { error: (err as Error).message })
      return serverError(set, 'Failed to list appointments')
    }
  })

  // Get appointment by ID
  .get('/:id', async ({ workspaceId, params, set }) => {
    try {
      const [apt] = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, params.id), eq(appointments.workspaceId, workspaceId!)))
        .limit(1)

      if (!apt) return notFound(set, 'Appointment not found')
      return apt
    } catch (err) {
      logger.error('Failed to get appointment', { error: (err as Error).message })
      return serverError(set, 'Failed to get appointment')
    }
  })

  // Create appointment
  .post('/', async ({ workspaceId, body, set }) => {
    try {
      const parsed = createAppointmentSchema.safeParse(body)
      if (!parsed.success) {
        return badRequest(set, 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '))
      }

      const { customerId, serviceId, staffMemberId, startAt, timezone, sourceConversationId, createdBy } = parsed.data

      const durationMinutes = ((body as Record<string, unknown>).durationMinutes as number) ?? 60
      const endAt = new Date(new Date(startAt).getTime() + durationMinutes * 60_000)

      const [apt] = await db
        .insert(appointments)
        .values({
          workspaceId: workspaceId!,
          customerId,
          serviceId,
          staffMemberId: staffMemberId ?? null,
          status: 'pending_confirmation',
          startAt: new Date(startAt),
          endAt,
          timezone,
          sourceConversationId: sourceConversationId ?? null,
          createdBy: createdBy ?? 'owner',
          notes: ((body as Record<string, unknown>).notes as string) ?? null,
        })
        .returning()

      logger.info('Appointment created', { workspaceId, appointmentId: apt.id })
      return apt
    } catch (err) {
      logger.error('Failed to create appointment', { error: (err as Error).message })
      return serverError(set, 'Failed to create appointment')
    }
  }, {
    body: t.Object({
      customerId: t.String(),
      serviceId: t.String(),
      startAt: t.String(),
      timezone: t.String(),
      staffMemberId: t.Optional(t.String()),
      sourceConversationId: t.Optional(t.String()),
      createdBy: t.Optional(t.String()),
      durationMinutes: t.Optional(t.Number()),
      notes: t.Optional(t.String()),
    }),
  })

  // Update appointment status
  .patch('/:id/status', async ({ workspaceId, params, body, set }) => {
    try {
      const parsed = updateAppointmentStatusSchema.safeParse(body)
      if (!parsed.success) {
        return badRequest(set, 'Validation failed: ' + parsed.error.issues.map(i => i.message).join(', '))
      }

      const { status } = parsed.data

      const [apt] = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, params.id), eq(appointments.workspaceId, workspaceId!)))
        .limit(1)

      if (!apt) return notFound(set, 'Appointment not found')

      try {
        validateTransition(apt.status, status)
      } catch (err) {
        return conflict(set, (err as Error).message)
      }

      const updates: Record<string, unknown> = { status, updatedAt: new Date() }
      if (status === 'cancelled') updates.cancelledAt = new Date()
      if (status === 'completed') updates.completedAt = new Date()

      const [updated] = await db
        .update(appointments)
        .set(updates)
        .where(eq(appointments.id, apt.id))
        .returning()

      logger.info('Appointment status updated', { workspaceId, appointmentId: apt.id, from: apt.status, to: status })
      return updated
    } catch (err) {
      logger.error('Failed to update appointment status', { error: (err as Error).message })
      return serverError(set, 'Failed to update appointment status')
    }
  }, {
    body: t.Object({
      status: t.String(),
      notes: t.Optional(t.String()),
    }),
  })

  // Get available slots
  .get('/availability', async ({ workspaceId, query, set }) => {
    try {
      const { serviceId, date, staffMemberId } = query as Record<string, string>
      if (!serviceId || !date) return badRequest(set, 'serviceId and date are required')

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return badRequest(set, 'date must be in YYYY-MM-DD format')
      }

      return getAvailableSlots({ workspaceId: workspaceId!, serviceId, date, staffMemberId })
    } catch (err) {
      logger.error('Failed to get availability', { error: (err as Error).message })
      return serverError(set, 'Failed to get availability')
    }
  })
