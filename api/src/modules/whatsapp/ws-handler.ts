import { Elysia } from 'elysia'
import { addConnection, removeConnection, sendToWorkspace, startHeartbeat } from './connection-manager.js'
import { JWT_SECRET } from '../../config/env.js'
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

async function verifyWsToken(token: string): Promise<{ sub?: string; workspaceId?: string } | null> {
  try {
    // Use Web Crypto API for JWT verification (no dependency on Elysia jwt plugin)
    const secret = new TextEncoder().encode(JWT_SECRET)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts
    const header = JSON.parse(atob(headerB64))
    if (header.alg !== 'HS256') return null

    const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0))
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const valid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!valid) return null

    const payload = JSON.parse(atob(payloadB64))
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null

    return { sub: payload.sub, workspaceId: payload.workspaceId }
  } catch {
    return null
  }
}

export const wsModule = new Elysia({ prefix: '/ws' })
  .ws('/', {
    async open(ws) {
      // Extract token from query params for authentication
      const token = (ws.data as Record<string, unknown>).query
        ? (ws.data.query as Record<string, string>).token
        : undefined

      if (!token) {
        ws.close(4003, 'Missing authentication token')
        return
      }

      const payload = await verifyWsToken(token)
      if (!payload?.sub || !payload?.workspaceId) {
        ws.close(4003, 'Invalid or expired token')
        return
      }

      const workspaceId = payload.workspaceId
      const userId = payload.sub

      logger.info('WebSocket connected', { workspaceId, userId })
      addConnection(workspaceId, ws as any)

      // Cache workspaceId on ws for use in message/close handlers
      ;(ws as any).__workspaceId = workspaceId
      ;(ws as any).__userId = userId

      const heartbeat = startHeartbeat(workspaceId, ws as any)
      // Store heartbeat stopper on ws for cleanup
      ;(ws as any).__heartbeat = heartbeat
    },

    message(ws, rawMessage) {
      const url = new URL((ws.data as Record<string, unknown>).url as string ?? '', 'http://localhost')
      const token = url.searchParams.get('token')

      // Re-derive workspaceId from token (stored at connection time)
      // Fall back to parsing from data for backward compat
      let workspaceId: string | undefined

      if (token) {
        // Use cached value from open handler — store on ws
        workspaceId = (ws as any).__workspaceId
      }

      if (!workspaceId) {
        logger.warn('WS message without workspace context')
        return
      }

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
          processIncomingMessage(workspaceId!, msgPayload.data)
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
                .where(eq(whatsappConnections.workspaceId, workspaceId!))
            })
          })
        }).catch(() => {})
        return
      }

      logger.warn('Unknown WS message type', { type: (payload as any).type, workspaceId })
    },

    close(ws) {
      const workspaceId = (ws as any).__workspaceId
      logger.info('WebSocket disconnected', { workspaceId })
      ;(ws as any).__heartbeat?.stop()
      if (workspaceId) removeConnection(workspaceId)
    },
  })

