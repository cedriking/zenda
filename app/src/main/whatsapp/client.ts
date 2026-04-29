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

const log = (...args: unknown[]) => console.log('[baileys]', ...args)

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

  try {
    log('Initializing Baileys WhatsApp client...')
    const sessionPath = getSessionPath()
    log('Session path:', sessionPath)

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    log('Auth state loaded, registered:', state.creds.registered)

    let version: [number, number, number] = [2, 3000, 1014394718]
    try {
      const fetched = await fetchLatestBaileysVersion()
      version = fetched.version
      log('Fetched WA version:', version)
    } catch (e) {
      log('Could not fetch latest version, using fallback:', version, e)
    }

    emitStatus({ status: 'connecting' })

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: {
        level: 'warn',
        info: () => {},
        debug: () => {},
        trace: () => {},
        warn: (...args: unknown[]) => log('WARN:', ...args),
        error: (...args: unknown[]) => log('ERROR:', ...args),
        fatal: (...args: unknown[]) => log('FATAL:', ...args),
        child: () => ({
          level: 'warn',
          info: () => {},
          debug: () => {},
          trace: () => {},
          warn: (...args: unknown[]) => log('WARN:', ...args),
          error: (...args: unknown[]) => log('ERROR:', ...args),
          fatal: (...args: unknown[]) => log('FATAL:', ...args),
          child: () => ({} as any),
        } as any),
      } as any,
    })

    // Save credentials whenever they update
    sock.ev.on('creds.update', saveCreds)

    // Connection lifecycle
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update
      log('Connection update:', connection, qr ? '(has QR)' : '', lastDisconnect?.error?.message ?? '')

      if (qr) {
        try {
          const qrData = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          })
          emitStatus({ status: 'qr_required', qrData })
        } catch (e) {
          log('QR generation error:', e)
          emitStatus({ status: 'qr_required' })
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode
        const loggedOut = statusCode === DisconnectReason.loggedOut
        log('Connection closed, statusCode:', statusCode, 'loggedOut:', loggedOut)

        if (loggedOut) {
          clearSession()
          sock = null
          emitStatus({ status: 'disconnected', error: 'Logged out' })
          forwardWhatsAppStatus('logged_out')
        } else {
          emitStatus({ status: 'connecting' })
          await initWhatsAppClient(_mainWindow)
        }
      } else if (connection === 'open') {
        const phoneNumber = sock?.user?.id?.split(':')[0]
        log('Connected! Phone:', phoneNumber)
        emitStatus({ status: 'connected', phoneNumber })
        forwardWhatsAppStatus('connected', phoneNumber)
      } else if (connection === 'connecting') {
        emitStatus({ status: 'connecting' })
      }
    })

    log('Baileys socket created, waiting for connection...')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to initialize WhatsApp'
    log('Init error:', msg)
    emitStatus({ status: 'error', error: msg })
  }

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
