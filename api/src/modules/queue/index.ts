import { Elysia } from 'elysia'
import { getQueuedItems, clearQueue } from './offline-queue.js'
import { getQueueStats as getRetryQueueStats } from './retry-queue.js'
import { getQueueStats, getDeadLetters, retryDeadLetter } from './persistent-queue.js'
import { pauseOutbound, resumeOutbound, isOutboundPaused } from './processor.js'

export const queueModule = new Elysia({ prefix: '/queue' })

  .get('/', async () => {
    const stats = getRetryQueueStats()
    const items = getQueuedItems()
    return {
      retryQueue: stats,
      offlineQueue: {
        total: items.length,
        safe: items.filter(i => i.type === 'safe').length,
        unsafe: items.filter(i => i.type === 'unsafe').length,
      },
    }
  })

  .delete('/', async ({ query }) => {
    const { type } = (query as Record<string, string>) ?? {}
    const cleared = clearQueue(type as any)
    return { cleared }
  })

  .get('/stats', async ({ query }) => {
    const { workspaceId } = (query as Record<string, string>) ?? {}
    if (!workspaceId) {
      return { error: 'workspaceId query parameter is required' }
    }
    const stats = await getQueueStats(workspaceId)
    return {
      workspaceId,
      outboundPaused: isOutboundPaused(),
      ...stats,
    }
  })

  .post('/kill-switch', async ({ body }) => {
    const { action } = (body as Record<string, string>) ?? {}
    if (action === 'pause') {
      pauseOutbound()
      return { status: 'paused', message: 'All outbound message processing has been paused' }
    }
    if (action === 'resume') {
      resumeOutbound()
      return { status: 'resumed', message: 'Outbound message processing has been resumed' }
    }
    // Toggle
    if (isOutboundPaused()) {
      resumeOutbound()
      return { status: 'resumed', message: 'Outbound message processing has been resumed' }
    }
    pauseOutbound()
    return { status: 'paused', message: 'All outbound message processing has been paused' }
  })

  .get('/dead-letters', async ({ query }) => {
    const { workspaceId, limit } = (query as Record<string, string>) ?? {}
    if (!workspaceId) {
      return { error: 'workspaceId query parameter is required' }
    }
    const items = await getDeadLetters(workspaceId, limit ? parseInt(limit) : undefined)
    return { workspaceId, count: items.length, items }
  })

  .post('/dead-letters/:id/retry', async ({ params }) => {
    const result = await retryDeadLetter(params.id)
    if (!result) {
      return { error: 'Dead letter message not found or not in dead_letter status' }
    }
    return { status: 'retried', message: result }
  })
