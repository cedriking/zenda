import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

const SESSION_DIR = path.join(app.getPath('userData'), 'whatsapp-session')

export function getSessionPath(): string {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true })
  }
  return SESSION_DIR
}

export function clearSession(): void {
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true })
  }
}

export function hasSession(): boolean {
  return fs.existsSync(path.join(SESSION_DIR, 'creds.json'))
}
