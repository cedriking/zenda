/**
 * Persistent Message Queue
 *
 * Database-backed outbound message queue that survives restarts.
 * Uses PostgreSQL FOR UPDATE SKIP LOCKED for safe concurrent dequeuing.
 */
import { db } from "@zenda/db/client";
import type { MessagePurpose } from "@zenda/shared";
import { MAX_QUEUE_DEPTH_PER_WORKSPACE } from "../../config/env.js";
import { logger } from "../../infra/logger.js";

export type QueuePriority = "emergency" | "reminder" | "notification" | "low";

export interface EnqueueInput {
  appointmentId?: string;
  content: string;
  contentType?: string;
  conversationId?: string;
  customerId: string;
  metadata?: Record<string, unknown>;
  priority?: QueuePriority;
  purpose: MessagePurpose;
  workspaceId: string;
}

export interface QueuedMessage {
  appointmentId: string | null;
  attempts: number;
  content: string;
  contentType: string;
  conversationId: string | null;
  createdAt: Date;
  customerId: string;
  failureReason: string | null;
  id: string;
  maxAttempts: number;
  metadata: Record<string, unknown> | null;
  nextRetryAt: Date | null;
  priority: QueuePriority;
  purpose: MessagePurpose;
  sentAt: Date | null;
  status: "pending" | "processing" | "sent" | "failed" | "dead_letter";
  updatedAt: Date;
  workspaceId: string;
}

const BASE_RETRY_DELAY_MS = 1000; // 1 second
const MAX_RETRY_DELAY_MS = 60_000; // 1 minute

function calculateNextRetry(attempts: number): Date {
  const delay = Math.min(
    BASE_RETRY_DELAY_MS * 2 ** attempts,
    MAX_RETRY_DELAY_MS
  );
  return new Date(Date.now() + delay);
}

/**
 * Appointment statuses that should block queueing.
 * Messages for appointments in these states are rejected at enqueue time.
 */
const BLOCKED_APPOINTMENT_STATUSES = new Set([
  "cancelled",
  "completed",
  "no_show",
]);

/**
 * Insert a new message into the outbound queue.
 *
 * Validates:
 * 1. Per-workspace queue depth does not exceed configurable limit
 * 2. If an appointmentId is provided, the appointment is still active
 */
export async function enqueueMessage(
  input: EnqueueInput
): Promise<QueuedMessage> {
  // --- Per-workspace queue depth check ---
  const depthResult = await db.outboundQueue.count({
    where: {
      workspaceId: input.workspaceId,
      status: "pending",
    },
  });

  if (depthResult >= MAX_QUEUE_DEPTH_PER_WORKSPACE) {
    throw new Error(
      `Queue depth limit exceeded for workspace ${input.workspaceId}: ` +
        `${depthResult} pending messages (max ${MAX_QUEUE_DEPTH_PER_WORKSPACE})`
    );
  }

  // --- Appointment validity check ---
  if (input.appointmentId) {
    const appt = await db.appointment.findFirst({
      where: { id: input.appointmentId },
      select: { status: true, startAt: true },
    });

    if (!appt) {
      throw new Error(`Appointment ${input.appointmentId} not found`);
    }

    if (BLOCKED_APPOINTMENT_STATUSES.has(appt.status)) {
      throw new Error(
        `Cannot enqueue message for appointment ${input.appointmentId}: ` +
          `status is '${appt.status}'`
      );
    }

    // Reject messages for appointments that are already in the past
    if (appt.startAt < new Date()) {
      throw new Error(
        `Cannot enqueue message for appointment ${input.appointmentId}: ` +
          `start time ${appt.startAt.toISOString()} is in the past`
      );
    }
  }

  const row = await db.outboundQueue.create({
    data: {
      workspaceId: input.workspaceId,
      customerId: input.customerId,
      conversationId: input.conversationId ?? null,
      purpose: input.purpose,
      content: input.content,
      contentType: input.contentType ?? "text",
      appointmentId: input.appointmentId ?? null,
      priority: input.priority ?? "notification",
      metadata: input.metadata ?? undefined,
      status: "pending",
    },
  });

  logger.info("Message enqueued", {
    queueId: row.id,
    workspaceId: input.workspaceId,
    customerId: input.customerId,
    purpose: input.purpose,
  });

  return row as unknown as QueuedMessage;
}

