import { db } from "@zenda/db/client";
import type { NotificationType } from "@zenda/shared";
import { wsMessageSender } from "../../infra/message-sender.js";

interface CreateNotificationInput {
  body: string;
  relatedId?: string;
  title: string;
  type: NotificationType;
  workspaceId: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notif = await db.notification.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.workspaceId, // Will be replaced with actual userId when available
      type: input.type,
      title: input.title,
      body: input.body,
      relatedId: input.relatedId ?? null,
    },
  });

  // Push to connected workspace
  wsMessageSender.send(input.workspaceId, {
    type: "notification",
    data: notif,
  });

  return notif;
}

export async function getNotifications(workspaceId: string, limit = 50) {
  return db.notification.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(
  workspaceId: string,
  notificationId: string
) {
  const updated = await db.notification.update({
    where: { id: notificationId, workspaceId },
    data: { read: new Date() },
  });
  return updated;
}

/**
 * Send a usage threshold notification to the workspace owner.
 * Used by the usage tracking engine at 80% (warning) and 100% (limit).
 */
export async function sendUsageNotification(
  workspaceId: string,
  level: "warning" | "limit"
): Promise<void> {
  if (level === "limit") {
    await createNotification({
      workspaceId,
      type: "usage_limit",
      title: "Active contact limit reached",
      body: "You've reached your active contact limit. Proactive automations (reminders, follow-ups) are paused. Inbound messages still work. Upgrade your plan for more contacts.",
    });
  } else {
    await createNotification({
      workspaceId,
      type: "usage_warning",
      title: "Active contact usage at 80%",
      body: "You've used 80% of your active appointment contacts this month. Consider upgrading to avoid hitting your limit.",
    });
  }
}
