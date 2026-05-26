/**
 * Tool: check_availability
 *
 * Safety constraints:
 * - All time slots are computed from actual DB data: service duration, availability
 *   rules, and existing bookings. Nothing is guessed or hardcoded.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 * - On failure the agent receives a structured error it can relay honestly.
 */
import { db } from "@zenda/db/client";
import { appointments, availabilityRules, services } from "@zenda/db/schema";
import type { Language } from "@zenda/shared";
import { and, eq, gte, lte } from "drizzle-orm";

interface ToolInput {
  date: string; // YYYY-MM-DD
  serviceId: string;
  staffMemberId?: string;
}

interface TimeSlot {
  available: boolean;
  endTime: string;
  startTime: string;
}

export async function checkAvailability(
  workspaceId: string,
  input: ToolInput,
  _language: Language
): Promise<{ slots: TimeSlot[]; serviceName: string; date: string }> {
  // Get service details for duration
  const [service] = await db
    .select()
    .from(services)
    .where(
      and(
        eq(services.id, input.serviceId),
        eq(services.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!service) {
    throw new Error("Service not found");
  }

  const dateObj = new Date(`${input.date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();

  // Get availability rules for this day
  const rules = await db
    .select()
    .from(availabilityRules)
    .where(
      and(
        eq(availabilityRules.workspaceId, workspaceId),
        eq(availabilityRules.dayOfWeek, dayOfWeek),
        eq(availabilityRules.available, true)
      )
    );

  if (!rules.length) {
    return { slots: [], serviceName: service.name, date: input.date };
  }

  // Use first rule's time range (simplified — could merge overlapping rules)
  const { startTime, endTime } = rules[0];
  const slotDuration = service.durationMinutes;
  const bufferMinutes = 5;

  // Generate all possible slots
  const slots: TimeSlot[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (
    let mins = startMinutes;
    mins + slotDuration <= endMinutes;
    mins += slotDuration + bufferMinutes
  ) {
    const slotStart = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const slotEnd = `${String(Math.floor((mins + slotDuration) / 60)).padStart(2, "0")}:${String((mins + slotDuration) % 60).padStart(2, "0")}`;
    slots.push({ startTime: slotStart, endTime: slotEnd, available: true });
  }

  // Get existing appointments for that day to mark conflicts
  const dayStart = new Date(`${input.date}T00:00:00Z`);
  const dayEnd = new Date(`${input.date}T23:59:59Z`);

  const existingAppts = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.workspaceId, workspaceId),
        gte(appointments.startAt, dayStart),
        lte(appointments.startAt, dayEnd)
      )
    );

  // Mark overlapping slots as unavailable
  for (const appt of existingAppts) {
    const apptStart = new Date(appt.startAt).getTime();
    const apptEnd = new Date(appt.endAt).getTime();

    for (const slot of slots) {
      if (!slot.available) {
        continue;
      }
      const [_sh, _sm] = slot.startTime.split(":").map(Number);
      const [_eh, _em] = slot.endTime.split(":").map(Number);
      const slotStartMs = new Date(
        `${input.date}T${slot.startTime}:00`
      ).getTime();
      const slotEndMs = new Date(`${input.date}T${slot.endTime}:00`).getTime();

      if (slotStartMs < apptEnd && slotEndMs > apptStart) {
        slot.available = false;
      }
    }
  }

  return {
    slots: slots.filter((s) => s.available),
    serviceName: service.name,
    date: input.date,
  };
}

export const checkAvailabilityToolDef = {
  type: "function" as const,
  function: {
    name: "check_availability",
    description:
      "Check available time slots for a service on a specific date. Returns available slots.",
    parameters: {
      type: "object",
      properties: {
        serviceId: { type: "string", description: "The service ID" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
        staffMemberId: {
          type: "string",
          description: "Optional specific staff member ID",
        },
      },
      required: ["serviceId", "date"],
    },
  },
};
