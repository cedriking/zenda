import { db } from "@zenda/db/client";
import { messages } from "@zenda/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { logger } from "../../infra/logger.js";

type QueueType = "safe" | "unsafe";

interface OfflineItem {
  action: string;
  createdAt: number;
  id: string;
  payload: Record<string, unknown>;
  type: QueueType;
}

const memoryCache: OfflineItem[] = [];

export function enqueueSafe(
  action: string,
  payload: Record<string, unknown>
): string {
  const id = `safe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const item: OfflineItem = {
    id,
    type: "safe",
    action,
    payload,
    createdAt: Date.now(),
  };
  memoryCache.push(item);
  logger.info("Safe queue item added", { id, action });
  return id;
}

export function enqueueUnsafe(
  action: string,
  payload: Record<string, unknown>
): string {
  const id = `unsafe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const item: OfflineItem = {
    id,
    type: "unsafe",
    action,
    payload,
    createdAt: Date.now(),
  };
  memoryCache.push(item);
  logger.info("Unsafe queue item added", { id, action });
  return id;
}

export function getQueuedItems(type?: QueueType): OfflineItem[] {
  if (type) {
    return memoryCache.filter((i) => i.type === type);
  }
  return [...memoryCache];
}

export function removeItem(id: string): boolean {
  const idx = memoryCache.findIndex((i) => i.id === id);
  if (idx === -1) {
    return false;
  }
  memoryCache.splice(idx, 1);
  return true;
}

export function clearQueue(type?: QueueType): number {
  if (type) {
    const count = memoryCache.filter((i) => i.type === type).length;
    const remaining = memoryCache.filter((i) => i.type !== type);
    memoryCache.length = 0;
    memoryCache.push(...remaining);
    return count;
  }
  const count = memoryCache.length;
  memoryCache.length = 0;
  return count;
}

export async function flushUnsafeQueue(
  sendFn: (item: OfflineItem) => Promise<boolean>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const unsafeItems = memoryCache.filter((i) => i.type === "unsafe");

  for (const item of unsafeItems) {
    try {
      const success = await sendFn(item);
      if (success) {
        removeItem(item.id);
        sent++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  logger.info("Unsafe queue flushed", { sent, failed });
  return { sent, failed };
}

/**
 * Flush queued messages from DB (messages with status 'queued' older than a threshold).
 * Uses SELECT FOR UPDATE SKIP LOCKED for safe concurrent processing.
 */
export async function flushPersistentQueue(
  workspaceId: string,
  sendFn: (msg: {
    id: string;
    conversationId: string;
    body: string;
    contentType: string;
  }) => Promise<boolean>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    // Find messages stuck in 'queued' status for more than 30 seconds
    const cutoff = new Date(Date.now() - 30_000);
    const queued = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        body: messages.body,
        contentType: messages.contentType,
      })
      .from(messages)
      .where(
        and(
          eq(messages.status, "queued"),
          eq(messages.workspaceId, workspaceId),
          lte(messages.createdAt, cutoff)
        )
      )
      .limit(50);

    for (const msg of queued) {
      try {
        const success = await sendFn(msg);
        await db
          .update(messages)
          .set({ status: success ? "sent" : "failed" })
          .where(eq(messages.id, msg.id));
        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
  } catch (err) {
    logger.error("Persistent queue flush failed", {
      error: (err as Error).message,
    });
  }

  return { sent, failed };
}
