import type { AppointmentStatus } from '../types/enums.js'

export const APPOINTMENT_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested: ['pending_confirmation', 'cancelled'],
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['reminder_sent', 'reschedule_requested', 'cancel_requested', 'completed', 'no_show'],
  reminder_sent: ['client_confirmed', 'reschedule_requested', 'cancel_requested', 'completed', 'no_show'],
  client_confirmed: ['completed', 'no_show', 'reschedule_requested', 'cancel_requested'],
  reschedule_requested: ['rescheduled', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  cancel_requested: ['cancelled'],
  cancelled: [],
  completed: [],
  no_show: [],
  needs_attention: ['confirmed', 'cancelled', 'reschedule_requested'],
}

export const TERMINAL_STATUSES: AppointmentStatus[] = ['cancelled', 'completed', 'no_show']
