/**
 * Queue Processor
 *
 * Main processing loop for the persistent outbound message queue.
 * Dequeues messages, runs the sending policy engine, and sends via WebSocket.
 */

import { db } from "@zenda/db/client";
import { appointments, customers } from "@zenda/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "../../infra/logger.js";
import { wsMessageSender } from "../../infra/message-sender.js";
import { getConsent } from "../messaging/consent-service.js";
import { getOutboundCount } from "../messaging/outbound-tracker.js";
import { canSendOutboundMessage } from "../messaging/sending-policy.js";
import { shouldRestrictProactive } from "../usage/tracker.js";
import { logMessageSent } from "../audit/logger.js";
import { dequeueNext, markFailed, markSent } from "./persistent-queue.js";

let processingInterval: ReturnType<typeof setInterval> | null = null;
let isPaused = false;

const DEFAULT_INTERVAL_MS = 5000; // 5 seconds
const WORKSPACE_RATE_LIMIT_PER_HOUR = 100;
const WORKSPACE_RATE_WINDOW_MS = 3_600_000; // 1 hour

// In-memory workspace rate limit counters
const workspaceSentTimestamps = new Map<string, number[]>();
let killSwitchState: "running" | "paused" | null = null; // null = not yet loaded from DB

/**
 * Check workspace-level outbound rate limit.
 */
function isWorkspaceRateLimited(workspaceId: string): boolean {
  const now = Date.now();
  const timestamps = workspaceSentTimestamps.get(workspaceId) ?? [];
  const recent = timestamps.filter((t) => now - t < WORKSPACE_RATE_WINDOW_MS);
  workspaceSentTimestamps.set(workspaceId, recent);
  return recent.length >= WORKSPACE_RATE_LIMIT_PER_HOUR;
}

function recordWorkspaceSend(workspaceId: string): void {
  const now = Date.now();
  const timestamps = workspaceSentTimestamps.get(workspaceId) ?? [];
  timestamps.push(now);
  workspaceSentTimestamps.set(workspaceId, timestamps);
}

/**
 * Persist kill switch state to DB so it survives restarts.
 */
