/**
 * Tool: reschedule_appointment
 *
 * Enhanced to check the business rescheduling window (reschedulingWindowHours)
 * from businessProfiles. If the request is within the window, returns a message
 * indicating it is too late and offers alternatives.
 *
 * Safety constraints:
 * - DB update runs BEFORE the return statement — success is only reported after persist.
 * - Appointment existence and valid status transition are verified via DB query.
 * - Duration comes from the DB service lookup, never hardcoded.
 * - On failure the agent receives a structured error it can relay honestly.
 */
import { db } from "@zenda/db/client";
import {
  appointments,
  businessProfiles,
  customers,
  services,
  staffMembers,
} from "@zenda/db/schema";
import type { Language } from "@zenda/shared";
import { APPOINTMENT_TRANSITIONS } from "@zenda/shared";
import { and, eq } from "drizzle-orm";
import { logAppointmentAudit } from "../../audit/logger.js";
import { trackActiveContact } from "../../usage/tracker.js";

interface ToolInput {
  appointmentId: string;
  newDate: string; // YYYY-MM-DD
  newStartTime: string; // HH:mm
}

export async function rescheduleAppointment(
  workspaceId: string,
  input: ToolInput,
  _language?: Language
) {
  // Fetch appointment with service and business profile
  const [row] = await db
    .select({
      appointment: appointments,
      service: services,
      staff: staffMembers,
      business: businessProfiles,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(staffMembers, eq(appointments.staffMemberId, staffMembers.id))
    .innerJoin(
      businessProfiles,
      eq(appointments.workspaceId, businessProfiles.workspaceId)
    )
    .where(
      and(
        eq(appointments.id, input.appointmentId),
        eq(appointments.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!row) {
    throw new Error("Appointment not found");
  }

  const { appointment: apt, service: svc, staff, business: biz } = row;

  // Validate status transition
  const validNext =
    APPOINTMENT_TRANSITIONS[apt.status as keyof typeof APPOINTMENT_TRANSITIONS];
  if (
    !(
      validNext?.includes("reschedule_requested") ||
      validNext?.includes("rescheduled")
    )
  ) {
    throw new Error(`Cannot reschedule appointment in status: ${apt.status}`);
  }

  // ── Check rescheduling window ──
  const windowHours = biz.reschedulingWindowHours ?? 2;
  const hoursUntilAppointment =
    (new Date(apt.startAt).getTime() - Date.now()) / 3_600_000;

  if (hoursUntilAppointment < windowHours) {
    const lang = _language ?? "en";
    const msg =
      lang === "es"
        ? `Lo siento, no es posible reprogramar esta cita. El plazo permitido es de ${windowHours} horas antes de la cita y ahora mismo faltan menos de ${Math.max(0, Math.round(hoursUntilAppointment))} horas. Si necesitas ayuda, puedo comunicarte con alguien del equipo.`
        : `I'm sorry, this appointment can no longer be rescheduled. The cutoff is ${windowHours} hours before the appointment and there are fewer than ${Math.max(0, Math.round(hoursUntilAppointment))} hours remaining. I can connect you with someone on the team if you'd like.`;

    return {
      rescheduleBlocked: true,
      reason: "within_window",
      windowHours,
      hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10,
      message: msg,
    };
  }

  // ── Perform reschedule ──
  const durationMinutes = svc.durationMinutes ?? 60;
  const startAt = new Date(`${input.newDate}T${input.newStartTime}:00`);
  const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
  const endTime = `${String(endAt.getHours()).padStart(2, "0")}:${String(endAt.getMinutes()).padStart(2, "0")}`;

  const staffName = staff?.name ?? null;

  const [updated] = await db
    .update(appointments)
    .set({
      status: "reschedule_requested",
      startAt,
      endAt,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, apt.id))
    .returning();

  logAppointmentAudit(workspaceId, updated.id, "appointment_rescheduled", {
    channel: "whatsapp",
    channelProvider: "baileys",
    customerId: apt.customerId,
    serviceId: svc.id,
  }).catch(() => {});

  const newDateStr = startAt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const newTimeStr = startAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const lang = _language ?? "en";
  const confirmMsg =
    lang === "es"
      ? `Listo. Tu cita de ${svc.name}${staffName ? ` con ${staffName}` : ""} ha sido reprogramada para el ${newDateStr} a las ${newTimeStr}.`
      : `Done. Your ${svc.name} appointment${staffName ? ` with ${staffName}` : ""} has been moved to ${newDateStr} at ${newTimeStr}.`;

  // Track active contact for usage (background — non-blocking)
  (async () => {
    try {
      const [customer] = await db
        .select({ phoneNumber: customers.phoneNumber })
        .from(customers)
        .where(eq(customers.id, apt.customerId))
        .limit(1);
      if (customer) {
        await trackActiveContact(workspaceId, customer.phoneNumber);
      }
    } catch {}
  })();

  return {
    appointmentId: updated.id,
    status: updated.status,
    newDate: input.newDate,
    newStartTime: input.newStartTime,
    endTime,
    serviceName: svc.name,
    staffName,
    message: confirmMsg,
  };
}

export const rescheduleAppointmentToolDef = {
  type: "function" as const,
  function: {
    name: "reschedule_appointment",
    description:
      "Reschedule an existing appointment. Checks the business rescheduling window and blocks changes that are too close to the appointment time.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "string",
          description: "The appointment ID to reschedule",
        },
        newDate: {
          type: "string",
          description: "New date in YYYY-MM-DD format",
        },
        newStartTime: {
          type: "string",
          description: "New start time in HH:mm format",
        },
      },
      required: ["appointmentId", "newDate", "newStartTime"],
    },
  },
};
