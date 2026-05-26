import { db } from "@zenda/db/client";
import {
  appointments,
  customers,
  messagingConsent,
  receptionistProfiles,
  reminders,
  services,
  workspaces,
} from "@zenda/db/schema";
import type { Language, PersonalityPreset, ReminderType } from "@zenda/shared";
import { and, eq, lte } from "drizzle-orm";
import { logger } from "../../infra/logger.js";
import { wsMessageSender } from "../../infra/message-sender.js";
import { checkSendingPolicy } from "../ai/policy-gate.js";
import { incrementOutbound } from "../messaging/outbound-tracker.js";
import {
  canSendReminder,
  recordReminderSent,
} from "../messaging/reminder-guard.js";

interface ReminderTemplate {
  bodyEn: (data: {
    customerName: string;
    serviceName: string;
    time: string;
    date: string;
  }) => string;
  bodyEs: (data: {
    customerName: string;
    serviceName: string;
    time: string;
    date: string;
  }) => string;
  titleEn: string;
  titleEs: string;
}

// Personality-adaptive reminder templates (S15)
const PERSONALITY_TEMPLATES: Record<
  string,
  Record<string, ReminderTemplate>
> = {
  professional: {
    "24h": {
      titleEn: "Appointment Reminder",
      titleEs: "Recordatorio de Cita",
      bodyEn: ({ customerName, serviceName, time, date }) =>
        `Dear ${customerName}, this is a confirmation of your ${serviceName} appointment scheduled for ${date} at ${time}. We look forward to welcoming you.`,
      bodyEs: ({ customerName, serviceName, time, date }) =>
        `Estimado/a ${customerName}, le confirmamos su cita de ${serviceName} para el ${date} a las ${time}. Le esperamos.`,
    },
    "2h": {
      titleEn: "Appointment Soon",
      titleEs: "Cita Próxima",
      bodyEn: ({ customerName, serviceName, time }) =>
        `Dear ${customerName}, your ${serviceName} appointment is at ${time}. Does this still work for you?`,
      bodyEs: ({ customerName, serviceName, time }) =>
        `Estimado/a ${customerName}, su cita de ${serviceName} es a las ${time}. Confirme su asistencia, por favor.`,
    },
  },
  warm: {
    "24h": {
      titleEn: "Appointment Reminder",
      titleEs: "Recordatorio de Cita",
      bodyEn: ({ customerName, serviceName, time, date }) =>
        `Hi ${customerName}! Just a friendly reminder that your ${serviceName} appointment is tomorrow (${date}) at ${time}. We're excited to see you! If anything changes, I can help you update it.`,
      bodyEs: ({ customerName, serviceName, time, date }) =>
        `¡Hola ${customerName}! Te recuerdo con cariño que tu cita de ${serviceName} es mañana (${date}) a las ${time}. ¡Te esperamos! Si necesitas cambiar algo, avísame.`,
    },
    "2h": {
      titleEn: "Appointment Soon",
      titleEs: "Cita Próxima",
      bodyEn: ({ customerName, serviceName, time }) =>
        `Hey ${customerName}, your ${serviceName} appointment is coming up at ${time}! Does this still work for you? Let me know if you need anything.`,
      bodyEs: ({ customerName, serviceName, time }) =>
        `¡Hola ${customerName}! En un ratito tienes tu cita de ${serviceName} a las ${time}. ¿Todo bien para asistir? Avísame si necesitas algo.`,
    },
  },
  minimal: {
    "24h": {
      titleEn: "Reminder",
      titleEs: "Recordatorio",
      bodyEn: ({ serviceName, time, date }) =>
        `${serviceName} appointment: ${date} at ${time}.`,
      bodyEs: ({ serviceName, time, date }) =>
        `Cita de ${serviceName}: ${date} a las ${time}.`,
    },
    "2h": {
      titleEn: "Soon",
      titleEs: "Pronto",
      bodyEn: ({ serviceName, time }) =>
        `${serviceName} at ${time}. See you soon.`,
      bodyEs: ({ serviceName, time }) =>
        `${serviceName} a las ${time}. Te esperamos.`,
    },
  },
  premium: {
    "24h": {
      titleEn: "Appointment Confirmation",
      titleEs: "Confirmación de Cita",
      bodyEn: ({ customerName, serviceName, time, date }) =>
        `Good day, ${customerName}. We wanted to confirm your ${serviceName} appointment on ${date} at ${time}. We have everything prepared for your visit. Should you need to make any adjustments, please don't hesitate to reach out.`,
      bodyEs: ({ customerName, serviceName, time, date }) =>
        `Buenos días, ${customerName}. Deseamos confirmar su cita de ${serviceName} el ${date} a las ${time}. Tenemos todo preparado para su visita. Si necesita algún ajuste, no dude en comunicarse con nosotros.`,
    },
    "2h": {
      titleEn: "Your Appointment",
      titleEs: "Su Cita",
      bodyEn: ({ customerName, serviceName, time }) =>
        `${customerName}, your ${serviceName} appointment is at ${time}. Does this still suit your schedule?`,
      bodyEs: ({ customerName, serviceName, time }) =>
        `${customerName}, su cita de ${serviceName} es a las ${time}. ¿Le sigue funcionando este horario?`,
    },
  },
  friendly: {
    "24h": {
      titleEn: "Hey, don't forget!",
      titleEs: "¡No lo olvides!",
      bodyEn: ({ customerName, serviceName, time, date }) =>
        `Hey ${customerName}! Just wanted to make sure you didn't forget — your ${serviceName} is tomorrow (${date}) at ${time} 😊 If anything comes up, just let me know and I can help reschedule!`,
      bodyEs: ({ customerName, serviceName, time, date }) =>
        `¡Hola ${customerName}! Solo quería asegurarme de que no se te olvidara — tu ${serviceName} es mañana (${date}) a las ${time} 😊 Si te surge algo, dime y te ayudo a mover la cita.`,
    },
    "2h": {
      titleEn: "Almost time!",
      titleEs: "¡Ya casi!",
      bodyEn: ({ customerName, serviceName, time }) =>
        `Hey ${customerName}, your ${serviceName} is at ${time}! All good to go? Let me know if anything changes!`,
      bodyEs: ({ customerName, serviceName, time }) =>
        `¡Hola ${customerName}! Tu ${serviceName} es a las ${time}. ¿Todo listo? Avísame si cambia algo.`,
    },
  },
};

