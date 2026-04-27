import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

const AUTO_START_KEY = 'com.zenda.app'

export function setAutoStart(enabled: boolean): boolean {
  try {
    if (process.platform === 'darwin') {
      return setAutoStartMac(enabled)
    } else if (process.platform === 'win32') {
      return setAutoStartWindows(enabled)
    }
    return false
  } catch {
    return false
  }
}

function setAutoStartMac(enabled: boolean): boolean {
  const plistPath = path.join(
    app.getPath('home'),
    'Library',
    'LaunchAgents',
    `${AUTO_START_KEY}.plist`,
  )

  if (enabled) {
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${AUTO_START_KEY}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
</dict>
</plist>`
    fs.writeFileSync(plistPath, plist, 'utf-8')
  } else {
    if (fs.existsSync(plistPath)) {
      fs.unlinkSync(plistPath)
    }
  }
  return true
}

function setAutoStartWindows(enabled: boolean): boolean {
  const { execSync } = require('child_process') as typeof import('child_process')
  const exePath = app.getPath('exe')

  if (enabled) {
    const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTO_START_KEY}" /t REG_SZ /d "${exePath}" /f`
    execSync(regCommand)
  } else {
    try {
      const regCommand = `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${AUTO_START_KEY}" /f`
      execSync(regCommand)
    } catch { /* key doesn't exist */ }
  }
  return true
}
