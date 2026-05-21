/**
 * Offline Queue Revalidator
 *
 * Called when a WhatsApp connector reconnects after being offline.
 * Reviews all pending messages for a workspace and drops any that are
 * no longer valid (appointment cancelled, time passed, customer opted out, etc.).
 */
import { db } from "@zenda/db/client";
import { appointments, messagingConsent } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";
import { logger } from "../../infra/logger.js";
import { createNotification } from "../notification/service.js";
import {
  getPendingMessages,
  markFailed,
  type QueuedMessage,
} from "./persistent-queue.js";

interface RevalidationResult {
  dropped: number;
  kept: number;
  reasons: Record<string, number>;
}

/**
 * Revalidate all pending messages for a workspace after a reconnect.
 * Drops messages that are no longer valid.
 */
export async function revalidateQueue(
  workspaceId: string
): Promise<RevalidationResult> {
  const pending = await getPendingMessages(workspaceId);

  if (pending.length === 0) {
    return { kept: 0, dropped: 0, reasons: {} };
  }

  logger.info("Revalidating pending queue", {
    workspaceId,
    pendingCount: pending.length,
  });

  const reasons: Record<string, number> = {};
  let kept = 0;
  let dropped = 0;
  const importantDroppedReasons: string[] = [];

  for (const msg of pending) {
    const validation = await validateMessage(msg);

    if (validation.valid) {
      kept++;
      continue;
    }

    const reason = validation.reason ?? "unknown";
    await markFailed(msg.id, reason);
    dropped++;
    reasons[reason] = (reasons[reason] ?? 0) + 1;

    const isImportant = [
      "appointment_cancelled",
      "appointment_time_passed",
    ].includes(reason);
    if (isImportant) {
      importantDroppedReasons.push(`${msg.purpose}: ${validation.reason}`);
    }

    logger.info("Dropped invalid queued message", {
      queueId: msg.id,
      workspaceId,
      reason: validation.reason,
      purpose: msg.purpose,
    });
  }

  // Notify owner if important messages were dropped
  if (importantDroppedReasons.length > 0) {
    await createNotification({
      workspaceId,
      type: "needs_attention",
      title: "Some queued messages could not be delivered",
      body: `After reconnecting, ${importantDroppedReasons.length} message(s) were dropped: ${importantDroppedReasons.slice(0, 5).join("; ")}`,
    }).catch((err) => {
      logger.error("Failed to send revalidation notification", {
        workspaceId,
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }

  logger.info("Queue revalidation complete", {
    workspaceId,
    kept,
    dropped,
    reasons,
  });

  return { kept, dropped, reasons };
}

async function validateMessage(
  msg: QueuedMessage
): Promise<{ valid: boolean; reason?: string }> {
  // 1. Check appointment not cancelled / time not passed
  if (msg.appointmentId) {
    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, msg.appointmentId))
      .limit(1);

    if (!appt) {
      return { valid: false, reason: "appointment_not_found" };
    }

    if (appt.status === "cancelled") {
      return { valid: false, reason: "appointment_cancelled" };
    }

    if (appt.startAt && new Date(appt.startAt) < new Date()) {
      return { valid: false, reason: "appointment_time_passed" };
    }
  }

  // 2. Check customer not opted out
  const [consent] = await db
    .select()
    .from(messagingConsent)
    .where(
      and(
        eq(messagingConsent.workspaceId, msg.workspaceId),
        eq(messagingConsent.customerId, msg.customerId)
      )
    )
    .limit(1);

  if (consent?.status === "opted_out") {
    return { valid: false, reason: "customer_opted_out" };
  }

  // 3. Check for duplicates (same content, same customer, already sent)
  if (msg.metadata?.dedupeKey) {
    // Check outbound_queue for already-sent messages with same purpose/customer/appointment
    const { outboundQueue } = await import("@zenda/db/schema");
    const { and: and_, eq: eq_, isNull } = await import("drizzle-orm");
    const dedupeConditions = [
      eq_(outboundQueue.customerId, msg.customerId),
      eq_(outboundQueue.workspaceId, msg.workspaceId),
      eq_(outboundQueue.purpose, msg.purpose),
      eq_(outboundQueue.status, "sent"),
    ];
    if (msg.appointmentId) {
      dedupeConditions.push(
        eq_(outboundQueue.appointmentId, msg.appointmentId)
      );
    } else {
      dedupeConditions.push(isNull(outboundQueue.appointmentId));
    }
    const duplicates = await db
      .select()
      .from(outboundQueue)
      .where(and_(...dedupeConditions))
      .limit(1);

    if (duplicates.length > 0) {
      return { valid: false, reason: "duplicate_message" };
    }
  }

  return { valid: true };
}
