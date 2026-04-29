import { ipcMain, BrowserWindow } from 'electron'
import {
  initWhatsAppClient,
  disconnectWhatsApp,
  onStatus,
  type WhatsAppStatus,
} from '../../main/whatsapp/client.js'
import {
  connectBridge,
  disconnectBridge,
  forwardWhatsAppMessage,
  forwardWhatsAppStatus,
} from '../../main/whatsapp/bridge.js'
import { updateWhatsAppHealth } from '../../main/health-monitor.js'
import { updateTrayStatus } from '../../main/tray.js'

export function registerWhatsAppIPC(mainWindow: BrowserWindow): void {
  // Init WhatsApp client
  ipcMain.handle('whatsapp:init', async () => {
    console.log('[IPC] whatsapp:init received')
    try {
      await initWhatsAppClient(mainWindow)
      console.log('[IPC] whatsapp:init completed')
      return { success: true }
    } catch (err) {
      console.error('[IPC] whatsapp:init error:', err)
      throw err
    }
  })

  // Disconnect WhatsApp
  ipcMain.handle('whatsapp:disconnect', () => {
    disconnectWhatsApp()
    disconnectBridge()
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
    forwardWhatsAppMessage(message)
  })

  // Forward WhatsApp status to backend
  ipcMain.on('whatsapp:forward-status', (_event, { status, phoneNumber }: {
    status: string
    phoneNumber?: string
  }) => {
    forwardWhatsAppStatus(status, phoneNumber)
  })

  // Listen for WhatsApp client status changes and forward to renderer
  onStatus((status: WhatsAppStatus) => {
    mainWindow.webContents.send('whatsapp:status', status)

    const connected = status.status === 'connected'
    updateWhatsAppHealth(connected)
    updateTrayStatus(connected)
  })
}
