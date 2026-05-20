import { db } from '@zenda/db/client'
import { auditLogs } from '@zenda/db/schema'
import type { ActorType } from '@zenda/shared'

interface AuditLogInput {
  workspaceId: string
  actorType: ActorType
  actorId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function logAudit(input: AuditLogInput) {
  await db.insert(auditLogs).values({
    workspaceId: input.workspaceId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.details ?? null,
  })
}

// --- Convenience helpers for common audit events ---

/** Log that a message was sent to a customer or within a conversation. */
export async function logMessageSent(
  workspaceId: string,
  conversationId: string,
  messageType: string,
  purpose?: string,
  metadata?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'ai',
    action: 'message_sent',
    entityType: 'message',
    entityId: conversationId,
    details: { messageType, purpose, ...metadata },
  })
}

/** Log that a message was received from a customer. */
export async function logMessageReceived(
  workspaceId: string,
  conversationId: string,
  messageType: string,
  metadata?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'customer',
    action: 'message_received',
    entityType: 'message',
    entityId: conversationId,
    details: { messageType, ...metadata },
  })
}

/** Log that a send was blocked by sending policy. */
export async function logPolicyBlocked(
  workspaceId: string,
  customerId: string,
  reason: string,
  metadata?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'system',
    action: 'policy_blocked_send',
    entityType: 'customer',
    entityId: customerId,
    details: { reason, ...metadata },
  })
}

/** Log that an incoming customer message was sanitized by the input guard. */
export async function logInputSanitized(
  workspaceId: string,
  conversationId: string,
  flags: string[],
  originalMessage?: string,
) {
  return logAudit({
    workspaceId,
    actorType: 'system',
    action: 'input_sanitized',
    entityType: 'message',
    entityId: conversationId,
    details: {
      flags,
      originalSnippet: originalMessage?.slice(0, 200),
    },
  })
}

/** Log that an AI tool failed during execution. */
export async function logToolFailure(
  workspaceId: string,
  toolName: string,
  error: string,
  metadata?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'ai',
    action: 'tool_failure',
    entityType: 'tool',
    entityId: toolName,
    details: { error, ...metadata },
  })
}

/** Log a consent-related event (opt-out, record creation, status change). */
export async function logConsentEvent(
  workspaceId: string,
  customerId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'system',
    action,
    entityType: 'consent',
    entityId: customerId,
    details,
  })
}
