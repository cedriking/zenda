import { db } from '@zenda/db/client'
import { notifications } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { sendToWorkspace } from '../whatsapp/connection-manager.js'
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

  // Push to connected workspace via WebSocket
  sendToWorkspace(input.workspaceId, {
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
