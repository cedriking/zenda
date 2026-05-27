/**
 * Tool: cancel_appointment
 *
 * Enhanced with cancellation policy enforcement:
 * - Applies cancellation window from business config (cancellationWindowHours)
 * - Applies cancellation policy strictness (lenient/standard/strict)
 * - For 'strict': blocks cancellation within window
 * - For 'standard': warns but allows
 * - For 'lenient': always allows
 * - Includes deposit note when configured
 * - Signals when owner notification is needed (within cancellation window)
 *
 * Safety constraints:
 * - DB update runs BEFORE the return statement — success is only reported after persist.
 * - Appointment existence and valid status transition are verified via DB query.
 * - No data is invented; all fields come from the DB result.
 * - On failure the agent receives a structured error it can relay honestly.
 */
import { db } from "@zenda/db/client";
import type { CancellationStrictness, Language } from "@zenda/shared";
import { APPOINTMENT_TRANSITIONS } from "@zenda/shared";
import { logAppointmentAudit } from "../../audit/logger.js";

interface ToolInput {
  appointmentId: string;
  reason?: string;
}

interface CancelBlockedResult {
  blocked: true;
  cancelled: false;
  message: string;
  reason: string;
}

interface CancelSuccessResult {
  appointmentId: string;
  cancelled: true;
  depositNote?: string;
  message: string;
  ownerNotified: boolean;
  status: string;
}

type CancelResult = CancelBlockedResult | CancelSuccessResult;

export async function cancelAppointment(
  workspaceId: string,
  input: ToolInput,
  _language?: Language
): Promise<CancelResult> {
  const lang = _language ?? "en";

  // Fetch appointment with service, staff, and business config
  const row = await db.appointment.findFirst({
    where: {
      id: input.appointmentId,
      workspaceId,
    },
    include: {
      service: true,
      staffMember: true,
      workspace: {
        include: {
          businessProfile: true,
          receptionistProfile: true,
        },
      },
    },
  });

  if (!row) {
    throw new Error("Appointment not found");
  }

  const apt = row;
  const svc = row.service;
  const staff = row.staffMember;
  const biz = row.workspace.businessProfile;
  const recep = row.workspace.receptionistProfile;

  // Validate status transition
  const validNext =
    APPOINTMENT_TRANSITIONS[apt.status as keyof typeof APPOINTMENT_TRANSITIONS];
  if (!validNext?.includes("cancelled")) {
    throw new Error(`Cannot cancel appointment in status: ${apt.status}`);
  }

  // ── Compute time remaining ──
  const hoursUntilAppointment =
    (new Date(apt.startAt).getTime() - Date.now()) / 3_600_000;
  const windowHours = biz?.cancellationWindowHours ?? 24;
  const withinWindow = hoursUntilAppointment < windowHours;
  const strictness: CancellationStrictness =
    recep?.cancellationPolicyStrictness ?? "standard";

  // ── Apply cancellation policy ──
  if (withinWindow && strictness === "strict") {
    const msg =
      lang === "es"
        ? `Lo siento, de acuerdo con la politica del negocio no es posible cancelar la cita con menos de ${windowHours} horas de anticipacion. Te gustaria que te comunique con alguien del equipo?`
        : `I'm sorry, per the business policy cancellations are not allowed within ${windowHours} hours of the appointment. Would you like me to connect you with someone on the team?`;

    return {
      cancelled: false,
      blocked: true,
      reason: `strict_policy_window (${windowHours}h)`,
      message: msg,
    };
  }

  // For 'standard' within window: warn but allow
  let warning: string | null = null;
  if (withinWindow && strictness === "standard") {
    warning =
      lang === "es"
        ? `Nota: estas cancelando con menos de ${windowHours} horas de anticipacion.`
        : `Note: you are cancelling within ${windowHours} hours of the appointment.`;
  }

  // ── Perform cancellation ──
  const updated = await db.appointment.update({
    where: { id: apt.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date(),
      notes: input.reason
        ? `${apt.notes ?? ""}\nCancel reason: ${input.reason}`.trim()
        : apt.notes,
    },
  });

  logAppointmentAudit(workspaceId, updated.id, "appointment_cancelled", {
    channel: "whatsapp",
    channelProvider: "baileys",
    customerId: apt.customerId,
    serviceId: svc.id,
  }).catch(() => {});

  // ── Deposit note ──
  let depositNote: string | undefined;
  if (biz?.depositRequired) {
    depositNote =
      lang === "es"
        ? "Ten en cuenta que se aplicara la politica de depositos del negocio."
        : "Please note the business deposit policy will apply.";
  }

  // ── Notify owner if within cancellation window ──
  const ownerNotified = withinWindow;

  const staffName = staff?.name ?? null;
  const dateStr = new Date(apt.startAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let msg =
    lang === "es"
      ? `Tu cita de ${svc.name}${staffName ? ` con ${staffName}` : ""} del ${dateStr} ha sido cancelada.`
      : `Your ${svc.name} appointment${staffName ? ` with ${staffName}` : ""} on ${dateStr} has been cancelled.`;

  if (warning) {
    msg = `${warning} ${msg}`;
  }

  return {
    cancelled: true,
    appointmentId: updated.id,
    status: updated.status,
    message: msg,
    depositNote,
    ownerNotified,
  };
}

export const cancelAppointmentToolDef = {
  type: "function" as const,
  function: {
    name: "cancel_appointment",
    description:
      'Cancel an existing appointment. Applies the business cancellation window and strictness policy. May block cancellation for "strict" policies within the window.',
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "string",
          description: "The appointment ID to cancel",
        },
        reason: { type: "string", description: "Optional cancellation reason" },
      },
      required: ["appointmentId"],
    },
  },
};
