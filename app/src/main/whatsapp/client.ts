import { EventEmitter } from 'events'
import { BrowserWindow } from 'electron'
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
} from '@whiskeysockets/baileys'
import QRCode from 'qrcode'
import { getSessionPath, clearSession } from './session.js'
import { forwardWhatsAppMessage, forwardWhatsAppStatus } from './bridge.js'

export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_required' | 'connected' | 'error'
  phoneNumber?: string
  qrData?: string
  error?: string
}

let sock: WASocket | null = null
const emitter = new EventEmitter()

function emitStatus(status: WhatsAppStatus) {
  emitter.emit('status', status)
}

export async function initWhatsAppClient(_mainWindow?: BrowserWindow): Promise<void> {
  if (sock) {
    sock.end(undefined)
    sock = null
  }

  const { state, saveCreds } = await useMultiFileAuthState(getSessionPath())
  const { version } = await fetchLatestBaileysVersion()

  emitStatus({ status: 'connecting' })

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: {
      level: 'silent',
      info: () => {},
      debug: () => {},
      trace: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
      child: () => ({ level: 'silent', info: () => {}, debug: () => {}, trace: () => {}, warn: () => {}, error: () => {}, fatal: () => {}, child: () => ({} as any) } as any),
    } as any,
  })

  // Save credentials whenever they update
  sock.ev.on('creds.update', saveCreds)

  // Connection lifecycle
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
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
    }

    if (connection === 'close') {
      const code = (lastDisconnect?.error as any)?.output?.statusCode ?? lastDisconnect?.error?.message
      const loggedOut = (lastDisconnect?.error as any)?.output?.statusCode === DisconnectReason.loggedOut

      if (loggedOut) {
        clearSession()
        sock = null
        emitStatus({ status: 'disconnected', error: 'Logged out' })
        forwardWhatsAppStatus('logged_out')
      } else {
        emitStatus({ status: 'connecting' })
        // Reconnect
        await initWhatsAppClient(_mainWindow)
      }
    } else if (connection === 'open') {
      const phoneNumber = sock?.user?.id?.split(':')[0]
      emitStatus({ status: 'connected', phoneNumber })
      forwardWhatsAppStatus('connected', phoneNumber)
    } else if (connection === 'connecting') {
      emitStatus({ status: 'connecting' })
    }
  })

  // Incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {
        const jid = msg.key.remoteJid ?? ''
        const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('@c.us', '')

        let body = ''
        let contentType: string = 'text'

        if (msg.message?.conversation) {
          body = msg.message.conversation
        } else if (msg.message?.extendedTextMessage?.text) {
          body = msg.message.extendedTextMessage.text
        } else if (msg.message?.imageMessage) {
          contentType = 'image'
          body = msg.message.imageMessage.caption ?? ''
        } else if (msg.message?.audioMessage) {
          contentType = 'audio'
        } else if (msg.message?.videoMessage) {
          contentType = 'video'
          body = msg.message.videoMessage.caption ?? ''
        } else if (msg.message?.documentMessage) {
          contentType = 'document'
          body = msg.message.documentMessage.fileName ?? ''
        } else if (msg.message?.contactMessage) {
          contentType = 'contact'
          body = msg.message.contactMessage.displayName ?? ''
        } else if (msg.message?.locationMessage) {
          contentType = 'location'
          body = `${msg.message.locationMessage.degreesLatitude},${msg.message.locationMessage.degreesLongitude}`
        }

        if (!body && contentType === 'text') continue

        const ts = msg.messageTimestamp
        const timestamp = typeof ts === 'number'
          ? new Date(ts * 1000).toISOString()
          : new Date().toISOString()

        forwardWhatsAppMessage({
          phoneNumber,
          body,
          contentType,
          timestamp,
          externalMessageId: msg.key.id ?? undefined,
        })
      }
    }
  })
}

export function getClient(): WASocket | null {
  return sock
}

export function disconnectWhatsApp() {
  if (sock) {
    sock.end(undefined)
    sock = null
  }
  emitStatus({ status: 'disconnected' })
}

export function onStatus(callback: (status: WhatsAppStatus) => void) {
  emitter.on('status', callback)
  return () => emitter.off('status', callback)
}

export { emitter }
