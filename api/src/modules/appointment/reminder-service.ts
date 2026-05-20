import { db } from '@zenda/db/client'
import { reminders, appointments, customers, services, workspaces, messagingConsent } from '@zenda/db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { sendToWorkspace } from '../whatsapp/ws-handler.js'
import { logger } from '../../infra/logger.js'
import { canSendReminder, recordReminderSent } from '../messaging/reminder-guard.js'
import { incrementOutbound } from '../messaging/outbound-tracker.js'
import { checkSendingPolicy } from '../ai/policy-gate.js'
import type { Language, ReminderType } from '@zenda/shared'

interface ReminderTemplate {
  titleEn: string
  titleEs: string
  bodyEn: (data: { customerName: string; serviceName: string; time: string; date: string }) => string
  bodyEs: (data: { customerName: string; serviceName: string; time: string; date: string }) => string
}

const REMINDER_TEMPLATES: Record<string, ReminderTemplate> = {
  '24h': {
    titleEn: 'Appointment Reminder',
    titleEs: 'Recordatorio de Cita',
    bodyEn: ({ customerName, serviceName, time, date }) =>
      `Hi ${customerName}, just a friendly reminder that you have a ${serviceName} appointment tomorrow (${date}) at ${time}. Looking forward to seeing you.`,
    bodyEs: ({ customerName, serviceName, time, date }) =>
      `Hola ${customerName}, te recuerdo que tienes cita de ${serviceName} mañana (${date}) a las ${time}. Te esperamos.`,
  },
  '2h': {
    titleEn: 'Appointment Soon',
    titleEs: 'Cita Proxima',
    bodyEn: ({ customerName, serviceName, time }) =>
      `Hi ${customerName}, your ${serviceName} appointment is coming up at ${time}. See you soon.`,
    bodyEs: ({ customerName, serviceName, time }) =>
      `Hola ${customerName}, en un rato tienes tu cita de ${serviceName} a las ${time}. Todo bien para asistir?`,
  },
}

const DEFAULT_TEMPLATE = '24h'

function pickTemplateKey(appointmentStart: Date, reminderScheduledAt: Date): string {
  const diffHours = (appointmentStart.getTime() - reminderScheduledAt.getTime()) / 3_600_000
  return diffHours <= 4 ? '2h' : '24h'
}

function formatTime(date: Date, timezone: string): string {
  try {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }
}

function formatDate(date: Date, timezone: string): string {
  try {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
}

function pickReminderType(templateKey: string): ReminderType {
  return templateKey === '2h' ? 'same_day' : 'day_before'
}

export async function scheduleReminder(
  appointmentId: string,
  scheduledAt: Date,
): Promise<void> {
  await db.insert(reminders).values({
    appointmentId,
    scheduledAt,
    status: 'pending',
  })
}

export async function processDueReminders(): Promise<number> {
  const now = new Date()

  const dueReminders = await db
    .select()
    .from(reminders)
    .where(and(
      eq(reminders.status, 'pending'),
      lte(reminders.scheduledAt, now),
    ))
    .limit(100)

  if (dueReminders.length === 0) return 0

  let sentCount = 0

  for (const reminder of dueReminders) {
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
        .limit(1)

      if (!appointmentRow) {
        logger.warn('Reminder references non-existent appointment, marking as failed', {
          reminderId: reminder.id,
          appointmentId: reminder.appointmentId,
        })
        await db
          .update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id))
        continue
      }

      const {
        appointment: apt,
        customer: cust,
        service: svc,
        workspace: ws,
        consent,
      } = appointmentRow

      // Skip if appointment is already cancelled
      if (apt.status === 'cancelled') {
        await db
          .update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id))
        continue
      }

      // ── 2. Reminder deduplication guard ──
      const templateKey = pickTemplateKey(apt.startAt, reminder.scheduledAt)
      const reminderType = pickReminderType(templateKey)

      const guardResult = await canSendReminder(apt.id, reminderType)
      if (!guardResult.canSend) {
        logger.info('Reminder blocked by guard', {
          reminderId: reminder.id,
          appointmentId: apt.id,
          reason: guardResult.reason,
        })
        await db
          .update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id))
        continue
      }

      // ── 3. Sending policy engine check (via policy-gate) ──
      const policyDecision = await checkSendingPolicy({
        workspaceId: ws.id,
        customerId: cust.id,
        purpose: 'appointment_reminder',
        channel: 'whatsapp_ba_bridge',
        appointmentCancelled: apt.status === 'cancelled',
        appointmentCompleted: apt.status === 'completed',
        appointmentTimePassed: new Date(apt.startAt) < now,
        isDuplicate: false,
        connectorSessionStable: true, // assume stable when processing reminders
      })

      if (!policyDecision.allowed) {
        logger.info('Reminder blocked by sending policy', {
          reminderId: reminder.id,
          appointmentId: apt.id,
          reason: policyDecision.reason,
        })
        await db
          .update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id))
        continue
      }

      // ── 4. Compose message with natural templates ──
      const template = REMINDER_TEMPLATES[templateKey] ?? REMINDER_TEMPLATES[DEFAULT_TEMPLATE]
      const language = (cust.language ?? ws.defaultLanguage) as Language
      const customerName = cust.name ?? cust.phoneNumber
      const tz = apt.timezone || ws.timezone
      const time = formatTime(apt.startAt, tz)
      const date = formatDate(apt.startAt, tz)

      const title = language === 'es' ? template.titleEs : template.titleEn
      const body = language === 'es'
        ? template.bodyEs({ customerName, serviceName: svc.name, time, date })
        : template.bodyEn({ customerName, serviceName: svc.name, time, date })

      // ── 5. Send reminder ──
      const delivered = sendToWorkspace(ws.id, {
        type: 'whatsapp.message',
        data: {
          phoneNumber: cust.phoneNumber,
          body,
          contentType: 'text',
          timestamp: new Date().toISOString(),
          reminderId: reminder.id,
          appointmentId: apt.id,
          title,
        },
      })

      // ── 6. Update statuses ──
      const newStatus = delivered ? 'sent' : 'failed'
      await db
        .update(reminders)
        .set({
          status: newStatus,
          sentAt: delivered ? new Date() : null,
        })
        .where(eq(reminders.id, reminder.id))

      if (delivered) {
        await db
          .update(appointments)
          .set({ reminderStatus: 'sent', updatedAt: new Date() })
          .where(eq(appointments.id, apt.id))

        // Record in deduplication log and track outbound
        await recordReminderSent(apt.id, reminderType)
        await incrementOutbound(ws.id, cust.id, 'appointment_reminder')
      }

      logger.info('Reminder processed', {
        reminderId: reminder.id,
        appointmentId: apt.id,
        workspaceId: ws.id,
        delivered,
        language,
        templateKey,
      })

      if (delivered) sentCount++
    } catch (err) {
      logger.error('Failed to send reminder', {
        reminderId: reminder.id,
        error: (err as Error).message,
      })
      // Leave as pending so it retries on the next cycle
    }
  }

  return sentCount
}
