import { db } from '@zenda/db/client'
import { reminders, appointments, customers, services, workspaces } from '@zenda/db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { sendToWorkspace } from '../whatsapp/ws-handler.js'
import { logger } from '../../infra/logger.js'

interface ReminderTemplate {
  titleEn: string
  titleEs: string
  bodyEn: (data: { customerName: string; serviceName: string; dateTime: string }) => string
  bodyEs: (data: { customerName: string; serviceName: string; dateTime: string }) => string
}

const REMINDER_TEMPLATES: Record<string, ReminderTemplate> = {
  '24h': {
    titleEn: 'Appointment Reminder',
    titleEs: 'Recordatorio de Cita',
    bodyEn: ({ customerName, serviceName, dateTime }) =>
      `Hi ${customerName}, this is a reminder for your ${serviceName} appointment tomorrow at ${dateTime}. Reply CONFIRM to confirm or CANCEL to reschedule.`,
    bodyEs: ({ customerName, serviceName, dateTime }) =>
      `Hola ${customerName}, le recordamos su cita de ${serviceName} mañana a las ${dateTime}. Responda CONFIRMAR para confirmar o CANCELAR para reprogramar.`,
  },
  '2h': {
    titleEn: 'Appointment Soon',
    titleEs: 'Cita Próxima',
    bodyEn: ({ customerName, serviceName, dateTime }) =>
      `Hi ${customerName}, your ${serviceName} appointment is in 2 hours (${dateTime}). See you soon!`,
    bodyEs: ({ customerName, serviceName, dateTime }) =>
      `Hola ${customerName}, su cita de ${serviceName} es en 2 horas (${dateTime}). ¡Nos vemos pronto!`,
  },
}

/** Default template key – used when scheduled time doesn't match 24h/2h windows */
const DEFAULT_TEMPLATE = '24h'

/**
 * Pick a template based on how far in advance the reminder fires.
 * If the appointment is <4 hours away we use the "2h" tone; otherwise "24h".
 */
function pickTemplateKey(appointmentStart: Date, reminderScheduledAt: Date): string {
  const diffHours = (appointmentStart.getTime() - reminderScheduledAt.getTime()) / 3_600_000
  return diffHours <= 4 ? '2h' : '24h'
}

/**
 * Format an appointment Date into a locale-friendly time string.
 * Uses the workspace timezone when available.
 */
function formatDateTime(date: Date, timezone: string): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return date.toLocaleString()
  }
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

  // Fetch pending reminders that are due
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
      // ── 1. Fetch appointment with customer, service, and workspace info ──
      const [appointmentRow] = await db
        .select({
          appointment: appointments,
          customer: customers,
          service: services,
          workspace: workspaces,
        })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .innerJoin(workspaces, eq(appointments.workspaceId, workspaces.id))
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

      const { appointment: apt, customer: cust, service: svc, workspace: ws } = appointmentRow

      // Skip if appointment is already cancelled
      if (apt.status === 'cancelled') {
        await db
          .update(reminders)
          .set({ status: 'failed' })
          .where(eq(reminders.id, reminder.id))
        continue
      }

      // ── 2. Pick template and compose message ──
      const templateKey = pickTemplateKey(apt.startAt, reminder.scheduledAt)
      const template = REMINDER_TEMPLATES[templateKey] ?? REMINDER_TEMPLATES[DEFAULT_TEMPLATE]
      const language = (cust.language ?? ws.defaultLanguage) as 'en' | 'es'
      const customerName = cust.name ?? cust.phoneNumber
      const dateTime = formatDateTime(apt.startAt, apt.timezone || ws.timezone)

      const title = language === 'en' ? template.titleEn : template.titleEs
      const body = language === 'en'
        ? template.bodyEn({ customerName, serviceName: svc.name, dateTime })
        : template.bodyEs({ customerName, serviceName: svc.name, dateTime })

      // ── 3. Send reminder via WebSocket to the desktop app ──
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

      // ── 4. Update reminder status ──
      const newStatus = delivered ? 'sent' : 'failed'
      await db
        .update(reminders)
        .set({
          status: newStatus,
          sentAt: delivered ? new Date() : null,
        })
        .where(eq(reminders.id, reminder.id))

      // Also bump the appointment reminderStatus for dashboard visibility
      if (delivered) {
        await db
          .update(appointments)
          .set({ reminderStatus: 'sent', updatedAt: new Date() })
          .where(eq(appointments.id, apt.id))
      }

      logger.info('Reminder processed', {
        reminderId: reminder.id,
        appointmentId: apt.id,
        workspaceId: ws.id,
        delivered,
        language,
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
