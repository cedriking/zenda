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
import { getSessionPath, clearSession } from './session'
import { forwardWhatsAppMessage, forwardWhatsAppStatus } from './bridge'

const log = (...args: unknown[]) => console.log('[baileys]', ...args)

export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'qr_required' | 'connected' | 'error'
  phoneNumber?: string
  qrData?: string
  error?: string
}

let sock: WASocket | null = null
let isInitializing = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const emitter = new EventEmitter()

function emitStatus(status: WhatsAppStatus) {
  emitter.emit('status', status)
}

export async function initWhatsAppClient(_mainWindow?: BrowserWindow): Promise<void> {
  // Prevent concurrent initialization
  if (isInitializing) {
    log('Already initializing, skipping duplicate init')
    return
  }

  // If already connected, don't re-init
  if (sock) {
    log('Client already exists, skipping re-init')
    return
  }

  isInitializing = true

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
        const isConflict = statusCode === DisconnectReason.connectionReplaced || statusCode === 440
        log('Connection closed, statusCode:', statusCode, 'loggedOut:', loggedOut, 'isConflict:', isConflict)

        if (loggedOut) {
          clearSession()
          sock = null
          isInitializing = false
          emitStatus({ status: 'disconnected', error: 'Logged out' })
          forwardWhatsAppStatus('logged_out')
        } else if (isConflict) {
          // Another instance replaced us — stop reconnecting to avoid infinite loop
          log('Connection replaced by another instance, stopping reconnect')
          sock = null
          isInitializing = false
          emitStatus({ status: 'error', error: 'Connection replaced by another session' })
        } else {
          reconnectAttempts++
          if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            log('Max reconnect attempts reached, stopping')
            sock = null
            isInitializing = false
            emitStatus({ status: 'error', error: 'Max reconnection attempts reached' })
            return
          }
          log('Reconnecting, attempt', reconnectAttempts, 'of', MAX_RECONNECT_ATTEMPTS)
          emitStatus({ status: 'connecting' })
          sock = null
          isInitializing = false
          setTimeout(() => initWhatsAppClient(_mainWindow), 2000)
        }
      } else if (connection === 'open') {
        reconnectAttempts = 0
        const phoneNumber = sock?.user?.id?.split(':')[0]
        log('Connected! Phone:', phoneNumber)
        emitStatus({ status: 'connected', phoneNumber })
        forwardWhatsAppStatus('connected', phoneNumber)
      } else if (connection === 'connecting') {
        emitStatus({ status: 'connecting' })
      }
    })

    log('Baileys socket created, waiting for connection...')

    // Incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        const jid = msg.key.remoteJid ?? ''
        // Skip: own messages, status broadcasts, and group messages (groups cause Bad MAC decryption errors)
        if (msg.key.fromMe || jid === 'status@broadcast' || jid.endsWith('@g.us')) {
          continue
        }

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
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to initialize WhatsApp'
    log('Init error:', msg)
    sock = null
    emitStatus({ status: 'error', error: msg })
  } finally {
    isInitializing = false
  }
}

export function getClient(): WASocket | null {
  return sock
}

export function disconnectWhatsApp() {
  if (sock) {
    sock.end(undefined)
    sock = null
  }
  isInitializing = false
  reconnectAttempts = 0
  emitStatus({ status: 'disconnected' })
}

export function onStatus(callback: (status: WhatsAppStatus) => void) {
  emitter.on('status', callback)
  return () => emitter.off('status', callback)
}

export { emitter }
