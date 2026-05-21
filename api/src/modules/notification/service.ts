import { db } from '@zenda/db/client'
import { notifications } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { wsMessageSender } from '../../infra/message-sender.js'
import type { NotificationType } from '@zenda/shared'

interface CreateNotificationInput {
  workspaceId: string
  type: NotificationType
  title: string
  body: string
  relatedId?: string
}

export async function createNotification(input: CreateNotificationInput) {
  const [notif] = await db
    .insert(notifications)
    .values({
      workspaceId: input.workspaceId,
      userId: input.workspaceId, // Will be replaced with actual userId when available
      type: input.type,
      title: input.title,
      body: input.body,
      relatedId: input.relatedId ?? null,
    })
    .returning()

  // Push to connected workspace
  wsMessageSender.send(input.workspaceId, {
    type: 'notification',
    data: notif,
  })

  return notif
}

export async function getNotifications(workspaceId: string, limit = 50) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.workspaceId, workspaceId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
}

export async function markNotificationRead(workspaceId: string, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ read: new Date() })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.workspaceId, workspaceId),
    ))
    .returning()
  return updated
}

/**
 * Send a usage threshold notification to the workspace owner.
 * Used by the usage tracking engine at 80% (warning) and 100% (limit).
 */
export async function sendUsageNotification(
  workspaceId: string,
  level: 'warning' | 'limit',
): Promise<void> {
  if (level === 'limit') {
    await createNotification({
      workspaceId,
      type: 'usage_limit',
      title: 'Active contact limit reached',
      body: 'You\'ve reached your active contact limit. Proactive automations (reminders, follow-ups) are paused. Inbound messages still work. Upgrade your plan for more contacts.',
    })
  } else {
    await createNotification({
      workspaceId,
      type: 'usage_warning',
      title: 'Active contact usage at 80%',
      body: 'You\'ve used 80% of your active appointment contacts this month. Consider upgrading to avoid hitting your limit.',
    })
  }
}