const DEFAULT_PERSONALITY = "warm";
const _DEFAULT_TEMPLATE = "24h";
const MAX_RETRIES = 3;
const reminderRetryCount = new Map<string, number>();

function getTemplateForPersonality(
  personality: PersonalityPreset | null,
  templateKey: string
): ReminderTemplate {
  const preset = personality ?? DEFAULT_PERSONALITY;
  return (
    PERSONALITY_TEMPLATES[preset]?.[templateKey] ??
    PERSONALITY_TEMPLATES[DEFAULT_PERSONALITY][templateKey]
  );
}

function pickTemplateKey(
  appointmentStart: Date,
  reminderScheduledAt: Date
): string {
  const diffHours =
    (appointmentStart.getTime() - reminderScheduledAt.getTime()) / 3_600_000;
  return diffHours <= 4 ? "2h" : "24h";
}

/**
 * Generate reminder schedule dates for an appointment based on workspace config.
 * Falls back to 24h + 2h defaults if no custom schedule is configured.
 */
export function generateReminderSchedule(
  appointmentStart: Date,
  schedule:
    | Array<{ offsetHours: number; type: "reminder" | "confirmation_prompt" }>
    | null
    | undefined
): Array<{ scheduledAt: Date; type: "reminder" | "confirmation_prompt" }> {
  const config = schedule?.length
    ? schedule
    : [
        { offsetHours: 24, type: "reminder" as const },
        { offsetHours: 2, type: "confirmation_prompt" as const },
      ];

  return config
    .map((entry) => ({
      scheduledAt: new Date(
        appointmentStart.getTime() - entry.offsetHours * 3_600_000
      ),
      type: entry.type,
    }))
    .filter((entry) => entry.scheduledAt > new Date());
}

