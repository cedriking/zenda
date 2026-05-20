/**
 * Persistent Message Queue
 *
 * Database-backed outbound message queue that survives restarts.
 * Uses PostgreSQL FOR UPDATE SKIP LOCKED for safe concurrent dequeuing.
 */
import { db } from '@zenda/db/client'
import { outboundQueue } from '@zenda/db/schema'
import { eq, and, lte, isNull, sql, desc } from 'drizzle-orm'
import type { MessagePurpose } from '@zenda/shared'
import { logger } from '../../infra/logger.js'

export type QueuePriority = 'emergency' | 'reminder' | 'notification' | 'low'

export interface EnqueueInput {
  workspaceId: string
  customerId: string
  conversationId?: string
  purpose: MessagePurpose
  content: string
  contentType?: string
  appointmentId?: string
  priority?: QueuePriority
  metadata?: Record<string, unknown>
}

export interface QueuedMessage {
  id: string
  workspaceId: string
  customerId: string
  conversationId: string | null
  purpose: MessagePurpose
  content: string
  contentType: string
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'dead_letter'
  priority: QueuePriority
  attempts: number
  maxAttempts: number
  nextRetryAt: Date | null
  sentAt: Date | null
  failureReason: string | null
  appointmentId: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

const BASE_RETRY_DELAY_MS = 1000 // 1 second
const MAX_RETRY_DELAY_MS = 60_000 // 1 minute

function calculateNextRetry(attempts: number): Date {
  const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, attempts), MAX_RETRY_DELAY_MS)
  return new Date(Date.now() + delay)
}

/**
 * Insert a new message into the outbound queue.
 */
export async function enqueueMessage(input: EnqueueInput): Promise<QueuedMessage> {
  const [row] = await db
    .insert(outboundQueue)
    .values({
      workspaceId: input.workspaceId,
      customerId: input.customerId,
      conversationId: input.conversationId ?? null,
      purpose: input.purpose,
      content: input.content,
      contentType: input.contentType ?? 'text',
      appointmentId: input.appointmentId ?? null,
      priority: input.priority ?? 'notification',
      metadata: input.metadata ?? {},
      status: 'pending',
    })
    .returning()

  logger.info('Message enqueued', {
    queueId: row.id,
    workspaceId: input.workspaceId,
    customerId: input.customerId,
    purpose: input.purpose,
  })

  return row as QueuedMessage
}

/**
 * Dequeue the next pending message ready for processing.
 * Uses FOR UPDATE SKIP LOCKED for safe concurrent access.
 */
export async function dequeueNext(): Promise<QueuedMessage | null> {
  const now = new Date()

  const rows = await db
    .select()
    .from(outboundQueue)
    .where(and(
      eq(outboundQueue.status, 'pending'),
      sql`(${outboundQueue.nextRetryAt} IS NULL OR ${outboundQueue.nextRetryAt} <= ${now})`,
    ))
    .orderBy(
      sql`CASE ${outboundQueue.priority}
        WHEN 'emergency' THEN 0
        WHEN 'reminder' THEN 1
        WHEN 'notification' THEN 2
        WHEN 'low' THEN 3
        ELSE 2
      END`,
      outboundQueue.createdAt,
    )
    .limit(1)
    .for('update', { skipLocked: true })

  if (rows.length === 0) return null

  const row = rows[0]

  // Mark as processing to prevent other workers from picking it up
  await db
    .update(outboundQueue)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(eq(outboundQueue.id, row.id))

  return row as QueuedMessage
}

/**
 * Mark a queued message as successfully sent.
 */
export async function markSent(id: string): Promise<void> {
  await db
    .update(outboundQueue)
    .set({
      status: 'sent',
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(outboundQueue.id, id))
}

/**
 * Mark a queued message as failed. If max attempts reached, move to dead_letter.
 * Otherwise, schedule a retry with exponential backoff.
 */
export async function markFailed(id: string, reason: string): Promise<void> {
  const [row] = await db
    .select()
    .from(outboundQueue)
    .where(eq(outboundQueue.id, id))
    .limit(1)

  if (!row) return

  const newAttempts = row.attempts + 1
  const isDead = newAttempts >= row.maxAttempts

  await db
    .update(outboundQueue)
    .set({
      status: isDead ? 'dead_letter' : 'pending',
      attempts: newAttempts,
      failureReason: reason,
      nextRetryAt: isDead ? null : calculateNextRetry(newAttempts),
      updatedAt: new Date(),
    })
    .where(eq(outboundQueue.id, id))

  if (isDead) {
    logger.error('Message moved to dead letter queue', {
      queueId: id,
      attempts: newAttempts,
      reason,
    })
  } else {
    logger.warn('Message retry scheduled', {
      queueId: id,
      attempts: newAttempts,
      nextRetryAt: calculateNextRetry(newAttempts),
      reason,
    })
  }
}

/**
 * Get queue statistics for a workspace, grouped by status.
 */
export async function getQueueStats(
  workspaceId: string,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      status: outboundQueue.status,
      count: sql<number>`count(*)::int`,
    })
    .from(outboundQueue)
    .where(eq(outboundQueue.workspaceId, workspaceId))
    .groupBy(outboundQueue.status)

  const stats: Record<string, number> = {
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
    dead_letter: 0,
  }

  for (const row of rows) {
    stats[row.status] = row.count
  }

  return stats
}

/**
 * List all dead letter items for a workspace.
 */
export async function getDeadLetters(
  workspaceId: string,
  limit = 50,
): Promise<QueuedMessage[]> {
  const rows = await db
    .select()
    .from(outboundQueue)
    .where(and(
      eq(outboundQueue.workspaceId, workspaceId),
      eq(outboundQueue.status, 'dead_letter'),
    ))
    .orderBy(desc(outboundQueue.updatedAt))
    .limit(limit)

  return rows as QueuedMessage[]
}

/**
 * Get all pending messages for a workspace (used for revalidation on reconnect).
 */
export async function getPendingMessages(
  workspaceId: string,
): Promise<QueuedMessage[]> {
  const rows = await db
    .select()
    .from(outboundQueue)
    .where(and(
      eq(outboundQueue.workspaceId, workspaceId),
      eq(outboundQueue.status, 'pending'),
    ))
    .orderBy(outboundQueue.createdAt)

  return rows as QueuedMessage[]
}

/**
 * Retry a dead letter message by resetting it to pending.
 */
export async function retryDeadLetter(id: string): Promise<QueuedMessage | null> {
  const [row] = await db
    .update(outboundQueue)
    .set({
      status: 'pending',
      attempts: 0,
      failureReason: null,
      nextRetryAt: null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(outboundQueue.id, id),
      eq(outboundQueue.status, 'dead_letter'),
    ))
    .returning()

  if (row) {
    logger.info('Dead letter message retried', { queueId: id })
  }

  return (row as QueuedMessage) ?? null
}
