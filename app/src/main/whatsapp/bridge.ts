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
let stabilizeTimer: ReturnType<typeof setTimeout> | null = null;

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_AUTH_FAILURES = 2;

// Incoming message queue — buffers messages when WS is down, flushed on connect
const pendingQueue: unknown[] = [];
const MAX_PENDING = 50;

// Pending WhatsApp replies — buffers when Baileys is reconnecting
interface PendingReply {
  jid: string;
  retries: number;
  text: string;
}
const pendingReplies: PendingReply[] = [];
const MAX_REPLY_RETRIES = 3;

const WS_URL = process.env.ZENDA_API_WS_URL ?? "wss://api.zenda.bot/ws";

/**
 * Convert markdown formatting to WhatsApp formatting.
 * WhatsApp uses *bold*, _italic_, ~strikethrough~ and ```monospace```.
 */
function markdownToWhatsApp(text: string): string {
  return (
    text
      // **bold** → *bold* (must run before italic)
      .replace(/\*\*(.+?)\*\*/g, "*$1*")
      // *italic* → _italic_ (single asterisks not part of bullets)
      .replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, "_$1_")
      // ~~strikethrough~~ → ~strikethrough~
      .replace(/~~(.+?)~~/g, "~$1~")
      // `inline code` → ```inline code```
      .replace(/`([^`]+)`/g, "```$1```")
      // ### header → *header*
      .replace(/^#{1,6}\s+(.+)$/gm, "*$1*")
      // - bullets → • bullets
      .replace(/^-\s+/gm, "• ")
  );
}

function handleServerMessage(
  ws: WebSocket,
  mainWindow: BrowserWindow,
  data: Buffer
): void {
  try {
    const payload = JSON.parse(data.toString());

    if (payload.type === "response.send") {
      handleResponseSend(mainWindow, payload);
    } else if (payload.type === "notification") {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("notification:new", payload.data);
      }
    } else if (payload.type === "conversation.update") {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("conversation:update", payload.data);
      }
    } else if (payload.type === "appointment.update") {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("appointment:update", payload.data);
      }
    } else if (payload.type === "ping") {
      ws?.send(JSON.stringify({ type: "pong" }));
    } else if (payload.type === "error" && payload.code === "auth_failed") {
      log("Auth failure from server, closing socket");
      ws?.close(4003, "Server reported auth_failed");
    }
  } catch {
    // ignore parse errors
  }
}

function handleResponseSend(
  mainWindow: BrowserWindow,
  payload: { data?: { phoneNumber?: string; message?: { body?: string } } }
): void {
  const phoneNumber = payload.data?.phoneNumber;
  const messageBody = payload.data?.message?.body;
  log(
    "Received response.send for",
    phoneNumber,
    ":",
    String(messageBody).slice(0, 80)
  );

  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send("whatsapp:send-response", payload.data);
  }

  if (phoneNumber && messageBody) {
    const jid = phoneNumber.includes("@")
      ? phoneNumber
      : `${phoneNumber}@s.whatsapp.net`;
    sendWhatsAppReply(jid, markdownToWhatsApp(messageBody));
  } else {
    log(
      "response.send missing phoneNumber or message.body — skipping WhatsApp delivery"
    );
  }
}

export function connectBridge(
  mainWindow: BrowserWindow,
  workspaceId: string,
  accessToken: string
): void {
  // Clear any pending timers from a previous connection attempt
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (stabilizeTimer) {
    clearTimeout(stabilizeTimer);
    stabilizeTimer = null;
  }

  if (
    ws?.readyState === WebSocket.OPEN ||
    ws?.readyState === WebSocket.CONNECTING
  ) {
    log("Bridge already connecting or connected, ignoring duplicate call");
    return;
  }

  // Reset reconnect attempts when called with new credentials.
  // Also reset authFailures — new credentials mean a fresh attempt.
  const credsChanged =
    !currentCreds ||
    currentCreds.workspaceId !== workspaceId ||
    currentCreds.accessToken !== accessToken;
  if (credsChanged) {
    reconnectAttempts = 0;
    authFailures = 0;
  }

  // Persist credentials for auto-reconnect on restart
  const creds = { workspaceId, accessToken };
  saveCredentials(creds);
  currentCreds = creds;
  log("Connecting to API at", WS_URL, "workspace:", workspaceId);

  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    log("Connected to API at", WS_URL);

    // Send auth as first message instead of URL query param to avoid
    // leaking the token in server access logs, proxy logs, and browser history.
    ws?.send(
      JSON.stringify({ type: "auth", token: accessToken }),
    );

    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("bridge:status", { connected: true });
    }

    // Defer resetting reconnect/auth counters — the server may reject auth
    // during its open() handler, which causes close() to fire right after
    // open(). If we reset counters immediately, an expired token loops forever.
    // Only consider the connection "stable" after 2s without a close.
    stabilizeTimer = setTimeout(() => {
      stabilizeTimer = null;
      reconnectAttempts = 0;
      authFailures = 0;
      log("Connection stabilized — counters reset");
    }, 2000);

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
    handleServerMessage(ws, mainWindow, data);
  });

  ws.on("close", (code: number, reason: Buffer) => {
    // Cancel stabilize timer — connection wasn't stable
    if (stabilizeTimer) {
      clearTimeout(stabilizeTimer);
      stabilizeTimer = null;
    }

    log(
      "WebSocket closed — code:",
      code,
      "reason:",
      reason.toString() || "(empty)"
    );
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("bridge:status", { connected: false });
    }

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
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("bridge:status", {
          connected: false,
          error: "Session expired. Please log in again.",
          requiresReLogin: true,
        });
      }
      return;
    }

    // Stop reconnecting after max attempts
    reconnectAttempts++;
    if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
      log("Max reconnect attempts reached, stopping.");
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("bridge:status", {
          connected: false,
          error: `Connection lost after ${MAX_RECONNECT_ATTEMPTS} attempts. Please check your connection and re-login.`,
        });
      }
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
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("bridge:status", {
        connected: false,
        error: err.message,
      });
    }
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

/**
 * Compute a human-like typing delay based on message length.
 * ~30ms per char (roughly 40 WPM), capped at 6s, with a 500ms floor.
 */
function typingDelay(text: string): number {
  const perChar = 30;
  const minDelay = 500;
  const maxDelay = 6000;
  return Math.min(minDelay + text.length * perChar, maxDelay);
}

/** Send a WhatsApp reply with typing indicator and natural delay */
function sendWhatsAppReply(jid: string, text: string): void {
  const sock = getClient();
  if (!sock) {
    log("Cannot send reply: Baileys socket not connected — queuing");
    const alreadyQueued = pendingReplies.some(
      (r) => r.jid === jid && r.text === text
    );
    if (!alreadyQueued) {
      pendingReplies.push({ jid, text, retries: 0 });
    }
    return;
  }

  const delay = typingDelay(text);

  // Send initial "typing..." and keep refreshing every 4s (WhatsApp expires it after ~5s)
  sock
    .sendPresenceUpdate("composing", jid)
    .catch((e: unknown) => log("sendPresenceUpdate failed", e));

  const composingInterval = setInterval(() => {
    const currentSock = getClient();
    if (currentSock) {
      currentSock
        .sendPresenceUpdate("composing", jid)
        .catch((e: unknown) => log("sendPresenceUpdate refresh failed", e));
    }
  }, 4000);

  setTimeout(() => {
    clearInterval(composingInterval);

    // Re-check socket after delay — it may have disconnected
    const currentSock = getClient();
    if (!currentSock) {
      log("Socket disconnected during typing delay — queuing reply");
      const alreadyQueued = pendingReplies.some(
        (r) => r.jid === jid && r.text === text
      );
      if (!alreadyQueued) {
        pendingReplies.push({ jid, text, retries: 0 });
      }
      return;
    }

    currentSock
      .sendMessage(jid, { text })
      .then(() => {
        log("Reply sent to", jid, `(${text.length} chars, ${delay}ms delay)`);
      })
      .catch((err: unknown) => {
        log("Failed to send reply to", jid, err);
        const alreadyQueued = pendingReplies.some(
          (r) => r.jid === jid && r.text === text
        );
        if (!alreadyQueued && pendingReplies.length < MAX_PENDING) {
          pendingReplies.push({ jid, text, retries: 0 });
        }
      });
  }, delay);
}

/** Flush pending WhatsApp replies — called when Baileys reconnects */
export function flushPendingReplies(): void {
  if (pendingReplies.length === 0) {
    return;
  }
  log(`Flushing ${pendingReplies.length} pending WhatsApp replies`);
  const toFlush = [...pendingReplies];
  pendingReplies.length = 0;
  for (const reply of toFlush) {
    if (reply.retries < MAX_REPLY_RETRIES) {
      // Increment retries before sending so the next failure won't infinite-loop
      reply.retries++;
      sendWhatsAppReply(reply.jid, reply.text);
    } else {
      log("Dropping reply after max retries:", reply.jid);
    }
  }
}

export function disconnectBridge(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  if (stabilizeTimer) {
    clearTimeout(stabilizeTimer);
    stabilizeTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
  pendingReplies.length = 0;
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