function formatTime(date: Date, timezone: string): string {
  try {
    return date.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

function formatDate(date: Date, timezone: string): string {
  try {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
}

function pickReminderType(templateKey: string): ReminderType {
  return templateKey === "2h" ? "same_day" : "day_before";
}

export async function scheduleReminder(
  appointmentId: string,
  scheduledAt: Date
): Promise<void> {
  await db.insert(reminders).values({
    appointmentId,
    scheduledAt,
    status: "pending",
  });
}

/**
 * Schedule all reminders for an appointment based on workspace config.
 * Respects maxRemindersPerAppointment from workspace settings.
 */
export async function scheduleAllReminders(
  appointmentId: string,
  appointmentStart: Date,
  workspaceConfig: {
    maxRemindersPerAppointment?: number;
    reminderSchedule?: Array<{
      offsetHours: number;
      type: "reminder" | "confirmation_prompt";
    }> | null;
  }
): Promise<void> {
  const maxReminders = workspaceConfig.maxRemindersPerAppointment ?? 2;
  const schedule = generateReminderSchedule(
    appointmentStart,
    workspaceConfig.reminderSchedule
  );
  const toSchedule = schedule.slice(0, maxReminders);

  if (toSchedule.length === 0) {
    return;
  }

  await db.insert(reminders).values(
    toSchedule.map((entry) => ({
      appointmentId,
      scheduledAt: entry.scheduledAt,
      status: "pending" as const,
    }))
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complex reminder processing with many conditions
export async function processDueReminders(): Promise<number> {
  const now = new Date();

  const dueReminders = await db
    .select()
    .from(reminders)
    .where(
      and(eq(reminders.status, "pending"), lte(reminders.scheduledAt, now))
    )
    .limit(100);

  if (dueReminders.length === 0) {
    return 0;
  }

  let sentCount = 0;
  const BATCH_SIZE = 10;

  for (
    let batchStart = 0;
    batchStart < dueReminders.length;
    batchStart += BATCH_SIZE
  ) {
    const batch = dueReminders.slice(batchStart, batchStart + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((reminder: typeof reminders.$inferSelect) =>
        processSingleReminder(reminder)
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        sentCount++;
      }
    }
  }

  return sentCount;
}

/**
 * Process a single reminder. Returns true if sent successfully.
 * On exception, increments retry count; after MAX_RETRIES, marks as failed.
 */
async function processSingleReminder(
  reminder: typeof reminders.$inferSelect
): Promise<boolean> {
  try {
    // ── 1. Fetch appointment with all related data including consent ──
    const [appointmentRow] = await db
      .select({
        appointment: appointments,
        customer: customers,
        service: services,
        workspace: workspaces,
        consent: messagingConsent,
      })
      .from(appointments)
      .innerJoin(customers, eq(appointments.customerId, customers.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(workspaces, eq(appointments.workspaceId, workspaces.id))
      .leftJoin(messagingConsent, eq(customers.id, messagingConsent.customerId))
      .where(eq(appointments.id, reminder.appointmentId))
      .limit(1);

    if (!appointmentRow) {
      logger.warn(
        "Reminder references non-existent appointment, marking as failed",
        {
          reminderId: reminder.id,
          appointmentId: reminder.appointmentId,
        }
      );
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      return false;
    }

    const {
      appointment: apt,
      customer: cust,
      service: svc,
      workspace: ws,
    } = appointmentRow;

    // Skip if appointment is already cancelled
    if (apt.status === "cancelled") {
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      return false;
    }

    // ── 2. Reminder deduplication guard ──
    const templateKey = pickTemplateKey(apt.startAt, reminder.scheduledAt);
    const reminderType = pickReminderType(templateKey);

    const guardResult = await canSendReminder(
      apt.id,
      reminderType,
      apt.workspaceId
    );
    if (!guardResult.canSend) {
      logger.info("Reminder blocked by guard", {
        reminderId: reminder.id,
        appointmentId: apt.id,
        reason: guardResult.reason,
      });
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      return false;
    }

    // ── 3. Sending policy engine check (via policy-gate) ──
    const policyDecision = await checkSendingPolicy({
      workspaceId: ws.id,
      customerId: cust.id,
      purpose: "appointment_reminder",
      channel: "whatsapp_ba_bridge",
      appointmentCancelled: (apt.status as string) === "cancelled",
      appointmentCompleted: apt.status === "completed",
      appointmentTimePassed: new Date(apt.startAt) < new Date(),
      isDuplicate: false,
      connectorSessionStable: true, // assume stable when processing reminders
    });

    if (!policyDecision.allowed) {
      logger.info("Reminder blocked by sending policy", {
        reminderId: reminder.id,
        appointmentId: apt.id,
        reason: policyDecision.reason,
      });
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      return false;
    }

    // ── 4. Compose message with personality-adaptive templates (S15) ──
    let personality: PersonalityPreset | null = null;
    try {
      const [profile] = await db
        .select({ personalityPreset: receptionistProfiles.personalityPreset })
        .from(receptionistProfiles)
        .where(eq(receptionistProfiles.workspaceId, ws.id))
        .limit(1);
      personality = (profile?.personalityPreset as PersonalityPreset) ?? null;
    } catch {
      /* fallback to default personality */
    }

    const template = getTemplateForPersonality(personality, templateKey);
    const language = (cust.language ?? ws.defaultLanguage) as Language;
    const customerName = cust.name ?? cust.phoneNumber;
    const tz = apt.timezone || ws.timezone;
    const time = formatTime(apt.startAt, tz);
    const date = formatDate(apt.startAt, tz);

    const title = language === "es" ? template.titleEs : template.titleEn;
    const body =
      language === "es"
        ? template.bodyEs({ customerName, serviceName: svc.name, time, date })
        : template.bodyEn({
            customerName,
            serviceName: svc.name,
            time,
            date,
          });

    // ── 5. Send reminder ──
    const delivered = wsMessageSender.send(ws.id, {
      type: "whatsapp.message",
      data: {
        phoneNumber: cust.phoneNumber,
        body,
        contentType: "text",
        timestamp: new Date().toISOString(),
        reminderId: reminder.id,
        appointmentId: apt.id,
        title,
      },
    });

    // ── 6. Update statuses ──
    const newStatus = delivered ? "sent" : "failed";
    await db
      .update(reminders)
      .set({
        status: newStatus,
        sentAt: delivered ? new Date() : null,
      })
      .where(eq(reminders.id, reminder.id));

    if (delivered) {
      await db
        .update(appointments)
        .set({ reminderStatus: "sent", updatedAt: new Date() })
        .where(eq(appointments.id, apt.id));

      // Record in deduplication log and track outbound
      await recordReminderSent(apt.id, reminderType);
      await incrementOutbound(ws.id, cust.id, "appointment_reminder");
    }

    logger.info("Reminder processed", {
      reminderId: reminder.id,
      appointmentId: apt.id,
      workspaceId: ws.id,
      delivered,
      language,
      templateKey,
    });

    return delivered;
  } catch (err) {
    logger.error("Failed to send reminder", {
      reminderId: reminder.id,
      error: (err as Error).message,
    });

    // Increment retry count; mark as failed after MAX_RETRIES
    const retryCount = (reminderRetryCount.get(reminder.id) ?? 0) + 1;
    reminderRetryCount.set(reminder.id, retryCount);
    if (retryCount >= MAX_RETRIES) {
      await db
        .update(reminders)
        .set({ status: "failed" })
        .where(eq(reminders.id, reminder.id));
      reminderRetryCount.delete(reminder.id);
      logger.warn("Reminder exceeded max retries, marking as failed", {
        reminderId: reminder.id,
        retryCount,
      });
    }

    return false;
  }
}
