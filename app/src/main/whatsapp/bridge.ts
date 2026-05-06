import { BrowserWindow } from 'electron'
import { WebSocket } from 'ws'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
let authFailures = 0

const MAX_RECONNECT_ATTEMPTS = 10
const MAX_AUTH_FAILURES = 2

const WS_URL = process.env.ZENDA_API_WS_URL ?? 'wss://api.zenda.bot/ws'

export function connectBridge(
  mainWindow: BrowserWindow,
  workspaceId: string,
  accessToken: string,
): void {
  if (ws?.readyState === WebSocket.OPEN) return

  const url = `${WS_URL}?workspaceId=${workspaceId}&token=${accessToken}`

  ws = new WebSocket(url)

  ws.on('open', () => {
    // Reset counters on successful connection
    reconnectAttempts = 0
    authFailures = 0
    mainWindow.webContents.send('bridge:status', { connected: true })
  })

  ws.on('message', (data: Buffer) => {
    try {
      const payload = JSON.parse(data.toString())

      // Forward responses and notifications to renderer
      if (payload.type === 'response.send') {
        mainWindow.webContents.send('whatsapp:send-response', payload.data)
      } else if (payload.type === 'notification') {
        mainWindow.webContents.send('notification:new', payload.data)
      } else if (payload.type === 'conversation.update') {
        mainWindow.webContents.send('conversation:update', payload.data)
      } else if (payload.type === 'appointment.update') {
        mainWindow.webContents.send('appointment:update', payload.data)
      } else if (payload.type === 'ping') {
        ws?.send(JSON.stringify({ type: 'pong' }))
      } else if (payload.type === 'error' && payload.code === 'auth_failed') {
        authFailures++
        console.error('[bridge] Auth failure from server, count:', authFailures)
      }
    } catch {
      // ignore parse errors
    }
  })

  ws.on('close', (code: number, _reason: Buffer) => {
    mainWindow.webContents.send('bridge:status', { connected: false })

    // 4001 is a custom close code for authentication failure
    const isAuthError = code === 4001 || code === 1008
    if (isAuthError) {
      authFailures++
    }

    // Stop reconnecting if too many auth failures (token likely expired)
    if (authFailures >= MAX_AUTH_FAILURES) {
      console.error('[bridge] Too many auth failures, stopping reconnect. Please re-login.')
      mainWindow.webContents.send('bridge:status', {
        connected: false,
        error: 'Session expired. Please log in again.',
        requiresReLogin: true,
      })
      return
    }

    // Stop reconnecting after max attempts
    reconnectAttempts++
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      console.error('[bridge] Max reconnect attempts reached, stopping.')
      mainWindow.webContents.send('bridge:status', {
        connected: false,
        error: `Connection lost after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check your connection and re-login.`,
      })
      return
    }

    // Auto-reconnect with backoff (5s base, doubling each attempt, max 60s)
    const backoff = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 60000)
    console.log(`[bridge] Reconnecting in ${backoff}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
    reconnectTimer = setTimeout(() => {
      connectBridge(mainWindow, workspaceId, accessToken)
    }, backoff)
  })

  ws.on('error', (err: Error) => {
    mainWindow.webContents.send('bridge:status', { connected: false, error: err.message })
  })
}

export function sendToBackend(data: unknown): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false
  ws.send(JSON.stringify(data))
  return true
}

export function disconnectBridge(): void {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  if (ws) {
    ws.close()
    ws = null
  }
}

// Forward WhatsApp messages from renderer (received via whatsapp-web.js) to backend
export function forwardWhatsAppMessage(message: {
  phoneNumber: string
  body: string
  contentType: string
  mediaUrl?: string
  timestamp: string
  externalMessageId?: string
}): boolean {
  return sendToBackend({
    type: 'whatsapp.message',
    data: message,
  })
}

// Forward WhatsApp status changes to backend
export function forwardWhatsAppStatus(status: string, phoneNumber?: string): boolean {
  return sendToBackend({
    type: 'whatsapp.status',
    data: { status, phoneNumber },
  })
}
