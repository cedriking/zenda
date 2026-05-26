import { type BrowserWindow, ipcMain } from "electron";
import { z } from "zod";
import { updateWhatsAppHealth } from "../../main/health-monitor.js";
import { updateTrayStatus } from "../../main/tray.js";
import {
  connectBridge,
  disconnectBridge,
  sendToBackend,
  sendToRenderer,
} from "../../main/whatsapp/bridge.js";
import { clearCredentials } from "../../main/whatsapp/bridge-credentials.js";
import {
  disconnectWhatsApp,
  getStatus,
  initWhatsAppClient,
  onStatus,
  type WhatsAppStatus,
} from "../../main/whatsapp/client.js";
import { clearSession } from "../../main/whatsapp/session.js";

const bridgeConnectSchema = z.object({
  workspaceId: z.string().min(1),
  accessToken: z
    .string()
    .min(1)
    .refine((val) => val.split(".").length === 3, {
      message:
        "accessToken must be a JWT-like string (header.payload.signature)",
    }),
});

const forwardMessageSchema = z.object({
  phoneNumber: z.string().min(1),
  body: z.string(),
  contentType: z.string(),
  mediaUrl: z.string().optional(),
  timestamp: z.string(),
  externalMessageId: z.string().optional(),
});

const forwardStatusSchema = z.object({
  status: z.string().min(1),
  phoneNumber: z.string().optional(),
});

let statusUnsubscribe: (() => void) | null = null;

export function registerWhatsAppIPC(
  getWindow: () => BrowserWindow | null
): void {
  // Clean up previous status subscription if re-registering
  if (statusUnsubscribe) {
    statusUnsubscribe();
    statusUnsubscribe = null;
  }

  // Init WhatsApp client (fire-and-forget so it can't block the renderer)
  ipcMain.handle("whatsapp:init", () => {
    console.log("[IPC] whatsapp:init received");
    const status = getStatus();
    if (status.status === "connected") {
      // Client already exists from auto-init; re-emit status so the
      // renderer (which loaded after the auto-init) can catch up.
      console.log("[IPC] Client already connected, re-emitting status");
      sendToRenderer("whatsapp:status", status);
    } else {
      const win = getWindow();
      initWhatsAppClient(win ?? undefined).catch((err) => {
        console.error("[IPC] whatsapp:init error:", err);
      });
    }
    return { success: true };
  });

  // Disconnect WhatsApp
  ipcMain.handle("whatsapp:disconnect", () => {
    disconnectWhatsApp();
    disconnectBridge();
    return { success: true };
  });

  // Disconnect and clear session (for logout)
  ipcMain.handle("whatsapp:disconnect-and-clear", () => {
    disconnectWhatsApp();
    disconnectBridge();
    clearSession();
    clearCredentials();
    return { success: true };
  });

  // Connect bridge to backend
  ipcMain.handle("bridge:connect", (_event, args: unknown) => {
    const parsed = bridgeConnectSchema.safeParse(args);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }
    const { workspaceId, accessToken } = parsed.data;
    connectBridge(workspaceId, accessToken);
    return { success: true };
  });

  // Forward incoming WhatsApp message to backend
  ipcMain.on("whatsapp:forward-message", (_event, args: unknown) => {
    const parsed = forwardMessageSchema.safeParse(args);
    if (!parsed.success) {
      console.error(
        "[IPC] Invalid whatsapp:forward-message payload:",
        parsed.error.flatten()
      );
      return;
    }
    sendToBackend({ type: "whatsapp.message", ...parsed.data });
  });

  // Forward WhatsApp status to backend
  ipcMain.on("whatsapp:forward-status", (_event, args: unknown) => {
    const parsed = forwardStatusSchema.safeParse(args);
    if (!parsed.success) {
      console.error(
        "[IPC] Invalid whatsapp:forward-status payload:",
        parsed.error.flatten()
      );
      return;
    }
    sendToBackend({ type: "whatsapp.status", ...parsed.data });
  });

  // Listen for WhatsApp client status changes and forward to renderer
  statusUnsubscribe = onStatus((status: WhatsAppStatus) => {
    sendToRenderer("whatsapp:status", status);

    const connected = status.status === "connected";
    updateWhatsAppHealth(connected);
    updateTrayStatus(connected);
  });
}
