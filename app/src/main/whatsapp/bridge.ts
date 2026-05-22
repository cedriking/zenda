import { BrowserWindow } from 'electron'
import { WebSocket } from 'ws'
import { getClient } from './client.js'

const log = (...args: unknown[]) => console.log('[bridge]', ...args)

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
    log('Connected to API at', WS_URL)
    mainWindow.webContents.send('bridge:status', { connected: true })
  })

  ws.on('message', (data: Buffer) => {
    try {
      const payload = JSON.parse(data.toString())

      // Forward responses and notifications to renderer
      if (payload.type === 'response.send') {
        const phoneNumber = payload.data?.phoneNumber
        const messageBody = payload.data?.message?.body
        log('Received response.send for', phoneNumber, ':', String(messageBody).slice(0, 80))

        // Forward to renderer for UI updates
        mainWindow.webContents.send('whatsapp:send-response', payload.data)

        // Send via Baileys to the WhatsApp contact
        if (phoneNumber && messageBody) {
          const sock = getClient()
          if (sock) {
            const jid = `${phoneNumber}@s.whatsapp.net`
            sock.sendMessage(jid, { text: messageBody })
              .then(() => {
                log('Reply sent to', jid)
              })
              .catch((err: unknown) => {
                log('Failed to send reply to', jid, err)
              })
          } else {
            log('Cannot send reply: Baileys socket not connected')
          }
        } else {
          log('response.send missing phoneNumber or message.body — skipping WhatsApp delivery')
        }
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
      log('Too many auth failures, stopping reconnect. Please re-login.')
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
      log('Max reconnect attempts reached, stopping.')
      mainWindow.webContents.send('bridge:status', {
        connected: false,
        error: `Connection lost after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check your connection and re-login.`,
      })
      return
    }

    // Auto-reconnect with backoff (5s base, doubling each attempt, max 60s)
    const backoff = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 60000)
    log(`Reconnecting in ${backoff}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
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
