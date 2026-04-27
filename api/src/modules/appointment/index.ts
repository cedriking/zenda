import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { appointments } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { validateTransition } from './state-machine.js'
import { getAvailableSlots } from './availability-engine.js'
import { logger } from '../../infra/logger.js'

export const appointmentModule = new Elysia({ prefix: '/appointments' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  // List appointments
  .get('/', async ({ workspaceId, query }) => {
    const { status, limit = '50', offset = '0' } = query as Record<string, string>

    const conditions = [eq(appointments.workspaceId, workspaceId!)]
    if (status) conditions.push(eq(appointments.status, status as any))

    return db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(desc(appointments.startAt))
      .limit(Number(limit))
      .offset(Number(offset))
  })

  // Get appointment by ID
  .get('/:id', async ({ workspaceId, params }) => {
    const [apt] = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, params.id), eq(appointments.workspaceId, workspaceId!)))
      .limit(1)

    if (!apt) return { error: 'Appointment not found' }
    return apt
  })

  // Create appointment
  .post('/', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const startAt = new Date(`${data.date}T${data.startTime}:00`)
    const endAt = new Date(startAt.getTime() + ((data.durationMinutes as number) ?? 60) * 60_000)

    const [apt] = await db
      .insert(appointments)
      .values({
        workspaceId: workspaceId!,
        customerId: data.customerId as string,
        serviceId: data.serviceId as string,
        staffMemberId: (data.staffMemberId as string) ?? null,
        status: (data.status as 'pending_confirmation') ?? 'pending_confirmation',
        startAt,
        endAt,
        timezone: (data.timezone as string) ?? 'America/Mexico_City',
        sourceConversationId: (data.conversationId as string) ?? null,
        createdBy: 'owner',
        notes: (data.notes as string) ?? null,
      })
      .returning()

    logger.info('Appointment created', { workspaceId, appointmentId: apt.id })
    return apt
  }, {
    body: t.Object({
      customerId: t.String(),
      serviceId: t.String(),
      date: t.String(),
      startTime: t.String(),
      durationMinutes: t.Optional(t.Number()),
      staffMemberId: t.Optional(t.String()),
      timezone: t.Optional(t.String()),
      conversationId: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      status: t.Optional(t.String()),
    }),
  })

  // Update appointment status
  .patch('/:id/status', async ({ workspaceId, params, body }) => {
    const { status } = body as { status: string }

    const [apt] = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, params.id), eq(appointments.workspaceId, workspaceId!)))
      .limit(1)

    if (!apt) return { error: 'Appointment not found' }

    try {
      validateTransition(apt.status, status)
    } catch (err) {
      return { error: (err as Error).message }
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
  }, {
    body: t.Object({
      status: t.String(),
    }),
  })

  // Get available slots
  .get('/availability', async ({ workspaceId, query }) => {
    const { serviceId, date, staffMemberId } = query as Record<string, string>
    if (!serviceId || !date) return { error: 'serviceId and date are required' }

    return getAvailableSlots({ workspaceId: workspaceId!, serviceId, date, staffMemberId })
  })
