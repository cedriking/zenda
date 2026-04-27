import { Elysia } from 'elysia'
import { addConnection, removeConnection, sendToWorkspace, startHeartbeat } from './connection-manager.js'
import { logger } from '../../infra/logger.js'

// Incoming message from desktop app (WhatsApp message received)
interface WhatsAppMessagePayload {
  type: 'whatsapp.message'
  data: {
    phoneNumber: string
    body: string
    contentType: 'text' | 'audio' | 'image' | 'file' | 'system'
    mediaUrl?: string
    timestamp: string
    externalMessageId?: string
  }
}

// Connection status update from desktop app
interface WhatsAppStatusPayload {
  type: 'whatsapp.status'
  data: {
    status: string
    phoneNumber?: string
  }
}

type IncomingPayload = WhatsAppMessagePayload | WhatsAppStatusPayload | { type: 'pong' }

export const wsModule = new Elysia({ prefix: '/ws' })
  .ws('/', {
    open(ws) {
      // Extract workspaceId from query params (validated in upgrade)
      const workspaceId = (ws.data as Record<string, unknown>).workspaceId as string
      const userId = (ws.data as Record<string, unknown>).userId as string

      if (!workspaceId || !userId) {
        ws.close(4003, 'Unauthorized')
        return
      }

      logger.info('WebSocket connected', { workspaceId, userId })
      addConnection(workspaceId, ws as any)

      const heartbeat = startHeartbeat(workspaceId, ws as any)
      // Store heartbeat stopper on ws for cleanup
      ;(ws as any).__heartbeat = heartbeat
    },

    message(ws, rawMessage) {
      const workspaceId = (ws.data as Record<string, unknown>).workspaceId as string

      let payload: IncomingPayload
      try {
        payload = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage
      } catch {
        logger.warn('Invalid WS message', { workspaceId })
        return
      }

      // Handle pong (heartbeat response)
      if (payload.type === 'pong') {
        ;(ws as any).__heartbeat?.pong()
        return
      }

      // Route to conversation engine
      if (payload.type === 'whatsapp.message') {
        const msgPayload = payload as WhatsAppMessagePayload
        // Import dynamically to avoid circular deps
        import('../conversation/engine.js').then(({ processIncomingMessage }) => {
          processIncomingMessage(workspaceId, msgPayload.data)
        }).catch((err) => {
          logger.error('Failed to process message', { error: err.message, workspaceId })
        })
        return
      }

      // Handle WhatsApp status updates
      if (payload.type === 'whatsapp.status') {
        const statusPayload = payload as WhatsAppStatusPayload
        logger.info('WhatsApp status update', { workspaceId, status: statusPayload.data.status })

        // Update connection status in DB
        import('drizzle-orm').then(({ eq }) => {
          import('@zenda/db/client').then(({ db }) => {
            import('@zenda/db/schema').then(({ whatsappConnections }) => {
              db.update(whatsappConnections)
                .set({ status: statusPayload.data.status as any, updatedAt: new Date() })
                .where(eq(whatsappConnections.workspaceId, workspaceId))
            })
          })
        }).catch(() => {})
        return
      }

      logger.warn('Unknown WS message type', { type: (payload as any).type, workspaceId })
    },

    close(ws) {
      const workspaceId = (ws.data as Record<string, unknown>).workspaceId as string
      logger.info('WebSocket disconnected', { workspaceId })
      ;(ws as any).__heartbeat?.stop()
      removeConnection(workspaceId)
    },
  })

// Export for use by other modules to send messages back
export { sendToWorkspace }
