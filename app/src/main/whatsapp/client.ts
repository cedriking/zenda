import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'

// whatsapp-web.js runs inside Electron's Chromium — no Puppeteer needed
// We use dynamic import since it's only available in main process
let whatsappClient: any = null
const emitter = new EventEmitter()

export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_required' | 'connected' | 'error'
  phoneNumber?: string
  qrData?: string
  error?: string
}

export async function initWhatsAppClient(mainWindow: BrowserWindow): Promise<void> {
  try {
    const { default: makeWASocket } = await import('@whiskeysockets/baileys')
    // Note: In production, whatsapp-web.js is used. For dev without a phone,
    // this is a stub that sends status to the renderer.
    // Full implementation requires whatsapp-web.js with Electron's Chromium.

    const status: WhatsAppStatus = { status: 'connecting' }
    mainWindow.webContents.send('whatsapp:status', status)

    // TODO: Replace with actual whatsapp-web.js init when in production
    // For now, emit QR_required so the UI can show the QR flow
    emitter.emit('status', { status: 'qr_required' } as WhatsAppStatus)
    mainWindow.webContents.send('whatsapp:status', { status: 'qr_required' })
  } catch (error) {
    const status: WhatsAppStatus = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to initialize WhatsApp',
    }
    mainWindow.webContents.send('whatsapp:status', status)
  }
}

export function getWhatsAppClient() {
  return whatsappClient
}

export function disconnectWhatsApp() {
  if (whatsappClient) {
    whatsappClient.destroy()
    whatsappClient = null
  }
  emitter.emit('status', { status: 'disconnected' } as WhatsAppStatus)
}

export function onStatus(callback: (status: WhatsAppStatus) => void) {
  emitter.on('status', callback)
  return () => emitter.off('status', callback)
}

export { emitter }
