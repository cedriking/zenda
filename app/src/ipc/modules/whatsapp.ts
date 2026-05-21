import { ipcMain, BrowserWindow } from 'electron'
import {
  initWhatsAppClient,
  disconnectWhatsApp,
  onStatus,
  getStatus,
  type WhatsAppStatus,
} from '../../main/whatsapp/client.js'
import {
  connectBridge,
  disconnectBridge,
  sendToBackend,
} from '../../main/whatsapp/bridge.js'
import { updateWhatsAppHealth } from '../../main/health-monitor.js'
import { updateTrayStatus } from '../../main/tray.js'
import { clearSession } from '../../main/whatsapp/session.js'

export function registerWhatsAppIPC(mainWindow: BrowserWindow): void {
  // Init WhatsApp client (fire-and-forget so it can't block the renderer)
  ipcMain.handle('whatsapp:init', () => {
    console.log('[IPC] whatsapp:init received')
    const status = getStatus()
    if (status.status === 'connected') {
      // Client already exists from auto-init; re-emit status so the
      // renderer (which loaded after the auto-init) can catch up.
      console.log('[IPC] Client already connected, re-emitting status')
      mainWindow.webContents.send('whatsapp:status', status)
    } else {
      initWhatsAppClient(mainWindow).catch((err) => {
        console.error('[IPC] whatsapp:init error:', err)
      })
    }
    return { success: true }
  })

  // Disconnect WhatsApp
  ipcMain.handle('whatsapp:disconnect', () => {
    disconnectWhatsApp()
    disconnectBridge()
    return { success: true }
  })

  // Disconnect and clear session (for logout)
  ipcMain.handle('whatsapp:disconnect-and-clear', () => {
    disconnectWhatsApp()
    disconnectBridge()
    clearSession()
    return { success: true }
  })

  // Connect bridge to backend
  ipcMain.handle('bridge:connect', (_event, { workspaceId, accessToken }: {
    workspaceId: string
    accessToken: string
  }) => {
    connectBridge(mainWindow, workspaceId, accessToken)
    return { success: true }
  })

  // Forward incoming WhatsApp message to backend
  ipcMain.on('whatsapp:forward-message', (_event, message: {
    phoneNumber: string
    body: string
    contentType: string
    mediaUrl?: string
    timestamp: string
    externalMessageId?: string
  }) => {
    sendToBackend({ type: 'whatsapp.message', ...message })
  })

  // Forward WhatsApp status to backend
  ipcMain.on('whatsapp:forward-status', (_event, { status, phoneNumber }: {
    status: string
    phoneNumber?: string
  }) => {
    sendToBackend({ type: 'whatsapp.status', status, phoneNumber })
  })

  // Listen for WhatsApp client status changes and forward to renderer
  onStatus((status: WhatsAppStatus) => {
    mainWindow.webContents.send('whatsapp:status', status)

    const connected = status.status === 'connected'
    updateWhatsAppHealth(connected)
    updateTrayStatus(connected)
  })
}
