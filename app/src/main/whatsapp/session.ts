import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const SESSION_DIR = path.join(app.getPath("userData"), "whatsapp-session");
let sessionDirEnsured = false;

export function getSessionPath(): string {
  if (!sessionDirEnsured) {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
    }
    sessionDirEnsured = true;
  }
  return SESSION_DIR;
}

export function clearSession(): void {
  if (fs.existsSync(SESSION_DIR)) {
    fs.rmSync(SESSION_DIR, { recursive: true, force: true });
  }
}

export function hasSession(): boolean {
  return fs.existsSync(path.join(SESSION_DIR, "creds.json"));
}
