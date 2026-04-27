import { BrowserWindow } from 'electron'

interface HealthStatus {
  whatsapp: boolean
  api: boolean
  lastCheck: number
}

let monitorInterval: ReturnType<typeof setInterval> | null = null
let currentStatus: HealthStatus = {
  whatsapp: false,
  api: false,
  lastCheck: 0,
}

const CHECK_INTERVAL = 60_000

export function startHealthMonitor(mainWindow: BrowserWindow, apiBaseUrl: string) {
  if (monitorInterval) return

  const check = async () => {
    let apiHealthy = false
    let whatsappHealthy = false

    try {
      const res = await fetch(`${apiBaseUrl}/health`)
      apiHealthy = res.ok
    } catch { apiHealthy = false }

    // Check WhatsApp status from renderer
    mainWindow.webContents.send('health-check')

    currentStatus = {
      whatsapp: whatsappHealthy,
      api: apiHealthy,
      lastCheck: Date.now(),
    }

    mainWindow.webContents.send('health-status', currentStatus)

    // Auto-reconnect logic: if API is down, don't retry too aggressively
    if (!apiHealthy) {
      console.warn('[Health] API unreachable')
    }
  }

  // Initial check after 10s
  setTimeout(check, 10_000)
  monitorInterval = setInterval(check, CHECK_INTERVAL)
}

export function stopHealthMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }
}

export function updateWhatsAppHealth(connected: boolean) {
  currentStatus.whatsapp = connected
}
