import { db } from '@zenda/db/client'
import { appointments, services } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Language } from '@zenda/shared'

interface ToolInput {
  customerId: string
  serviceId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  staffMemberId?: string
  notes?: string
}

export async function bookAppointment(
  workspaceId: string,
  input: ToolInput,
  conversationId: string,
  _language: Language,
) {
  // Get service for duration
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.workspaceId, workspaceId)))
    .limit(1)

  if (!service) throw new Error('Service not found')

  const startAt = new Date(`${input.date}T${input.startTime}:00`)
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000)

  const [appointment] = await db
    .insert(appointments)
    .values({
      workspaceId,
      customerId: input.customerId,
      serviceId: input.serviceId,
      staffMemberId: input.staffMemberId ?? null,
      status: 'pending_confirmation',
      startAt,
      endAt,
      timezone: 'America/Mexico_City',
      sourceConversationId: conversationId,
      createdBy: 'ai',
      notes: input.notes ?? null,
    })
    .returning()

  return {
    appointmentId: appointment.id,
    status: appointment.status,
    service: service.name,
    date: input.date,
    startTime: input.startTime,
    endTime: `${String(endAt.getHours()).padStart(2, '0')}:${String(endAt.getMinutes()).padStart(2, '0')}`,
  }
}

export const bookAppointmentToolDef = {
  type: 'function' as const,
  function: {
    name: 'book_appointment',
    description: 'Book a new appointment for a customer. Creates appointment in pending_confirmation status.',
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Customer ID' },
        serviceId: { type: 'string', description: 'Service ID' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
        startTime: { type: 'string', description: 'Start time in HH:mm format' },
        staffMemberId: { type: 'string', description: 'Optional staff member preference' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['customerId', 'serviceId', 'date', 'startTime'],
    },
  },
}
