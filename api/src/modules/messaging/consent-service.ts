/**
 * Consent Management Service — Phase 2
 *
 * Handles creating, retrieving, and updating messaging consent records.
 * Detects opt-out intent from customer messages and generates confirmation text.
 */
import { db } from "@zenda/db/client";
import { messagingConsent, outboundQueue } from "@zenda/db/schema";
import type {
  ConsentSource,
  MessagePurpose,
  MessagingConsentStatus,
} from "@zenda/shared";
import { and, eq } from "drizzle-orm";
import { logger } from "../../infra/logger.js";

// --- Opt-out regex patterns (EN + ES) ---

const OPT_OUT_PATTERNS_EN =
  /\b(stop|unsubscribe|cancel\s*messages|no\s*more|opt\s*out|don't\s*text|do\s*not\s*text|remove\s*me)\b/i;
const OPT_OUT_PATTERNS_ES =
  /\b(detener|cancelar\s*(?:suscripci[oó]n|mensajes)?|no\s*m[aá]s\s*mensajes|basta|no\s*env[ií]en|s[aá]came|dame\s*de\s*baja)\b/i;

// --- Public API ---

interface RecordConsentInput {
  allowedPurposes?: MessagePurpose[];
  customerId: string;
  notes?: string;
  phoneNumber: string;
  source: ConsentSource;
  status: MessagingConsentStatus;
  workspaceId: string;
}

/**
 * Create or update a consent record.
 * Upserts on the (workspaceId, customerId) unique index.
 */
export async function recordConsent(input: RecordConsentInput): Promise<void> {
  const existing = await getConsent(input.workspaceId, input.customerId);

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
      .where(eq(messagingConsent.id, existing.id));
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
    });
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
    .where(
      and(
        eq(messagingConsent.workspaceId, workspaceId),
        eq(messagingConsent.customerId, customerId)
      )
    )
    .limit(1);

  return record ?? null;
}

/**
 * Mark a customer as opted_out.
 * Returns the natural-language confirmation text to send back (§8.4).
 */
export async function optOut(
  workspaceId: string,
  customerId: string
): Promise<string> {
  const existing = await getConsent(workspaceId, customerId);
  await recordConsent({
    workspaceId,
    customerId,
    phoneNumber: existing?.phoneNumber ?? "",
    status: "opted_out",
    source: "opt_out_request",
    notes: "Customer requested opt-out via message",
  });

  // Cascade: cancel pending queue messages for this customer
  await cancelPendingMessagesForCustomer(workspaceId, customerId);

  return "Got it — I won't send you any more messages. If you'd like to book an appointment in the future, just send me a message anytime.";
}

/**
 * Check whether a specific message purpose is allowed for this customer.
 * Respects the same purpose-allowance logic as the Sending Policy Engine.
 */
export async function isAllowedToSend(
  workspaceId: string,
  customerId: string,
  purpose: MessagePurpose
): Promise<boolean> {
  const consent = await getConsent(workspaceId, customerId);

  if (!consent) {
    return [
      "customer_inquiry_reply",
      "booking_assistance",
      "booking_confirmation",
      "inbound_reply",
    ].includes(purpose);
  }
  if (consent.status === "opted_out") {
    return false;
  }
  if (consent.status === "allowed") {
    return true;
  }
  if (consent.status === "limited") {
    return (consent.allowedPurposes ?? []).includes(purpose);
  }

  // unknown — allow only reactive purposes
  return [
    "customer_inquiry_reply",
    "booking_assistance",
    "booking_confirmation",
    "inbound_reply",
  ].includes(purpose);
}

/**
 * Detect whether a message body contains an opt-out intent.
 * Matches EN and ES phrases.
 */
export function detectOptOutIntent(messageBody: string): boolean {
  return (
    OPT_OUT_PATTERNS_EN.test(messageBody) ||
    OPT_OUT_PATTERNS_ES.test(messageBody)
  );
}

/**
 * Generate a natural-language confirmation for consent / subscription (§8.2).
 * Avoids "Reply STOP" robotic language — uses natural phrasing instead.
 */
export function generateConsentConfirmation(language: "en" | "es"): string {
  if (language === "es") {
    return "Perfecto, te tengo en cuenta para futuras citas. Si en algún momento prefieres que no te envíe mensajes, solo dime y lo respeto.";
  }
  return "Great, I'll keep your info on file for future appointments. If you'd ever prefer not to receive messages, just let me know and I'll respect that.";
}

/**
 * Update the lastInboundMessageAt timestamp for consent tracking.
 * Also re-consents customers who previously opted out — an inbound message
 * is a clear signal they want to communicate again.
 */
export async function touchInboundTimestamp(
  workspaceId: string,
  customerId: string
): Promise<void> {
  const existing = await getConsent(workspaceId, customerId);
  if (!existing) {
    return;
  }

  const updates: Record<string, unknown> = { lastInboundMessageAt: new Date(), updatedAt: new Date() };

  // An inbound message from an opted-out customer means they want to re-engage.
  // Reset consent to 'unknown' so reactive purposes (booking replies, etc.) work.
  if (existing.status === "opted_out") {
    updates.status = "unknown";
    updates.source = "customer_inbound_message";
    updates.notes = "Re-consented by inbound message";
    logger.info("Customer re-consented via inbound message", {
      workspaceId,
      customerId,
      previousStatus: "opted_out",
    });
  }

  await db
    .update(messagingConsent)
    .set(updates)
    .where(
      and(
        eq(messagingConsent.workspaceId, workspaceId),
        eq(messagingConsent.customerId, customerId)
      )
    );
}

/**
 * Cancel all pending outbound queue messages for a customer (opt-out cascade).
 */
async function cancelPendingMessagesForCustomer(
  workspaceId: string,
  customerId: string
): Promise<void> {
  try {
    await db
      .update(outboundQueue)
      .set({
        status: "failed",
        failureReason: "Cancelled due to customer opt-out",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(outboundQueue.workspaceId, workspaceId),
          eq(outboundQueue.customerId, customerId),
          eq(outboundQueue.status, "pending")
        )
      );
  } catch (err) {
    logger.error("Failed to cancel pending messages on opt-out", {
      workspaceId,
      customerId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
