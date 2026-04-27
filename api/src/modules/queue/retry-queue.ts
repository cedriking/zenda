import { logger } from '../../infra/logger.js'

interface QueuedMessage {
  id: string
  workspaceId: string
  conversationId: string
  content: string
  contentType: string
  attempts: number
  maxAttempts: number
  nextRetry: number
  createdAt: number
}

const retryQueue: QueuedMessage[] = []
const BASE_DELAY = 1000 // 1 second
const MAX_DELAY = 60_000 // 1 minute

function generateId(): string {
  return `retry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function enqueueForRetry(msg: {
  workspaceId: string
  conversationId: string
  content: string
  contentType: string
}): string {
  const id = generateId()
  const delay = Math.min(BASE_DELAY * Math.pow(2, 0), MAX_DELAY)

  retryQueue.push({
    id,
    workspaceId: msg.workspaceId,
    conversationId: msg.conversationId,
    content: msg.content,
    contentType: msg.contentType,
    attempts: 0,
    maxAttempts: 5,
    nextRetry: Date.now() + delay,
    createdAt: Date.now(),
  })

  logger.info('Message enqueued for retry', { id, conversationId: msg.conversationId })
  return id
}

export async function processRetryQueue(
  sendFn: (msg: QueuedMessage) => Promise<boolean>,
): Promise<{ processed: number; failed: number }> {
  const now = Date.now()
  let processed = 0
  let failed = 0

  for (let i = retryQueue.length - 1; i >= 0; i--) {
    const msg = retryQueue[i]
    if (msg.nextRetry > now) continue

    try {
      const success = await sendFn(msg)
      if (success) {
        retryQueue.splice(i, 1)
        processed++
        logger.info('Retry message sent', { id: msg.id })
      } else {
        msg.attempts++
        if (msg.attempts >= msg.maxAttempts) {
          retryQueue.splice(i, 1)
          failed++
          logger.error('Retry exhausted, dropping message', { id: msg.id, attempts: msg.attempts })
        } else {
          msg.nextRetry = now + Math.min(BASE_DELAY * Math.pow(2, msg.attempts), MAX_DELAY)
          logger.warn('Retry failed, rescheduling', { id: msg.id, attempts: msg.attempts })
        }
      }
    } catch (err) {
      msg.attempts++
      msg.nextRetry = now + Math.min(BASE_DELAY * Math.pow(2, msg.attempts), MAX_DELAY)
    }
  }

  return { processed, failed }
}

export function getQueueStats(): { pending: number; oldest: number } {
  return {
    pending: retryQueue.length,
    oldest: retryQueue.length > 0 ? Date.now() - retryQueue[0].createdAt : 0,
  }
}
