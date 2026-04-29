import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import { Client, LocalAuth } from 'whatsapp-web.js'
import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { getSessionPath, clearSession } from './session.js'
import { forwardWhatsAppMessage, forwardWhatsAppStatus } from './bridge.js'

export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_required' | 'connected' | 'error'
  phoneNumber?: string
  qrData?: string
  error?: string
}

let client: Client | null = null
const emitter = new EventEmitter()

function emitStatus(status: WhatsAppStatus) {
  emitter.emit('status', status)
}

export async function initWhatsAppClient(_mainWindow?: BrowserWindow): Promise<void> {
  if (client) {
    await client.destroy()
    client = null
  }

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: getSessionPath() }),
    puppeteer: {
      executablePath: puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: true,
    },
  })

  client.on('loading_screen', () => {
    emitStatus({ status: 'connecting' })
  })

  client.on('qr', async (qr: string) => {
    try {
      const qrData = await QRCode.toDataURL(qr, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      emitStatus({ status: 'qr_required', qrData })
    } catch {
      emitStatus({ status: 'qr_required' })
    }
  })

  client.on('ready', () => {
    const phoneNumber = client?.info?.wid?.user
    emitStatus({ status: 'connected', phoneNumber })
    forwardWhatsAppStatus('connected', phoneNumber)
  })

  client.on('authenticated', () => {
    // Session restored — will be followed by 'ready'
    emitStatus({ status: 'connecting' })
  })

  client.on('auth_failure', (msg: string) => {
    emitStatus({ status: 'error', error: `Authentication failed: ${msg}` })
    clearSession()
    forwardWhatsAppStatus('auth_failure')
  })

  client.on('disconnected', (reason: string) => {
    emitStatus({ status: 'disconnected', error: reason })
    forwardWhatsAppStatus('disconnected')
    client = null
  })

  client.on('message', async (message) => {
    // Only forward incoming messages (not sent by us)
    if (message.from !== 'status@broadcast' && !message.fromMe) {
      const contact = await message.getContact()
      forwardWhatsAppMessage({
        phoneNumber: contact.number || message.from.replace('@c.us', ''),
        body: message.body,
        contentType: message.type === 'chat' ? 'text' : message.type,
        mediaUrl: message.hasMedia ? undefined : undefined,
        timestamp: new Date(message.timestamp * 1000).toISOString(),
        externalMessageId: message.id._serialized,
      })
    }
  })

  try {
    emitStatus({ status: 'connecting' })
    await client.initialize()
  } catch (error) {
    emitStatus({
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to initialize WhatsApp',
    })
  }
}

export function getClient(): Client | null {
  return client
}

export function disconnectWhatsApp() {
  if (client) {
    client.destroy()
    client = null
  }
  emitStatus({ status: 'disconnected' })
}

export function onStatus(callback: (status: WhatsAppStatus) => void) {
  emitter.on('status', callback)
  return () => emitter.off('status', callback)
}

export { emitter }
