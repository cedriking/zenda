import { APPOINTMENT_TRANSITIONS, TERMINAL_STATUSES } from '@zenda/shared'
import type { AppointmentStatus } from '@zenda/shared'

export class InvalidTransitionError extends Error {
  constructor(from: AppointmentStatus, to: AppointmentStatus) {
    super(`Invalid transition: ${from} -> ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export function validateTransition(current: AppointmentStatus, target: AppointmentStatus): void {
  if (current === target) return
  const validNext = APPOINTMENT_TRANSITIONS[current]
  if (!validNext) throw new InvalidTransitionError(current, target)
  if (!validNext.includes(target)) throw new InvalidTransitionError(current, target)
}

export function isTerminal(status: AppointmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export function getValidTransitions(status: AppointmentStatus): AppointmentStatus[] {
  return APPOINTMENT_TRANSITIONS[status] ?? []
}
