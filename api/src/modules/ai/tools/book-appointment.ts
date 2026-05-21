/**
 * Tool: book_appointment
 *
 * Multi-turn booking flow:
 * - If required fields (serviceId, date, startTime) are missing, returns needsInfo
 *   with a single follow-up question.
 * - Once all fields are present, returns the details for customer confirmation
 *   without writing to the calendar.
 * - Only when confirmed=true does the appointment get created.
 *
 * Safety constraints:
 * - Never claims success before the DB write completes.
 * - All appointment data comes from the DB service lookup — nothing is invented.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 * - On failure the agent receives a structured error it can relay honestly.
 */
import { db } from "@zenda/db/client";
import {
  appointments,
  customers,
  services,
  staffMembers,
  workspaces,
} from "@zenda/db/schema";
import type { Language } from "@zenda/shared";
import { and, eq } from "drizzle-orm";
import { logAppointmentAudit } from "../../audit/logger.js";
import { enforceLimit } from "../../usage/enforcement.js";
import { trackActiveContact } from "../../usage/tracker.js";

interface ToolInput {
  /** Set to true when the customer has confirmed the details */
  confirmed?: boolean;
  customerId: string;
  date?: string; // YYYY-MM-DD
  notes?: string;
  serviceId?: string;
  staffMemberId?: string;
  startTime?: string; // HH:mm
}

/** Returned when more information is needed before creating the appointment */
interface NeedsInfoResult {
  missingFields: string[];
  needsInfo: true;
  question: string;
}

/** Returned when details are ready and awaiting customer confirmation */
interface AwaitingConfirmationResult {
  appointmentDetails: {
    serviceId: string;
    serviceName: string;
    date: string;
    startTime: string;
    endTime: string;
    staffName: string | null;
  };
  awaitingConfirmation: true;
  message: string;
}

/** Returned after successful creation */
interface BookingResult {
  appointmentId: string;
  date: string;
  endTime: string;
  service: string;
  startTime: string;
  status: string;
}

interface LimitReachedResult {
  error: true;
  message: string;
  reason: string;
  usage: { current: number; limit: number };
}

type BookResult =
  | NeedsInfoResult
  | AwaitingConfirmationResult
  | BookingResult
  | LimitReachedResult;

