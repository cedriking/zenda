import { db } from '@zenda/db/client'
import { appointments, services } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { APPOINTMENT_TRANSITIONS } from '@zenda/shared'

interface ToolInput {
  appointmentId: string
  newDate: string // YYYY-MM-DD
  newStartTime: string // HH:mm
}

export async function rescheduleAppointment(workspaceId: string, input: ToolInput) {
  const [apt] = await db
    .select()
    .from(appointments)
    .where(and(
      eq(appointments.id, input.appointmentId),
      eq(appointments.workspaceId, workspaceId),
    ))
    .limit(1)

  if (!apt) throw new Error('Appointment not found')

  const validNext = APPOINTMENT_TRANSITIONS[apt.status as keyof typeof APPOINTMENT_TRANSITIONS]
  if (!validNext?.includes('reschedule_requested') && !validNext?.includes('rescheduled')) {
    throw new Error(`Cannot reschedule appointment in status: ${apt.status}`)
  }

  // Get service for duration
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, apt.serviceId))
    .limit(1)

  const durationMinutes = service?.durationMinutes ?? 60
  const startAt = new Date(`${input.newDate}T${input.newStartTime}:00`)
  const endAt = new Date(startAt.getTime() + durationMinutes * 60_000)

  const [updated] = await db
    .update(appointments)
    .set({
      status: 'rescheduled',
      startAt,
      endAt,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, apt.id))
    .returning()

  return {
    appointmentId: updated.id,
    status: updated.status,
    newDate: input.newDate,
    newStartTime: input.newStartTime,
  }
}

export const rescheduleAppointmentToolDef = {
  type: 'function' as const,
  function: {
    name: 'reschedule_appointment',
    description: 'Reschedule an existing appointment to a new date and time.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string', description: 'The appointment ID to reschedule' },
        newDate: { type: 'string', description: 'New date in YYYY-MM-DD format' },
        newStartTime: { type: 'string', description: 'New start time in HH:mm format' },
      },
      required: ['appointmentId', 'newDate', 'newStartTime'],
    },
  },
}
