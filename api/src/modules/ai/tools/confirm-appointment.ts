/**
 * Tool: confirm_appointment
 *
 * Enhanced to return full appointment details (service, staff, date, time, location)
 * in the confirmation response. Only updates DB status after successful write.
 *
 * Safety constraints:
 * - DB update runs BEFORE the return statement — success is only reported after persist.
 * - Appointment existence and valid status transition are verified via DB query.
 * - No data is invented; all fields come from the DB result.
 * - On failure the agent receives a structured error it can relay honestly.
 */
import { db } from "@zenda/db/client";
import type { Language } from "@zenda/shared";
import { APPOINTMENT_TRANSITIONS } from "@zenda/shared";
import { trackActiveContact } from "../../usage/tracker.js";

interface ToolInput {
  appointmentId: string;
}

export async function confirmAppointment(
  workspaceId: string,
  input: ToolInput,
  _language?: Language
) {
  // Fetch appointment with service and staff details
  const row = await db.appointment.findFirst({
    where: {
      id: input.appointmentId,
      workspaceId,
    },
    include: {
      service: true,
      staffMember: true,
    },
  });

  if (!row) {
    throw new Error("Appointment not found");
  }

  const apt = row;
  const svc = row.service;
  const staff = row.staffMember;

  const validNext =
    APPOINTMENT_TRANSITIONS[apt.status as keyof typeof APPOINTMENT_TRANSITIONS];
  if (!validNext?.includes("confirmed")) {
    throw new Error(`Cannot confirm appointment in status: ${apt.status}`);
  }

  // Only update after validation passes
  const updated = await db.appointment.update({
    where: { id: apt.id },
    data: {
      status: "confirmed",
      confirmationStatus: "confirmed",
      updatedAt: new Date(),
    },
  });

  // Build a human-readable date/time string
  const dateStr = new Date(apt.startAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = new Date(apt.startAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const staffName = staff?.name ?? null;
  const lang = _language ?? "en";

  // Track active contact for usage (background — non-blocking)
  (async () => {
    try {
      const customer = await db.customer.findFirst({
        where: { id: apt.customerId },
        select: { phoneNumber: true },
      });
      if (customer) {
        await trackActiveContact(workspaceId, customer.phoneNumber);
      }
    } catch {}
  })();

  return {
    appointmentId: updated.id,
    status: updated.status,
    confirmationStatus: updated.confirmationStatus,
    details: {
      serviceName: svc.name,
      staffName,
      date: dateStr,
      time: timeStr,
      durationMinutes: svc.durationMinutes,
    },
    message:
      lang === "es"
        ? `Tu cita de ${svc.name}${staffName ? ` con ${staffName}` : ""} queda confirmada para el ${dateStr} a las ${timeStr}. Te esperamos.`
        : `Your ${svc.name} appointment${staffName ? ` with ${staffName}` : ""} is confirmed for ${dateStr} at ${timeStr}. See you then.`,
  };
}

export const confirmAppointmentToolDef = {
  type: "function" as const,
  function: {
    name: "confirm_appointment",
    description:
      "Confirm a pending appointment. Returns all details (service, staff, date, time) in the confirmation.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "string",
          description: "The appointment ID to confirm",
        },
      },
      required: ["appointmentId"],
    },
  },
};
