import { z } from 'zod'
import type { AppointmentStatus } from '../types/enums.js'

export const createAppointmentSchema = z.object({
  customerId: z.uuid(),
  serviceId: z.uuid(),
  staffMemberId: z.uuid().optional(),
  startAt: z.iso.datetime(),
  timezone: z.string().min(1),
  sourceConversationId: z.uuid().optional(),
  createdBy: z.enum(['ai', 'owner']).optional().default('owner'),
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'requested',
    'pending_confirmation',
    'confirmed',
    'reminder_sent',
    'client_confirmed',
    'reschedule_requested',
    'rescheduled',
    'cancel_requested',
    'cancelled',
    'completed',
    'no_show',
    'needs_attention',
  ] as [AppointmentStatus, ...AppointmentStatus[]]),
  notes: z.string().optional(),
})

export const rescheduleAppointmentSchema = z.object({
  newStartAt: z.iso.datetime(),
  staffMemberId: z.uuid().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>
