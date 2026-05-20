/**
 * Queue Processor
 *
 * Main processing loop for the persistent outbound message queue.
 * Dequeues messages, runs the sending policy engine, and sends via WebSocket.
 */
import { dequeueNext, markSent, markFailed, type QueuedMessage } from './persistent-queue.js'
import { canSendOutboundMessage } from '../messaging/sending-policy.js'
import { getOutboundCount, resetOnInbound } from '../messaging/outbound-tracker.js'
import { getConsent } from '../messaging/consent-service.js'
import { sendToWorkspace } from '../whatsapp/connection-manager.js'
import { db } from '@zenda/db/client'
import { appointments, customers } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

let processingInterval: ReturnType<typeof setInterval> | null = null
let isPaused = false

const DEFAULT_INTERVAL_MS = 5000 // 5 seconds

/**
 * Process a single message from the queue.
 */
async function processOne(): Promise<boolean> {
  const msg = await dequeueNext()
  if (!msg) return false

  try {
    // Fetch related data for sending policy check
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, msg.customerId))
      .limit(1)

    if (!customer) {
      await markFailed(msg.id, 'Customer not found')
      return true
    }

    // Check consent
    const consent = await getConsent(msg.workspaceId, msg.customerId)
    const outboundCount = await getOutboundCount(msg.workspaceId, msg.customerId)

    // Check appointment state if this is appointment-related
    let appointmentCancelled = false
    let appointmentCompleted = false
    let appointmentTimePassed = false

    if (msg.appointmentId) {
      const [appt] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, msg.appointmentId))
        .limit(1)

      if (appt) {
        appointmentCancelled = appt.status === 'cancelled'
        appointmentCompleted = appt.status === 'completed'
        appointmentTimePassed = appt.startAt ? new Date(appt.startAt) < new Date() : false
      }
    }

    // Run sending policy engine
    const decision = canSendOutboundMessage({
      channel: 'whatsapp_ba_bridge',
      purpose: msg.purpose,
      consentStatus: consent?.status ?? 'unknown',
      allowedPurposes: consent?.allowedPurposes as any[] ?? undefined,
      outboundSinceLastInbound: outboundCount,
      maxOutboundWithoutReply: 3,
      isDuplicate: false,
      appointmentCancelled,
      appointmentCompleted,
      appointmentTimePassed,
      connectorSessionStable: true,
    })

    if (!decision.allowed) {
      await markFailed(msg.id, `Sending policy blocked: ${decision.reason}`)
      logger.info('Message dropped by sending policy', {
        queueId: msg.id,
        reason: decision.reason,
      })
      return true
    }

    // Send via WebSocket to workspace
    sendToWorkspace(msg.workspaceId, {
      type: 'response.send',
      data: {
        conversationId: msg.conversationId,
        message: {
          body: msg.content,
          senderType: 'system',
          contentType: msg.contentType,
          purpose: msg.purpose,
        },
      },
    })

    await markSent(msg.id)
    logger.info('Queued message sent', {
      queueId: msg.id,
      workspaceId: msg.workspaceId,
      purpose: msg.purpose,
    })

    return true
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    await markFailed(msg.id, reason)
    logger.error('Failed to process queued message', {
      queueId: msg.id,
      error: reason,
    })
    return true
  }
}

/**
 * Process a batch of messages from the queue.
 */
export async function processQueue(batchSize = 10): Promise<{ processed: number }> {
  if (isPaused) return { processed: 0 }

  let processed = 0
  for (let i = 0; i < batchSize; i++) {
    const hadWork = await processOne()
    if (!hadWork) break
    processed++
  }

  return { processed }
}

/**
 * Start the queue processor on an interval.
 */
export function startProcessor(intervalMs = DEFAULT_INTERVAL_MS): void {
  if (processingInterval) return

  logger.info('Starting queue processor', { intervalMs })
  processingInterval = setInterval(async () => {
    try {
      await processQueue()
    } catch (err) {
      logger.error('Queue processor error', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }, intervalMs)
}

/**
 * Stop the queue processor.
 */
export function stopProcessor(): void {
  if (processingInterval) {
    clearInterval(processingInterval)
    processingInterval = null
    logger.info('Queue processor stopped')
  }
}

/**
 * Pause all outbound processing (kill switch).
 */
export function pauseOutbound(): void {
  isPaused = true
  logger.warn('Outbound queue paused (kill switch activated)')
}

/**
 * Resume outbound processing.
 */
export function resumeOutbound(): void {
  isPaused = false
  logger.info('Outbound queue resumed')
}

/**
 * Check if outbound is currently paused.
 */
export function isOutboundPaused(): boolean {
  return isPaused
}
