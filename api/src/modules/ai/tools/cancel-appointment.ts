import { db } from '@zenda/db/client'
import { appointments } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { APPOINTMENT_TRANSITIONS } from '@zenda/shared'

interface ToolInput {
  appointmentId: string
  reason?: string
}

export async function cancelAppointment(workspaceId: string, input: ToolInput) {
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
  if (!validNext?.includes('cancelled')) {
    throw new Error(`Cannot cancel appointment in status: ${apt.status}`)
  }

  const [updated] = await db
    .update(appointments)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
      notes: input.reason ? `${apt.notes ?? ''}\nCancel reason: ${input.reason}`.trim() : apt.notes,
    })
    .where(eq(appointments.id, apt.id))
    .returning()

  return {
    appointmentId: updated.id,
    status: updated.status,
    message: 'Appointment cancelled',
  }
}

export const cancelAppointmentToolDef = {
  type: 'function' as const,
  function: {
    name: 'cancel_appointment',
    description: 'Cancel an existing appointment.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string', description: 'The appointment ID to cancel' },
        reason: { type: 'string', description: 'Optional cancellation reason' },
      },
      required: ['appointmentId'],
    },
  },
}