export async function bookAppointment(
  workspaceId: string,
  input: ToolInput,
  conversationId: string,
  _language: Language
): Promise<BookResult> {
  // ── Phase 1: Determine which required fields are missing ──
  const missing: string[] = [];
  if (!input.serviceId) {
    missing.push("serviceId");
  }
  if (!input.date) {
    missing.push("date");
  }
  if (!input.startTime) {
    missing.push("startTime");
  }

  // Ask one question at a time — pick the first missing field
  if (missing.length > 0) {
    const field = missing[0];
    const questions: Record<string, string> = {
      serviceId: "What service would you like to book?",
      date: "What date works best for you?",
      startTime: "What time would you prefer?",
    };
    return {
      needsInfo: true,
      missingFields: missing,
      question:
        questions[field] ??
        `Could you let me know your preferred ${field === "date" ? "date" : field === "startTime" ? "time" : "service"}?`,
    };
  }

  // ── Phase 2: All fields present — look up service ──
  const [service] = await db
    .select()
    .from(services)
    .where(
      and(
        eq(services.id, input.serviceId!),
        eq(services.workspaceId, workspaceId)
      )
    )
    .limit(1);

  if (!service) {
    return {
      needsInfo: true,
      missingFields: ["serviceId"],
      question:
        "I couldn't find that service. Could you tell me which service you're looking for?",
    };
  }

  // Resolve staff name if provided
  let staffName: string | null = null;
  if (input.staffMemberId) {
    const [staff] = await db
      .select({ name: staffMembers.name })
      .from(staffMembers)
      .where(
        and(
          eq(staffMembers.id, input.staffMemberId),
          eq(staffMembers.workspaceId, workspaceId)
        )
      )
      .limit(1);
    staffName = staff?.name ?? null;
  }

  const startAt = new Date(`${input.date!}T${input.startTime!}:00`);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);
  const endTime = `${String(endAt.getHours()).padStart(2, "0")}:${String(endAt.getMinutes()).padStart(2, "0")}`;

  // ── Phase 3: Require explicit confirmation before writing to calendar ──
  if (!input.confirmed) {
    const langQ =
      _language === "es"
        ? `Tengo todo listo para tu cita de ${service.name} el ${input.date} a las ${input.startTime}${staffName ? ` con ${staffName}` : ""}. Te parece bien?`
        : `I have your ${service.name} appointment on ${input.date} at ${input.startTime}${staffName ? ` with ${staffName}` : ""}. Does that look correct?`;

    return {
      awaitingConfirmation: true,
      appointmentDetails: {
        serviceId: service.id,
        serviceName: service.name,
        date: input.date!,
        startTime: input.startTime!,
        endTime,
        staffName,
      },
      message: langQ,
    };
  }

  // ── Phase 4: Confirmed — check active contact limit, then create ──
  const appointmentEnforcement = await enforceLimit(workspaceId);
  if (!appointmentEnforcement.allowed) {
    const limitMsg =
      _language === "es"
        ? "Lo siento, no podemos agendar más citas este mes. Por favor contacta al negocio directamente para asistencia."
        : "I'm sorry, we can't book more appointments this month. Please contact the business directly for assistance.";

    return {
      error: true,
      message: limitMsg,
      reason: "appointment_limit_reached",
      usage: {
        current: appointmentEnforcement.currentUsage,
        limit: appointmentEnforcement.limit,
      },
    };
  }
  // Derive timezone from workspace settings, fallback to UTC
  let timezone = "UTC";
  const [ws] = await db
    .select({ timezone: workspaces.timezone })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  if (ws?.timezone) {
    timezone = ws.timezone;
  }

  const [appointment] = await db
    .insert(appointments)
    .values({
      workspaceId,
      customerId: input.customerId,
      serviceId: input.serviceId!,
      staffMemberId: input.staffMemberId ?? null,
      status: "pending_confirmation",
      startAt,
      endAt,
      timezone,
      sourceConversationId: conversationId,
      createdBy: "ai",
      notes: input.notes ?? null,
    })
    .returning();

  logAppointmentAudit(workspaceId, appointment.id, "appointment_booked", {
    channel: "whatsapp",
    channelProvider: "baileys",
    customerId: input.customerId,
    serviceId: input.serviceId!,
  }).catch(() => {});

  // Track active contact for usage (background — non-blocking)
  (async () => {
    try {
      const [customer] = await db
        .select({ phoneNumber: customers.phoneNumber })
        .from(customers)
        .where(eq(customers.id, input.customerId))
        .limit(1);
      if (customer) {
        await trackActiveContact(workspaceId, customer.phoneNumber);
      }
    } catch {}
  })();

  return {
    appointmentId: appointment.id,
    status: appointment.status,
    service: service.name,
    date: input.date!,
    startTime: input.startTime!,
    endTime,
  };
}

export const bookAppointmentToolDef = {
  type: "function" as const,
  function: {
    name: "book_appointment",
    description:
      "Book a new appointment for a customer. Supports multi-turn: if required fields are missing it returns needsInfo. Set confirmed=true only after the customer explicitly approves the details.",
    parameters: {
      type: "object",
      properties: {
        customerId: { type: "string", description: "Customer ID" },
        serviceId: {
          type: "string",
          description: "Service ID (optional on first call)",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format (optional on first call)",
        },
        startTime: {
          type: "string",
          description: "Start time in HH:mm format (optional on first call)",
        },
        staffMemberId: {
          type: "string",
          description: "Optional staff member preference",
        },
        notes: { type: "string", description: "Optional notes" },
        confirmed: {
          type: "boolean",
          description: "Set true after the customer confirms the details",
        },
      },
      required: ["customerId"],
    },
  },
};
