import fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const CREDENTIALS_PATH = path.join(
  app.getPath("userData"),
  "bridge-credentials.json"
);

export interface BridgeCredentials {
  accessToken: string;
  workspaceId: string;
}

export function saveCredentials(creds: BridgeCredentials): void {
  try {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds), "utf-8");
  } catch {
    // Non-critical — auto-connect will retry on next startup
  }
}

export function loadCredentials(): BridgeCredentials | null {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      return null;
    }
    const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed?.workspaceId && parsed?.accessToken) {
      return parsed;
    }
  } catch {
    // Invalid or corrupt — ignore
  }
  return null;
}

export function clearCredentials(): void {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      fs.unlinkSync(CREDENTIALS_PATH);
    }
  } catch {
    // ignore
  }
}
