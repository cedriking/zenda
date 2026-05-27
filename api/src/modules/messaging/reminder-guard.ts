/**
 * Reminder Deduplication Guard (§15)
 *
 * Before any reminder send, checks that:
 * - Same reminder type hasn't been sent for this appointment
 * - Appointment isn't cancelled/completed
 * - Appointment time hasn't passed
 */
import { db } from "@zenda/db/client";
import type { ReminderType } from "@zenda/shared";
import { shouldRestrictProactive } from "../usage/tracker.js";

interface ReminderGuardResult {
  canSend: boolean;
  reason?: string;
}

/**
 * Check if a reminder can be sent for the given appointment.
 */
export async function canSendReminder(
  appointmentId: string,
  reminderType: ReminderType,
  workspaceId?: string
): Promise<ReminderGuardResult> {
  // 0. Usage gate: suppress reminders when at 100% of active contact limit
  if (workspaceId) {
    const restricted = await shouldRestrictProactive(workspaceId);
    if (restricted) {
      return {
        canSend: false,
        reason: "Usage limit reached — proactive messages suppressed",
      };
    }
  }
  // 1. Check for duplicate
  const existing = await db.sentReminderLog.findFirst({
    where: {
      appointmentId,
      reminderType,
    },
  });

  if (existing) {
    return {
      canSend: false,
      reason: `Reminder '${reminderType}' already sent for this appointment`,
    };
  }

  // 2. Check appointment state
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, startAt: true },
  });

  if (!appointment) {
    return { canSend: false, reason: "Appointment not found" };
  }

  if (appointment.status === "cancelled") {
    return { canSend: false, reason: "Appointment has been cancelled" };
  }

  if (appointment.status === "completed") {
    return { canSend: false, reason: "Appointment has been completed" };
  }

  if (appointment.status === "no_show") {
    return { canSend: false, reason: "Appointment was marked as no-show" };
  }

  // 3. Check appointment time hasn't passed
  if (new Date(appointment.startAt) < new Date()) {
    return { canSend: false, reason: "Appointment time has already passed" };
  }

  return { canSend: true };
}

/**
 * Record that a reminder was sent.
 */
export async function recordReminderSent(
  appointmentId: string,
  reminderType: ReminderType
): Promise<void> {
  await db.sentReminderLog.create({
    data: {
      appointmentId,
      reminderType,
      sentAt: new Date(),
    },
  });
}
