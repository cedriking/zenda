import { BrowserWindow } from 'electron'
import { WebSocket } from 'ws'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

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
      }
    } catch {
      // ignore parse errors
    }
  })

  ws.on('close', () => {
    mainWindow.webContents.send('bridge:status', { connected: false })
    // Auto-reconnect after 5s
    reconnectTimer = setTimeout(() => {
      connectBridge(mainWindow, workspaceId, accessToken)
    }, 5000)
  })

  ws.on('error', (err) => {
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
