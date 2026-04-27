import { db } from '@zenda/db/client'
import { messages } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

type QueueType = 'safe' | 'unsafe'

interface OfflineItem {
  id: string
  type: QueueType
  action: string
  payload: Record<string, unknown>
  createdAt: number
}

const offlineQueue: OfflineItem[] = []

export function enqueueSafe(action: string, payload: Record<string, unknown>): string {
  const id = `safe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  offlineQueue.push({ id, type: 'safe', action, payload, createdAt: Date.now() })
  logger.info('Safe queue item added', { id, action })
  return id
}

export function enqueueUnsafe(action: string, payload: Record<string, unknown>): string {
  const id = `unsafe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  offlineQueue.push({ id, type: 'unsafe', action, payload, createdAt: Date.now() })
  logger.info('Unsafe queue item added', { id, action })
  return id
}

export function getQueuedItems(type?: QueueType): OfflineItem[] {
  if (type) return offlineQueue.filter(i => i.type === type)
  return [...offlineQueue]
}

export function removeItem(id: string): boolean {
  const idx = offlineQueue.findIndex(i => i.id === id)
  if (idx === -1) return false
  offlineQueue.splice(idx, 1)
  return true
}

export function clearQueue(type?: QueueType): number {
  if (type) {
    const count = offlineQueue.filter(i => i.type === type).length
    const remaining = offlineQueue.filter(i => i.type !== type)
    offlineQueue.length = 0
    offlineQueue.push(...remaining)
    return count
  }
  const count = offlineQueue.length
  offlineQueue.length = 0
  return count
}

export async function flushUnsafeQueue(
  sendFn: (item: OfflineItem) => Promise<boolean>,
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  const unsafeItems = offlineQueue.filter(i => i.type === 'unsafe')

  for (const item of unsafeItems) {
    try {
      const success = await sendFn(item)
      if (success) {
        removeItem(item.id)
        sent++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  logger.info('Unsafe queue flushed', { sent, failed })
  return { sent, failed }
}