async function persistKillSwitch(state: "running" | "paused"): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES ('outbound_kill_switch', ${state}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${state}, updated_at = NOW()
    `);
    killSwitchState = state;
  } catch (err) {
    logger.error("Failed to persist kill switch state", {
      error: (err as Error).message,
    });
  }
}

/**
 * Load kill switch state from DB on startup.
 */
async function loadKillSwitchState(): Promise<void> {
  if (killSwitchState !== null) {
    return;
  }
  try {
    const [row] = (await db.execute(sql`
      SELECT value FROM system_settings WHERE key = 'outbound_kill_switch'
    `)) as any;
    killSwitchState = row?.[0]?.value === "paused" ? "paused" : "running";
    isPaused = killSwitchState === "paused";
    if (isPaused) {
      logger.warn(
        "Kill switch was paused before restart, maintaining paused state"
      );
    }
  } catch {
    // Table may not exist yet — default to running
    killSwitchState = "running";
    isPaused = false;
  }
}

/**
 * Process a single message from the queue.
 */
async function processOne(): Promise<boolean> {
  const msg = await dequeueNext();
  if (!msg) {
    return false;
  }

  try {
    // Fetch related data for sending policy check
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, msg.customerId))
      .limit(1);

    if (!customer) {
      await markFailed(msg.id, "Customer not found");
      return true;
    }

    // Check consent
    const consent = await getConsent(msg.workspaceId, msg.customerId);
    const outboundCount = await getOutboundCount(
      msg.workspaceId,
      msg.customerId
    );

    // Workspace-level rate limit check
    if (isWorkspaceRateLimited(msg.workspaceId)) {
      await markFailed(msg.id, "Workspace hourly rate limit exceeded");
      logger.info("Message dropped by workspace rate limit", {
        queueId: msg.id,
        workspaceId: msg.workspaceId,
      });
      return true;
    }

    // Check appointment state if this is appointment-related
    let appointmentCancelled = false;
    let appointmentCompleted = false;
    let appointmentTimePassed = false;

    if (msg.appointmentId) {
      const [appt] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, msg.appointmentId))
        .limit(1);

      if (appt) {
        appointmentCancelled = appt.status === "cancelled";
        appointmentCompleted = appt.status === "completed";
        appointmentTimePassed = appt.startAt
          ? new Date(appt.startAt) < new Date()
          : false;
      }
    }

    // Check connector health
    const connectorStable = wsMessageSender.isConnected(msg.workspaceId);

    // Usage gate: suppress proactive messages when at 100% of active contact limit
    const PROACTIVE_PURPOSES = [
      "appointment_reminder",
      "booking_follow_up",
      "business_follow_up",
    ];
    if (PROACTIVE_PURPOSES.includes(msg.purpose)) {
      const restricted = await shouldRestrictProactive(msg.workspaceId);
      if (restricted) {
        await markFailed(
          msg.id,
          "Usage limit reached — proactive messages suppressed"
        );
        logger.info("Proactive message dropped by usage limit", {
          queueId: msg.id,
          workspaceId: msg.workspaceId,
          purpose: msg.purpose,
        });
        return true;
      }
    }

    // Determine if there's an active appointment context
    const hasActiveAppointmentContext = !!(
      msg.appointmentId &&
      !appointmentCancelled &&
      !appointmentCompleted &&
      !appointmentTimePassed
    );

    // Run sending policy engine
    const decision = canSendOutboundMessage({
      channel: "whatsapp_ba_bridge",
      purpose: msg.purpose,
      consentStatus: consent?.status ?? "unknown",
      allowedPurposes: (consent?.allowedPurposes as any[]) ?? undefined,
      outboundSinceLastInbound: outboundCount,
      maxOutboundWithoutReply: 3,
      isDuplicate: false,
      appointmentCancelled,
      appointmentCompleted,
      appointmentTimePassed,
      connectorSessionStable: connectorStable,
      hasActiveAppointmentContext,
    });

    if (!decision.allowed) {
      await markFailed(msg.id, `Sending policy blocked: ${decision.reason}`);
      logger.info("Message dropped by sending policy", {
        queueId: msg.id,
        reason: decision.reason,
      });
      return true;
    }

    // Send via WebSocket to workspace
    wsMessageSender.send(msg.workspaceId, {
      type: "response.send",
      data: {
        conversationId: msg.conversationId,
        phoneNumber: customer.phoneNumber,
        message: {
          body: msg.content,
          senderType: "system",
          contentType: msg.contentType,
          purpose: msg.purpose,
        },
      },
    });

    await markSent(msg.id);
    recordWorkspaceSend(msg.workspaceId);
    if (msg.conversationId) {
      await logMessageSent(msg.workspaceId, msg.conversationId, msg.contentType, 'queue_send');
    }
    logger.info("Queued message sent", {
      queueId: msg.id,
      workspaceId: msg.workspaceId,
      purpose: msg.purpose,
    });

    return true;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await markFailed(msg.id, reason);
    logger.error("Failed to process queued message", {
      queueId: msg.id,
      error: reason,
    });
    return true;
  }
}

/**
 * Process a batch of messages from the queue.
 */
export async function processQueue(
  batchSize = 10
): Promise<{ processed: number }> {
  if (isPaused) {
    return { processed: 0 };
  }

  let processed = 0;
  for (let i = 0; i < batchSize; i++) {
    const hadWork = await processOne();
    if (!hadWork) {
      break;
    }
    processed++;
  }

  return { processed };
}

/**
 * Start the queue processor on an interval.
 */
export function startProcessor(intervalMs = DEFAULT_INTERVAL_MS): void {
  if (processingInterval) {
    return;
  }

  // Load persisted kill switch state on startup
  loadKillSwitchState().catch(() => {});

  logger.info("Starting queue processor", { intervalMs });
  processingInterval = setInterval(async () => {
    try {
      await processQueue();
    } catch (err) {
      logger.error("Queue processor error", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, intervalMs);
}

/**
 * Stop the queue processor.
 */
export function stopProcessor(): void {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    logger.info("Queue processor stopped");
  }
}

/**
 * Pause all outbound processing (kill switch).
 */
export function pauseOutbound(): void {
  isPaused = true;
  persistKillSwitch("paused").catch(() => {});
  logger.warn("Outbound queue paused (kill switch activated)");
}

/**
 * Resume outbound processing.
 */
export function resumeOutbound(): void {
  isPaused = false;
  persistKillSwitch("running").catch(() => {});
  logger.info("Outbound queue resumed");
}

/**
 * Check if outbound is currently paused.
 */
export function isOutboundPaused(): boolean {
  return isPaused;
}
