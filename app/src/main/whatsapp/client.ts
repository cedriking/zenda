import { EventEmitter } from "node:events";
import {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  type WAMessage,
  type WASocket,
} from "@whiskeysockets/baileys";
import type { BrowserWindow } from "electron";
import QRCode from "qrcode";
import { flushPendingReplies, sendToBackend } from "./bridge.js";
import { clearSession, getSessionPath } from "./session.js";

const log = (...args: unknown[]) => console.log("[baileys]", ...args);

export interface WhatsAppStatus {
  error?: string;
  phoneNumber?: string;
  qrData?: string;
  status: "disconnected" | "connecting" | "qr_required" | "connected" | "error";
}

let sock: WASocket | null = null;
let isInitializing = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const emitter = new EventEmitter();

let currentStatus: WhatsAppStatus = { status: "disconnected" };

function emitStatus(status: WhatsAppStatus) {
  currentStatus = status;
  emitter.emit("status", status);
}

export function getStatus(): WhatsAppStatus {
  return currentStatus;
}

export async function initWhatsAppClient(
  _mainWindow?: BrowserWindow
): Promise<void> {
  // Prevent concurrent initialization
  if (isInitializing) {
    log("Already initializing, skipping duplicate init");
    return;
  }

  // If already connected, don't re-init
  if (sock) {
    log("Client already exists, skipping re-init");
    return;
  }

  isInitializing = true;

  try {
    log("Initializing Baileys WhatsApp client...");
    const sessionPath = getSessionPath();
    log("Session path:", sessionPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    log("Auth state loaded, registered:", state.creds.registered);

    let version: [number, number, number] = [2, 3000, 1_014_394_718];
    try {
      const fetched = await fetchLatestBaileysVersion();
      version = fetched.version;
      log("Fetched WA version:", version);
    } catch (e) {
      log("Could not fetch latest version, using fallback:", version, e);
    }

    emitStatus({ status: "connecting" });

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      emitOwnPresence: true,
      connectTimeoutMs: 30_000,
      defaultQueryTimeoutMs: 60_000,
      logger: {
        level: "warn",
        info: () => {},
        debug: () => {},
        trace: () => {},
        warn: (...args: unknown[]) => log("WARN:", ...args),
        error: (...args: unknown[]) => {
          // Suppress non-fatal Baileys init query timeouts — connection stays open
          const msg = args
            .map((a) => (typeof a === "string" ? a : ""))
            .join(" ");
          if (msg.includes("init queries")) {
            log(
              "WARN (non-fatal): Baileys init queries timed out — connection is still active"
            );
            return;
          }
          log("ERROR:", ...args);
        },
        fatal: (...args: unknown[]) => log("FATAL:", ...args),
        child: () =>
          ({
            level: "warn" as const,
            info: () => {},
            debug: () => {},
            trace: () => {},
            warn: (...args: unknown[]) => log("WARN:", ...args),
            error: (...args: unknown[]) => {
              const msg = args
                .map((a) => (typeof a === "string" ? a : ""))
                .join(" ");
              if (msg.includes("init queries")) {
                log(
                  "WARN (non-fatal): Baileys init queries timed out — connection is still active"
                );
                return;
              }
              log("ERROR:", ...args);
            },
            fatal: (...args: unknown[]) => log("FATAL:", ...args),
            child: () => ({}) as any,
          }) as any,
      } as any,
    });

    // Save credentials whenever they update
    sock.ev.on("creds.update", saveCreds);

    // Connection lifecycle
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;
      log(
        "Connection update:",
        connection,
        qr ? "(has QR)" : "",
        lastDisconnect?.error?.message ?? ""
      );

      if (qr) {
        try {
          const qrData = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          emitStatus({ status: "qr_required", qrData });
        } catch (e) {
          log("QR generation error:", e);
          emitStatus({ status: "qr_required" });
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        const isConflict =
          statusCode === DisconnectReason.connectionReplaced ||
          statusCode === 440;
        log(
          "Connection closed, statusCode:",
          statusCode,
          "loggedOut:",
          loggedOut,
          "isConflict:",
          isConflict
        );

        if (loggedOut) {
          clearSession();
          sock = null;
          isInitializing = false;
          emitStatus({ status: "disconnected", error: "Logged out" });
          sendToBackend({ type: "whatsapp.status", status: "logged_out" });
        } else if (isConflict) {
          // Another instance replaced us — stop reconnecting to avoid infinite loop
          log("Connection replaced by another instance, stopping reconnect");
          sock = null;
          isInitializing = false;
          emitStatus({
            status: "error",
            error: "Connection replaced by another session",
          });
        } else {
          reconnectAttempts++;
          if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            log("Max reconnect attempts reached, stopping");
            sock = null;
            isInitializing = false;
            emitStatus({
              status: "error",
              error: "Max reconnection attempts reached",
            });
            return;
          }
          log(
            "Reconnecting, attempt",
            reconnectAttempts,
            "of",
            MAX_RECONNECT_ATTEMPTS
          );
          emitStatus({ status: "connecting" });
          sock = null;
          isInitializing = false;
          setTimeout(() => initWhatsAppClient(_mainWindow), 2000);
        }
      } else if (connection === "open") {
        reconnectAttempts = 0;
        const phoneNumber = sock?.user?.id?.split(":")[0];
        log("Connected! Phone:", phoneNumber);
        emitStatus({ status: "connected", phoneNumber });
        // Flush any pending WhatsApp replies that were queued during disconnect
        flushPendingReplies();
        sendToBackend({
          type: "whatsapp.status",
          status: "connected",
          phoneNumber,
        });
      } else if (connection === "connecting") {
        emitStatus({ status: "connecting" });
      }
    });

    log("Baileys socket created, waiting for connection...");

    // Incoming messages
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      // "notify" = new live message, "append" = historical/offline message from server
      if (type !== "notify" && type !== "append") {
        return;
      }

      const isOfflineCatchup = type === "append";

      for (const msg of messages) {
        const jid = msg.key.remoteJid ?? "";
        // Skip: own messages, status broadcasts, and group messages (groups cause Bad MAC decryption errors)
        if (
          msg.key.fromMe ||
          jid === "status@broadcast" ||
          jid.endsWith("@g.us")
        ) {
          continue;
        }

        // Keep the full JID (e.g. "92784228884706@lid") — it's routable for replies.
        // Strip legacy formats only.
        const phoneNumber = jid.replace("@c.us", "");

        let body = "";
        let contentType = "text";

        if (msg.message?.conversation) {
          body = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
          body = msg.message.extendedTextMessage.text;
        } else if (msg.message?.imageMessage) {
          contentType = "image";
          body = msg.message.imageMessage.caption ?? "";
        } else if (msg.message?.audioMessage) {
          contentType = "audio";
        } else if (msg.message?.videoMessage) {
          contentType = "video";
          body = msg.message.videoMessage.caption ?? "";
        } else if (msg.message?.documentMessage) {
          contentType = "document";
          body = msg.message.documentMessage.fileName ?? "";
        } else if (msg.message?.contactMessage) {
          contentType = "contact";
          body = msg.message.contactMessage.displayName ?? "";
        } else if (msg.message?.locationMessage) {
          contentType = "location";
          body = `${msg.message.locationMessage.degreesLatitude},${msg.message.locationMessage.degreesLongitude}`;
        }

        if (!body && contentType === "text") {
          continue;
        }

        log(
          "Incoming message from",
          phoneNumber,
          ":",
          contentType,
          body?.slice(0, 80)
        );

        const ts = msg.messageTimestamp;
        const timestamp =
          typeof ts === "number"
            ? new Date(ts * 1000).toISOString()
            : new Date().toISOString();

        // For audio messages, download the media and encode as base64 data URI
        let mediaUrl: string | undefined;
        if (contentType === "audio" && sock) {
          try {
            const audioBuffer = (await downloadMediaMessage(
              msg as WAMessage,
              "buffer",
              {}
            )) as Buffer;

            if (audioBuffer && audioBuffer.length > 0) {
              const mime =
                msg.message?.audioMessage?.mimetype ?? "audio/ogg; codecs=opus";
              mediaUrl = `data:${mime};base64,${audioBuffer.toString("base64")}`;
            } else {
              log("Audio download returned empty buffer for", msg.key.id);
            }
          } catch (downloadErr) {
            log(
              "Failed to download audio:",
              downloadErr instanceof Error ? downloadErr.message : downloadErr
            );
          }
        }

        // Mark incoming message as read (human-like behavior)
        if (sock && msg.key.id && !isOfflineCatchup) {
          sock
            .readMessages([msg.key])
            .catch((e: unknown) => log("readMessages failed", e));
        }

        const sent = sendToBackend({
          type: "whatsapp.message",
          phoneNumber,
          body,
          contentType,
          timestamp,
          externalMessageId: msg.key.id ?? undefined,
          // App's local time so the AI knows the real current date/time
          localTime: new Date().toISOString(),
          localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...(mediaUrl ? { mediaUrl } : {}),
          ...(isOfflineCatchup ? { isOfflineCatchup: true } : {}),
        });
        if (!sent) {
          log("Message from", phoneNumber, "queued (bridge not connected)");
        }
      }
    });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to initialize WhatsApp";
    log("Init error:", msg);
    sock = null;
    emitStatus({ status: "error", error: msg });
  } finally {
    isInitializing = false;
  }
}

export function getClient(): WASocket | null {
  return sock;
}

export function disconnectWhatsApp() {
  if (sock) {
    sock.end(undefined);
    sock = null;
  }
  isInitializing = false;
  reconnectAttempts = 0;
  emitStatus({ status: "disconnected" });
}

/**
 * Soft shutdown for app quit — nulls out the socket without sending
 * a close frame so WhatsApp treats this as a dropped connection and
 * queues messages for delivery on reconnect.
 */
export function shutdownWhatsApp() {
  sock = null;
  isInitializing = false;
  reconnectAttempts = 0;
}

export function onStatus(callback: (status: WhatsAppStatus) => void) {
  emitter.on("status", callback);
  return () => emitter.off("status", callback);
}

export { emitter };
