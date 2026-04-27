import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron'
import path from 'node:path'
import { getBasePath } from './utils/path'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow) {
  const iconPath = path.join(getBasePath(), '../renderer/main_window/assets/icon.png')
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  tray.setToolTip('Zenda — AI Receptionist')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Zenda', click: () => { mainWindow.show(); mainWindow.focus() } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit() } },
  ])

  tray.setContextMenu(contextMenu)

  // Double-click shows window
  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

export function updateTrayStatus(connected: boolean) {
  if (!tray) return
  tray.setToolTip(connected
    ? 'Zenda — WhatsApp Connected'
    : 'Zenda — WhatsApp Disconnected'
  )
}