/**
 * Dequeue the next pending message ready for processing.
 * Uses FOR UPDATE SKIP LOCKED for safe concurrent access.
 * Must use raw SQL because Prisma does not support pessimistic locking.
 */
export async function dequeueNext(): Promise<QueuedMessage | null> {
  const now = new Date();

  const rows: QueuedMessage[] = await db.$queryRaw`
    SELECT * FROM outbound_queue
    WHERE status = 'pending'
      AND (next_retry_at IS NULL OR next_retry_at <= ${now})
    ORDER BY
      CASE priority
        WHEN 'emergency' THEN 0
        WHEN 'reminder' THEN 1
        WHEN 'notification' THEN 2
        WHEN 'low' THEN 3
        ELSE 2
      END,
      created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `;

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  // Mark as processing to prevent other workers from picking it up
  await db.outboundQueue.update({
    where: { id: row.id },
    data: { status: "processing", updatedAt: new Date() },
  });

  return row;
}

/**
 * Mark a queued message as successfully sent.
 */
export async function markSent(id: string): Promise<void> {
  await db.outboundQueue.update({
    where: { id },
    data: {
      status: "sent",
      sentAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark a queued message as failed. If max attempts reached, move to dead_letter.
 * Otherwise, schedule a retry with exponential backoff.
 */
export async function markFailed(id: string, reason: string): Promise<void> {
  const row = await db.outboundQueue.findFirst({
    where: { id },
  });

  if (!row) {
    return;
  }

  const newAttempts = row.attempts + 1;
  const isDead = newAttempts >= row.maxAttempts;

  await db.outboundQueue.update({
    where: { id },
    data: {
      status: isDead ? "dead_letter" : "pending",
      attempts: newAttempts,
      failureReason: reason,
      nextRetryAt: isDead ? null : calculateNextRetry(newAttempts),
      updatedAt: new Date(),
    },
  });

  if (isDead) {
    logger.error("Message moved to dead letter queue", {
      queueId: id,
      attempts: newAttempts,
      reason,
    });
  } else {
    logger.warn("Message retry scheduled", {
      queueId: id,
      attempts: newAttempts,
      nextRetryAt: calculateNextRetry(newAttempts),
      reason,
    });
  }
}

/**
 * Get queue statistics for a workspace, grouped by status.
 */
export async function getQueueStats(
  workspaceId: string
): Promise<Record<string, number>> {
  const rows: { status: string; count: bigint }[] = await db.$queryRaw`
    SELECT status, COUNT(*)::int AS count
    FROM outbound_queue
    WHERE workspace_id = ${workspaceId}
    GROUP BY status
  `;

  const stats: Record<string, number> = {
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    dead_letter: 0,
  };

  for (const row of rows) {
    stats[row.status] = Number(row.count);
  }

  return stats;
}

/**
 * List all dead letter items for a workspace.
 */
export async function getDeadLetters(
  workspaceId: string,
  limit = 50
): Promise<QueuedMessage[]> {
  const rows = await db.outboundQueue.findMany({
    where: {
      workspaceId,
      status: "dead_letter",
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return rows as unknown as QueuedMessage[];
}

/**
 * Get all pending messages for a workspace (used for revalidation on reconnect).
 */
export async function getPendingMessages(
  workspaceId: string
): Promise<QueuedMessage[]> {
  const rows = await db.outboundQueue.findMany({
    where: {
      workspaceId,
      status: "pending",
    },
    orderBy: { createdAt: "asc" },
  });

  return rows as unknown as QueuedMessage[];
}

/**
 * Retry a dead letter message by resetting it to pending.
 */
export async function retryDeadLetter(
  id: string
): Promise<QueuedMessage | null> {
  const row = await db.outboundQueue.updateMany({
    where: {
      id,
      status: "dead_letter",
    },
    data: {
      status: "pending",
      attempts: 0,
      failureReason: null,
      nextRetryAt: null,
      updatedAt: new Date(),
    },
  });

  if (row.count > 0) {
    const updated = await db.outboundQueue.findFirst({ where: { id } });
    logger.info("Dead letter message retried", { queueId: id });
    return (updated as unknown as QueuedMessage) ?? null;
  }

  return null;
}
