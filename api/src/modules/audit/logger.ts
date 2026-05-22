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
  channel?: string
  channelProvider?: string
  details?: Record<string, unknown>
}

// --- PII Redaction ---

const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

/** Redact phone numbers and email addresses from a string. */
export function redactPII(text: string): string {
  return text
    .replace(EMAIL_PATTERN, '[EMAIL]')
    .replace(PHONE_PATTERN, '[PHONE]')
}

export async function logAudit(input: AuditLogInput) {
  await db.insert(auditLogs).values({
    workspaceId: input.workspaceId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    channel: input.channel ?? null,
    channelProvider: input.channelProvider ?? null,
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
      originalSnippet: originalMessage ? redactPII(originalMessage.slice(0, 200)) : undefined,
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

/** Log an appointment lifecycle event (booked, confirmed, rescheduled, cancelled). */
export async function logAppointmentAudit(
  workspaceId: string,
  appointmentId: string,
  action: 'appointment_booked' | 'appointment_confirmed' | 'appointment_rescheduled' | 'appointment_cancelled' | 'appointment_completed' | 'appointment_no_show',
  details?: {
    actorType?: ActorType
    actorId?: string
    channel?: string
    channelProvider?: string
    customerId?: string
    serviceId?: string
    [key: string]: unknown
  },
) {
  return logAudit({
    workspaceId,
    actorType: details?.actorType ?? 'ai',
    actorId: details?.actorId,
    action,
    entityType: 'appointment',
    entityId: appointmentId,
    channel: details?.channel,
    channelProvider: details?.channelProvider,
    details: {
      customerId: details?.customerId,
      serviceId: details?.serviceId,
    },
  })
}

/** Log an escalation creation event. */
export async function logEscalationCreated(
  workspaceId: string,
  conversationId: string,
  reason: string,
  metadata?: Record<string, unknown>,
) {
  return logAudit({
    workspaceId,
    actorType: 'ai',
    action: 'escalation_created',
    entityType: 'conversation',
    entityId: conversationId,
    channel: 'whatsapp',
    details: { reason, ...metadata },
  })
}

/** Log an opt-out handling event. */
export async function logOptOutEvent(
  workspaceId: string,
  customerId: string,
  channel: string,
) {
  return logAudit({
    workspaceId,
    actorType: 'customer',
    action: 'opt_out',
    entityType: 'consent',
    entityId: customerId,
    channel,
    details: { source: 'customer_message' },
  })
}
