/**
 * Consent Management Service — Phase 2
 *
 * Handles creating, retrieving, and updating messaging consent records.
 * Detects opt-out intent from customer messages and generates confirmation text.
 */
import { db } from '@zenda/db/client'
import { messagingConsent } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import type {
  MessagingConsentStatus,
  ConsentSource,
  MessagePurpose,
} from '@zenda/shared'
import { logger } from '../../infra/logger.js'

// --- Opt-out regex patterns (EN + ES) ---

const OPT_OUT_PATTERNS_EN = /\b(stop|unsubscribe|cancel\s*messages|no\s*more|opt\s*out|don't\s*text|do\s*not\s*text|remove\s*me)\b/i
const OPT_OUT_PATTERNS_ES = /\b(detener|cancelar\s*(?:suscripci[oó]n|mensajes)?|no\s*m[aá]s\s*mensajes|basta|no\s*env[ií]en|s[aá]came|dame\s*de\s*baja)\b/i

// --- Public API ---

interface RecordConsentInput {
  workspaceId: string
  customerId: string
  phoneNumber: string
  status: MessagingConsentStatus
  source: ConsentSource
  allowedPurposes?: MessagePurpose[]
  notes?: string
}

/**
 * Create or update a consent record.
 * Upserts on the (workspaceId, customerId) unique index.
 */
export async function recordConsent(input: RecordConsentInput): Promise<void> {
  const existing = await getConsent(input.workspaceId, input.customerId)

  if (existing) {
    await db
      .update(messagingConsent)
      .set({
        status: input.status,
        source: input.source,
        allowedPurposes: input.allowedPurposes ?? existing.allowedPurposes,
        notes: input.notes ?? existing.notes,
        capturedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messagingConsent.id, existing.id))
  } else {
    await db.insert(messagingConsent).values({
      workspaceId: input.workspaceId,
      customerId: input.customerId,
      phoneNumber: input.phoneNumber,
      status: input.status,
      source: input.source,
      allowedPurposes: input.allowedPurposes ?? [],
      notes: input.notes,
      capturedAt: new Date(),
    })
  }
}

/**
 * Retrieve the consent record for a customer in a workspace.
 * Returns null if no record exists.
 */
export async function getConsent(workspaceId: string, customerId: string) {
  const [record] = await db
    .select()
    .from(messagingConsent)
    .where(and(
      eq(messagingConsent.workspaceId, workspaceId),
      eq(messagingConsent.customerId, customerId),
    ))
    .limit(1)

  return record ?? null
}

/**
 * Mark a customer as opted_out.
 * Returns the confirmation text to send back.
 */
export async function optOut(workspaceId: string, customerId: string): Promise<string> {
  const existing = await getConsent(workspaceId, customerId)
  await recordConsent({
    workspaceId,
    customerId,
    phoneNumber: existing?.phoneNumber ?? '',
    status: 'opted_out',
    source: 'opt_out_request',
    notes: 'Customer requested opt-out via message',
  })
  return 'You have been unsubscribed from messaging. Reply HELP to re-subscribe.'
}

/**
 * Check whether a specific message purpose is allowed for this customer.
 * Respects the same purpose-allowance logic as the Sending Policy Engine.
 */
export async function isAllowedToSend(
  workspaceId: string,
  customerId: string,
  purpose: MessagePurpose,
): Promise<boolean> {
  const consent = await getConsent(workspaceId, customerId)

  if (!consent) {
    return ['customer_inquiry_reply', 'booking_assistance', 'booking_confirmation'].includes(purpose)
  }
  if (consent.status === 'opted_out') return false
  if (consent.status === 'allowed') return true
  if (consent.status === 'limited') return (consent.allowedPurposes ?? []).includes(purpose)

  // unknown — allow only reactive purposes
  return ['customer_inquiry_reply', 'booking_assistance', 'booking_confirmation'].includes(purpose)
}

/**
 * Detect whether a message body contains an opt-out intent.
 * Matches EN and ES phrases.
 */
export function detectOptOutIntent(messageBody: string): boolean {
  return OPT_OUT_PATTERNS_EN.test(messageBody) || OPT_OUT_PATTERNS_ES.test(messageBody)
}

/**
 * Generate a natural-language confirmation for consent / subscription.
 */
export function generateConsentConfirmation(language: 'en' | 'es'): string {
  if (language === 'es') {
    return 'Te has suscrito a los mensajes de este negocio. Puedes responder STOP en cualquier momento para cancelar.'
  }
  return 'You have been subscribed to messages from this business. Reply STOP anytime to unsubscribe.'
}

/**
 * Update the lastInboundMessageAt timestamp for consent tracking.
 */
export async function touchInboundTimestamp(workspaceId: string, customerId: string): Promise<void> {
  const existing = await getConsent(workspaceId, customerId)
  if (!existing) return

  await db
    .update(messagingConsent)
    .set({ lastInboundMessageAt: new Date(), updatedAt: new Date() })
    .where(and(
      eq(messagingConsent.workspaceId, workspaceId),
      eq(messagingConsent.customerId, customerId),
    ))
}
