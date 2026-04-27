import { db } from '@zenda/db/client'
import { workspaces, subscriptions, messages, conversations, auditLogs } from '@zenda/db/schema'
import { eq, and, lt } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

const RETENTION_DAYS: Record<string, number> = {
  starter: 90,
  pro: 365,
  business: Infinity,
}

export async function enforceDataRetention(workspaceId: string): Promise<{ deleted: { messages: number; conversations: number; auditLogs: number } }> {
  // Get plan tier
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1)

  const tier = (sub?.planTier as string) ?? 'starter'
  const maxDays = RETENTION_DAYS[tier] ?? 90

  if (maxDays === Infinity) {
    return { deleted: { messages: 0, conversations: 0, auditLogs: 0 } }
  }

  const cutoffDate = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000)

  // Delete old messages
  const deletedMessages = await db
    .delete(messages)
    .where(and(
      eq(messages.workspaceId, workspaceId),
      lt(messages.createdAt, cutoffDate),
    ))
    .returning({ id: messages.id })

  // Delete old conversations (cascade will handle related data)
  const deletedConversations = await db
    .delete(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      lt(conversations.createdAt, cutoffDate),
    ))
    .returning({ id: conversations.id })

  // Delete old audit logs
  const deletedLogs = await db
    .delete(auditLogs)
    .where(and(
      eq(auditLogs.workspaceId, workspaceId),
      lt(auditLogs.createdAt, cutoffDate),
    ))
    .returning({ id: auditLogs.id })

  const result = {
    deleted: {
      messages: deletedMessages.length,
      conversations: deletedConversations.length,
      auditLogs: deletedLogs.length,
    },
  }

  if (deletedMessages.length > 0 || deletedConversations.length > 0) {
    logger.info('Data retention enforced', { workspaceId, tier, maxDays, ...result })
  }

  return result
}

export async function enforceRetentionAllWorkspaces(): Promise<number> {
  const allWorkspaces = await db
    .select({ id: workspaces.id })
    .from(workspaces)

  let count = 0
  for (const ws of allWorkspaces) {
    try {
      await enforceDataRetention(ws.id)
      count++
    } catch (err) {
      logger.error('Retention enforcement failed', { workspaceId: ws.id, error: (err as Error).message })
    }
  }

  return count
}
