/**
 * Follow-Up Service for Incomplete Booking Flows
 *
 * Tracks customers who started but did not complete a booking.
 * Sends at most one natural follow-up per customer after 30 minutes.
 */

import { db } from "@zenda/db/client";
import type {
  Language,
  MessagePurpose,
  MessagingConsentStatus,
} from "@zenda/shared";
import { OUTBOUND_LIMITS } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { wsMessageSender } from "../../infra/message-sender.js";
import { getOutboundCount, incrementOutbound } from "./outbound-tracker.js";
import { canSendOutboundMessage } from "./sending-policy.js";

interface BookingAttempt {
  conversationId: string;
  customerId: string;
  lastActivity: Date;
  sentCount: number;
  workspaceId: string;
}

// In-memory tracking of incomplete booking attempts
const activeAttempts = new Map<string, BookingAttempt>();

/** Keyed by customerId — one attempt tracked per customer */
function attemptKey(customerId: string): string {
  return customerId;
}

/**
 * Record the start of a booking attempt.
 */
export function trackBookingAttempt(
  workspaceId: string,
  customerId: string,
  conversationId: string
): void {
  activeAttempts.set(attemptKey(customerId), {
    workspaceId,
    customerId,
    conversationId,
    lastActivity: new Date(),
    sentCount: 0,
  });
  logger.info("Booking attempt tracked", {
    workspaceId,
    customerId,
    conversationId,
  });
}

/**
 * Mark a booking as completed — remove from tracking.
 */
export function completeBookingAttempt(customerId: string): void {
  activeAttempts.delete(attemptKey(customerId));
  logger.info("Booking attempt completed", { customerId });
}

/**
 * Check all tracked incomplete bookings and send a follow-up
 * to any that are older than 30 minutes with sentCount < 1.
 *
 * Should be called periodically (e.g. every 5-10 minutes).
 */
export async function checkAndSendFollowUp(): Promise<number> {
  const now = Date.now();
  const thresholdMs = OUTBOUND_LIMITS.FOLLOW_UP_DELAY_MS; // 30 minutes
  let sentCount = 0;

  for (const [key, attempt] of activeAttempts) {
    const elapsed = now - attempt.lastActivity.getTime();

    // Not old enough yet
    if (elapsed < thresholdMs) {
      continue;
    }

    // Already sent the max follow-ups
    if (attempt.sentCount >= OUTBOUND_LIMITS.MAX_FOLLOW_UPS) {
      // Clean up stale entries that have already been followed up
      if (attempt.sentCount >= OUTBOUND_LIMITS.MAX_FOLLOW_UPS) {
        activeAttempts.delete(key);
      }
      continue;
    }

    try {
      // ── 1. Fetch customer, workspace, and consent info ──
      const cust = await db.customer.findUnique({
        where: { id: attempt.customerId },
        include: {
          workspace: true,
          messagingConsent: true,
        },
      });

      if (!cust) {
        activeAttempts.delete(key);
        continue;
      }

      const ws = cust.workspace;
      const consent = (cust as Record<string, unknown>)
        .messagingConsent as Awaited<
        ReturnType<typeof db.messagingConsent.findFirst>
      > | null;

      // ── 2. Check outbound limits ──
      const outboundCount = await getOutboundCount(ws.id, cust.id);
      const consentStatus: MessagingConsentStatus =
        consent?.status ?? "unknown";

      const decision = canSendOutboundMessage({
        channel: "whatsapp_ba_bridge",
        purpose: "booking_follow_up" as MessagePurpose,
        consentStatus,
        allowedPurposes: consent?.allowedPurposes as
          | MessagePurpose[]
          | undefined,
        outboundSinceLastInbound: outboundCount,
        maxOutboundWithoutReply: OUTBOUND_LIMITS.MAX_OUTBOUND_WITHOUT_REPLY,
        isDuplicate: false,
        appointmentCancelled: false,
        appointmentCompleted: false,
        appointmentTimePassed: false,
        connectorSessionStable: true,
      });

      if (!decision.allowed) {
        logger.info("Follow-up blocked by sending policy", {
          customerId: cust.id,
          reason: decision.reason,
        });
        // Don't delete — keep tracking so we can retry if the block is temporary
        continue;
      }

      // ── 3. Compose and send natural follow-up ──
      const language = (cust.language ?? ws.defaultLanguage) as Language;
      const customerName = cust.name ?? cust.phoneNumber;

      const body =
        language === "es"
          ? `Hola${customerName === cust.phoneNumber ? "" : ` ${customerName}`}, noté que no terminamos de agendar tu cita. Te gustaría continuar?`
          : `Hi${customerName === cust.phoneNumber ? "" : ` ${customerName}`}, I noticed we didn't finish booking your appointment. Would you like to continue?`;

      const delivered = wsMessageSender.send(ws.id, {
        type: "whatsapp.message",
        data: {
          phoneNumber: cust.phoneNumber,
          body,
          contentType: "text",
          timestamp: new Date().toISOString(),
          conversationId: attempt.conversationId,
        },
      });

      if (delivered) {
        // Increment outbound counter for rate-limit tracking
        await incrementOutbound(
          ws.id,
          cust.id,
          "booking_follow_up" as MessagePurpose,
          attempt.conversationId
        );

        attempt.sentCount++;
        sentCount++;

        logger.info("Follow-up sent", {
          customerId: cust.id,
          workspaceId: ws.id,
          sentCount: attempt.sentCount,
        });
      }

      // Remove after max follow-ups sent
      if (attempt.sentCount >= OUTBOUND_LIMITS.MAX_FOLLOW_UPS) {
        activeAttempts.delete(key);
      }
    } catch (err) {
      logger.error("Failed to send follow-up", {
        customerId: attempt.customerId,
        error: (err as Error).message,
      });
    }
  }

  return sentCount;
}
