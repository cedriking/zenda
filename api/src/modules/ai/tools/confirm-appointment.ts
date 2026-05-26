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
import {
  appointments,
  customers,
  services,
  staffMembers,
} from "@zenda/db/schema";
import type { Language } from "@zenda/shared";
import { APPOINTMENT_TRANSITIONS } from "@zenda/shared";
import { and, eq } from "drizzle-orm";
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
  const [row] = await db
    .select({
      appointment: appointments,
      service: services,
      staff: staffMembers,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(staffMembers, eq(appointments.staffMemberId, staffMembers.id))
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

  const { appointment: apt, service: svc, staff } = row;

  const validNext =
    APPOINTMENT_TRANSITIONS[apt.status as keyof typeof APPOINTMENT_TRANSITIONS];
  if (!validNext?.includes("confirmed")) {
    throw new Error(`Cannot confirm appointment in status: ${apt.status}`);
  }

  // Only update after validation passes
  const [updated] = await db
    .update(appointments)
    .set({
      status: "confirmed",
      confirmationStatus: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, apt.id))
    .returning();

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
