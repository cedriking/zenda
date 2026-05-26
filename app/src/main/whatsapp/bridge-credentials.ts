import fs from "node:fs";
import path from "node:path";
import { app, safeStorage } from "electron";

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
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(JSON.stringify(creds));
      fs.writeFileSync(CREDENTIALS_PATH, encrypted.toString("base64"), "utf-8");
    } else {
      console.warn(
        "[bridge-credentials] safeStorage unavailable, saving plaintext"
      );
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds), "utf-8");
    }
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
    let parsed: unknown;
    try {
      // Try decrypting first (base64-encoded encrypted buffer)
      const buffer = Buffer.from(raw, "base64");
      const decrypted = safeStorage.decryptString(buffer);
      parsed = JSON.parse(decrypted);
    } catch {
      // Fallback: plaintext (from before encryption or when safeStorage was unavailable)
      console.warn(
        "[bridge-credentials] Could not decrypt, trying plaintext fallback"
      );
      parsed = JSON.parse(raw);
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "workspaceId" in parsed &&
      "accessToken" in parsed
    ) {
      return parsed as BridgeCredentials;
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
