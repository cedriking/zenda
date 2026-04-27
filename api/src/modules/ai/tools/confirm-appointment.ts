import { db } from '@zenda/db/client'
import { appointments } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { APPOINTMENT_TRANSITIONS } from '@zenda/shared'

interface ToolInput {
  appointmentId: string
}

export async function confirmAppointment(workspaceId: string, input: ToolInput) {
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
  if (!validNext?.includes('confirmed')) {
    throw new Error(`Cannot confirm appointment in status: ${apt.status}`)
  }

  const [updated] = await db
    .update(appointments)
    .set({ status: 'confirmed', confirmationStatus: 'confirmed', updatedAt: new Date() })
    .where(eq(appointments.id, apt.id))
    .returning()

  return {
    appointmentId: updated.id,
    status: updated.status,
    message: 'Appointment confirmed successfully',
  }
}

export const confirmAppointmentToolDef = {
  type: 'function' as const,
  function: {
    name: 'confirm_appointment',
    description: 'Confirm a pending appointment. The appointment must be in pending_confirmation status.',
    parameters: {
      type: 'object',
      properties: {
        appointmentId: { type: 'string', description: 'The appointment ID to confirm' },
      },
      required: ['appointmentId'],
    },
  },
}
