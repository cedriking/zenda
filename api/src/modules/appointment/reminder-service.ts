import { db } from '@zenda/db/client'
import { reminders } from '@zenda/db/schema'
import { eq, and, lte } from 'drizzle-orm'
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

  for (const reminder of dueReminders) {
    try {
      // In production, fetch appointment/customer details to fill template
      // For now, send generic notification via WebSocket
      logger.info('Processing reminder', { reminderId: reminder.id })

      await db
        .update(reminders)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(reminders.id, reminder.id))

      logger.info('Reminder sent', { reminderId: reminder.id })
    } catch (err) {
      logger.error('Failed to send reminder', {
        reminderId: reminder.id,
        error: (err as Error).message,
      })
    }
  }

  return dueReminders.length
}
