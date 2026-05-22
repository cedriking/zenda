import type { BrowserWindow } from "electron";
import { WebSocket } from "ws";
import {
  type BridgeCredentials,
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from "./bridge-credentials.js";
import { getClient } from "./client.js";

const log = (...args: unknown[]) => console.log("[bridge]", ...args);

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
let authFailures = 0;
let currentCreds: BridgeCredentials | null = null;

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_AUTH_FAILURES = 2;

// Incoming message queue — buffers messages when WS is down, flushed on connect
const pendingQueue: unknown[] = [];
const MAX_PENDING = 50;

const WS_URL = process.env.ZENDA_API_WS_URL ?? "wss://api.zenda.bot/ws";

export function connectBridge(
  mainWindow: BrowserWindow,
  workspaceId: string,
  accessToken: string
): void {
  // Clear any pending reconnect timer from a previous connection attempt
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (
    ws?.readyState === WebSocket.OPEN ||
    ws?.readyState === WebSocket.CONNECTING
  ) {
    log("Bridge already connecting or connected, ignoring duplicate call");
    return;
  }

  // Reset reconnect attempts when called with new credentials.
  // Do NOT reset authFailures here — it tracks consecutive auth failures
  // across credential refreshes. It resets only on successful WS open.
  const credsChanged =
    !currentCreds ||
    currentCreds.workspaceId !== workspaceId ||
    currentCreds.accessToken !== accessToken;
  if (credsChanged) {
    reconnectAttempts = 0;
  }

  // Persist credentials for auto-reconnect on restart
  const creds = { workspaceId, accessToken };
  saveCredentials(creds);
  currentCreds = creds;
  log("Connecting to API at", WS_URL, "workspace:", workspaceId);

  const url = `${WS_URL}?workspaceId=${workspaceId}&token=${accessToken}`;

  ws = new WebSocket(url);

  ws.on("open", () => {
    reconnectAttempts = 0;
    authFailures = 0;
    log("Connected to API at", WS_URL);
    mainWindow.webContents.send("bridge:status", { connected: true });

    // Flush any messages that arrived while WS was disconnected
    if (pendingQueue.length > 0) {
      log(`Flushing ${pendingQueue.length} queued messages`);
      while (pendingQueue.length > 0 && ws?.readyState === WebSocket.OPEN) {
        const data = pendingQueue.shift();
        if (data !== undefined) {
          ws.send(JSON.stringify(data));
        }
      }
    }
  });

  ws.on("message", (data: Buffer) => {
    try {
      const payload = JSON.parse(data.toString());

      // Forward responses and notifications to renderer
      if (payload.type === "response.send") {
        const phoneNumber = payload.data?.phoneNumber;
        const messageBody = payload.data?.message?.body;
        log(
          "Received response.send for",
          phoneNumber,
          ":",
          String(messageBody).slice(0, 80)
        );

        // Forward to renderer for UI updates
        mainWindow.webContents.send("whatsapp:send-response", payload.data);

        // Send via Baileys to the WhatsApp contact
        if (phoneNumber && messageBody) {
          const sock = getClient();
          if (sock) {
            const jid = `${phoneNumber}@s.whatsapp.net`;
            sock
              .sendMessage(jid, { text: messageBody })
              .then(() => {
                log("Reply sent to", jid);
              })
              .catch((err: unknown) => {
                log("Failed to send reply to", jid, err);
              });
          } else {
            log("Cannot send reply: Baileys socket not connected");
          }
        } else {
          log(
            "response.send missing phoneNumber or message.body — skipping WhatsApp delivery"
          );
        }
      } else if (payload.type === "notification") {
        mainWindow.webContents.send("notification:new", payload.data);
      } else if (payload.type === "conversation.update") {
        mainWindow.webContents.send("conversation:update", payload.data);
      } else if (payload.type === "appointment.update") {
        mainWindow.webContents.send("appointment:update", payload.data);
      } else if (payload.type === "ping") {
        ws?.send(JSON.stringify({ type: "pong" }));
      } else if (payload.type === "error" && payload.code === "auth_failed") {
        log("Auth failure from server, closing socket");
        // Close the socket — the close handler increments authFailures and handles retry logic
        ws?.close(4003, "Server reported auth_failed");
      }
    } catch {
      // ignore parse errors
    }
  });

  ws.on("close", (code: number, reason: Buffer) => {
    log(
      "WebSocket closed — code:",
      code,
      "reason:",
      reason.toString() || "(empty)"
    );
    mainWindow.webContents.send("bridge:status", { connected: false });

    // Auth-related close codes: 4001 (custom), 4003 (invalid/expired token), 1008 (policy violation)
    const isAuthError = code === 4001 || code === 4003 || code === 1008;
    if (isAuthError) {
      authFailures++;
    }

    // Stop reconnecting if too many auth failures (token likely expired)
    if (authFailures >= MAX_AUTH_FAILURES) {
      log("Too many auth failures, clearing saved credentials.");
      clearCredentials();
      currentCreds = null;
      mainWindow.webContents.send("bridge:status", {
        connected: false,
        error: "Session expired. Please log in again.",
        requiresReLogin: true,
      });
      return;
    }

    // Stop reconnecting after max attempts
    reconnectAttempts++;
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      log("Max reconnect attempts reached, stopping.");
      mainWindow.webContents.send("bridge:status", {
        connected: false,
        error: `Connection lost after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check your connection and re-login.`,
      });
      return;
    }

    // Auto-reconnect with backoff (5s base, doubling each attempt, max 60s)
    const backoff = Math.min(5000 * 2 ** (reconnectAttempts - 1), 60_000);
    const savedCreds = currentCreds;
    log(
      `Reconnecting in ${backoff}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );
    reconnectTimer = setTimeout(() => {
      if (savedCreds) {
        connectBridge(
          mainWindow,
          savedCreds.workspaceId,
          savedCreds.accessToken
        );
      }
    }, backoff);
  });

  ws.on("error", (err: Error) => {
    log("WebSocket error:", err.message);
    mainWindow.webContents.send("bridge:status", {
      connected: false,
      error: err.message,
    });
  });
}

export function sendToBackend(data: unknown): boolean {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    // Queue for later delivery when bridge reconnects
    if (pendingQueue.length < MAX_PENDING) {
      pendingQueue.push(data);
      log(`Queued message (queue: ${pendingQueue.length}/${MAX_PENDING})`);
    } else {
      log("Queue full — dropping message");
    }
    return false;
  }
  ws.send(JSON.stringify(data));
  log("Sent to API:", JSON.stringify(data).slice(0, 120));
  return true;
}

export function disconnectBridge(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}

/**
 * Auto-connect bridge using saved credentials (called at startup).
 * Falls through silently if no credentials exist — the renderer will
 * trigger bridge:connect via useBridgeSync once it loads.
 */
export function autoConnectBridge(mainWindow: BrowserWindow): boolean {
  const creds = loadCredentials();
  if (!creds) {
    log("No saved bridge credentials — waiting for renderer to connect");
    return false;
  }
  log("Found saved bridge credentials, auto-connecting...");
  connectBridge(mainWindow, creds.workspaceId, creds.accessToken);
  return true;
}
