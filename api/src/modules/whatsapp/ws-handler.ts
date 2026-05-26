import { Elysia } from "elysia";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../../config/env.js";
import { logger } from "../../infra/logger.js";
import {
  addConnection,
  removeConnection,
  startHeartbeat,
} from "./connection-manager.js";

// Incoming message from desktop app (WhatsApp message received)
interface WhatsAppMessagePayload {
  data: {
    phoneNumber: string;
    body: string;
    contentType: "text" | "audio" | "image" | "file" | "system";
    mediaUrl?: string;
    timestamp: string;
    externalMessageId?: string;
    localTime?: string;
    localTimezone?: string;
  };
  type: "whatsapp.message";
}

// Connection status update from desktop app
interface WhatsAppStatusPayload {
  data: {
    status: string;
    phoneNumber?: string;
  };
  type: "whatsapp.status";
}

type IncomingPayload =
  | WhatsAppMessagePayload
  | WhatsAppStatusPayload
  | { type: "pong" };

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

// Rate limit WS auth failures per IP to prevent reconnect storms
const wsAuthFailures = new Map<string, { count: number; resetAt: number }>();
const WS_AUTH_MAX_FAILURES = 5;
const WS_AUTH_WINDOW_MS = 60_000; // 1 minute

function getWsClientIp(ws: { data: Record<string, unknown> }): string {
  const req = (ws.data as { request?: Headers & { headers?: Headers } })
    .request;
  const headers = req?.headers ?? req;
  if (headers && typeof (headers as Headers).get === "function") {
    const h = headers as Headers;
    const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (forwarded) {
      return forwarded;
    }
    const realIp = h.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
  }
  return "unknown";
}

function isWsAuthBlocked(ip: string): boolean {
  const entry = wsAuthFailures.get(ip);
  if (!entry) {
    return false;
  }
  if (Date.now() > entry.resetAt) {
    wsAuthFailures.delete(ip);
    return false;
  }
  return entry.count >= WS_AUTH_MAX_FAILURES;
}

function recordWsAuthFailure(ip: string): void {
  const now = Date.now();
  const entry = wsAuthFailures.get(ip);
  if (!entry || now > entry.resetAt) {
    wsAuthFailures.set(ip, { count: 1, resetAt: now + WS_AUTH_WINDOW_MS });
  } else {
    entry.count++;
  }
}

// Store WS metadata in a WeakMap instead of on the ws object directly.
// Elysia may recreate the ws context between lifecycle events, which would
// lose any properties set via (ws as any).__prop = value.
interface WsMeta {
  heartbeat: { pong: () => void; stop: () => void };
  userId: string;
  workspaceId: string;
}
const wsMeta = new WeakMap<object, WsMeta>();

// Track connections that haven't authenticated yet (token sent via first message, not URL).
// Keyed by the raw socket so it survives Elysia WS wrapper recreation.
const pendingAuth = new WeakMap<object, { authenticated: false }>();

// Track connections where auth verification is in-flight (promise pending).
// Prevents non-auth messages from being treated as auth failures.
const pendingVerification = new WeakMap<object, boolean>();

const AUTH_TIMEOUT_MS = 5000;

async function verifyWsToken(
  token: string
): Promise<{ sub?: string; workspaceId?: string } | null> {
  try {
    // Use jose (same library as @elysiajs/jwt) to verify — eliminates any
    // manual-crypto vs jose mismatch that could cause false negatives.
    const { payload } = await jwtVerify(token, jwtSecret);
    return {
      sub: payload.sub as string | undefined,
      workspaceId: payload.workspaceId as string | undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.debug("WS token verify error", { error: msg });
    return null;
  }
}

export const wsModule = new Elysia({ prefix: "/ws" }).ws("/", {
  async open(ws) {
    const ip = getWsClientIp(ws);

    // Block IPs with too many recent auth failures
    if (isWsAuthBlocked(ip)) {
      logger.warn("WS open: blocked for too many auth failures", { ip });
      ws.close(4003, "Too many auth failures");
      return;
    }

    // Mark socket as pending auth — the client must send an { type: "auth", token } message.
    // This avoids leaking the token in URL query params (server logs, proxy logs, browser history).
    const raw = (ws as { raw: object }).raw;
    pendingAuth.set(raw, { authenticated: false });

    // Close the socket if it doesn't authenticate within the timeout
    const timer = setTimeout(() => {
      if (pendingAuth.has(raw)) {
        logger.warn("WS open: auth timeout", { ip });
        recordWsAuthFailure(ip);
        pendingAuth.delete(raw);
        ws.close(4003, "Authentication timeout");
      }
    }, AUTH_TIMEOUT_MS);

    // Store timer so we can clear it on early auth
    (raw as Record<string, unknown>).__authTimer = timer;
  },

  message(ws, rawMessage) {
    const raw = (ws as { raw: object }).raw;

    // Handle auth message — client sends token as first message instead of URL query param
    if (pendingAuth.has(raw)) {
      // If verification is in-flight, ignore non-auth messages (they will be
      // re-sent by the client or are out-of-order). Don't treat as auth failure.
      if (pendingVerification.has(raw)) {
        return;
      }

      const authTimer = (raw as Record<string, unknown>).__authTimer as
        | ReturnType<typeof setTimeout>
        | undefined;
      let payload: Record<string, unknown>;
      try {
        payload =
          typeof rawMessage === "string"
            ? JSON.parse(rawMessage)
            : (rawMessage as Record<string, unknown>);
      } catch {
        const ip = getWsClientIp(ws);
        recordWsAuthFailure(ip);
        logger.warn("WS auth: invalid JSON in first message", { ip });
        pendingAuth.delete(raw);
        if (authTimer) {
          clearTimeout(authTimer);
        }
        ws.close(4003, "Invalid auth message");
        return;
      }

      if (payload.type !== "auth" || typeof payload.token !== "string") {
        const ip = getWsClientIp(ws);
        recordWsAuthFailure(ip);
        logger.warn("WS auth: first message is not an auth message", {
          ip,
          type: payload.type,
        });
        pendingAuth.delete(raw);
        if (authTimer) {
          clearTimeout(authTimer);
        }
        ws.close(4003, "Expected auth message as first message");
        return;
      }

      // Mark verification as in-flight
      pendingVerification.set(raw, true);

      const ip = getWsClientIp(ws);
      const decoded = verifyWsToken(payload.token);
      decoded
        .then((result) => {
          pendingVerification.delete(raw);

          if (!(result?.sub && result?.workspaceId)) {
            recordWsAuthFailure(ip);
            logger.warn("WS auth: token verification failed", {
              ip,
              sub: result?.sub ?? "(missing)",
              workspaceId: result?.workspaceId ?? "(missing)",
            });
            pendingAuth.delete(raw);
            ws.close(4003, "Invalid or expired token");
            return;
          }

          const workspaceId = result.workspaceId;
          const userId = result.sub;

          logger.info("WebSocket authenticated", { workspaceId, userId });
          pendingAuth.delete(raw);
          if (authTimer) {
            clearTimeout(authTimer);
          }

          // biome-ignore lint/suspicious/noExplicitAny: Elysia WS types don't expose internal fields
          addConnection(workspaceId, ws as any);

          // biome-ignore lint/suspicious/noExplicitAny: same
          const heartbeat = startHeartbeat(workspaceId, ws as any);

          wsMeta.set(raw, {
            workspaceId,
            userId,
            heartbeat,
          });
        })
        .catch(() => {
          pendingVerification.delete(raw);
          recordWsAuthFailure(ip);
          pendingAuth.delete(raw);
          if (authTimer) {
            clearTimeout(authTimer);
          }
          ws.close(4003, "Token verification error");
        });

      return; // Don't process further until auth resolves
    }

    const meta = wsMeta.get(raw);

    logger.debug("WS message received", {
      hasMeta: !!meta,
      workspaceId: meta?.workspaceId,
      rawType: typeof rawMessage,
    });

    if (!meta) {
      logger.warn("WS message without workspace context");
      return;
    }
    const { workspaceId } = meta;

    let payload: IncomingPayload;
    try {
      payload =
        typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;
    } catch {
      logger.warn("Invalid WS message", { workspaceId });
      return;
    }

    // Handle pong (heartbeat response)
    if (payload.type === "pong") {
      meta.heartbeat.pong();
      return;
    }

    // Route to conversation engine
    if (payload.type === "whatsapp.message") {
      // The desktop client sends fields flat ({ type, phoneNumber, body, ... })
      // but the TypeScript interface expects them nested under .data.
      // Normalize: if no .data field, treat the top-level object as data.
      const raw = payload as unknown as Record<string, unknown>;
      const msgData =
        raw.data && typeof raw.data === "object"
          ? (raw.data as WhatsAppMessagePayload["data"])
          : {
              phoneNumber: raw.phoneNumber as string | undefined,
              body: raw.body as string | undefined,
              contentType: (raw.contentType as string) ?? "text",
              mediaUrl: raw.mediaUrl as string | undefined,
              timestamp: (raw.timestamp as string) ?? new Date().toISOString(),
              externalMessageId: raw.externalMessageId as string | undefined,
              localTime: raw.localTime as string | undefined,
              localTimezone: raw.localTimezone as string | undefined,
            };

      if (!(msgData.phoneNumber && msgData.body)) {
        logger.warn("whatsapp.message missing phoneNumber or body", {
          workspaceId,
          keys: Object.keys(raw),
        });
        return;
      }

      // Import dynamically to avoid circular deps
      import("../conversation/engine.js")
        .then(async ({ processIncomingMessage }) => {
          try {
            // biome-ignore lint/style/noNonNullAssertion: guarded by earlier null check
            // biome-ignore lint/suspicious/noExplicitAny: Elysia payload shape
            await processIncomingMessage(workspaceId!, msgData as any);
            logger.info("Message processed", {
              workspaceId,
              phone: msgData.phoneNumber,
            });
          } catch (err) {
            logger.error("processIncomingMessage failed", {
              workspaceId,
              phone: msgData.phoneNumber,
              error: err instanceof Error ? err.message : String(err),
              stack: err instanceof Error ? err.stack : undefined,
            });
          }
        })
        .catch((err) => {
          logger.error("Failed to import conversation engine", {
            error: err.message,
            workspaceId,
          });
        });
      return;
    }

    // Handle WhatsApp status updates
    if (payload.type === "whatsapp.status") {
      // Same flat-vs-nested normalization as whatsapp.message
      const raw = payload as unknown as Record<string, unknown>;
      const statusData =
        raw.data && typeof raw.data === "object"
          ? (raw.data as WhatsAppStatusPayload["data"])
          : {
              status: raw.status as string,
              phoneNumber: raw.phoneNumber as string | undefined,
            };

      logger.info("WhatsApp status update", {
        workspaceId,
        status: statusData.status,
      });

      // Update connection status in DB
      import("drizzle-orm")
        .then(({ eq }) => {
          import("@zenda/db/client").then(({ db }) => {
            import("@zenda/db/schema").then(({ whatsappConnections }) => {
              db.update(whatsappConnections)
                .set({
                  // biome-ignore lint/suspicious/noExplicitAny: status enum mismatch
                  status: statusData.status as any,
                  updatedAt: new Date(),
                })
                // biome-ignore lint/style/noNonNullAssertion: workspaceId verified in open handler
                .where(eq(whatsappConnections.workspaceId, workspaceId!));
            });
          });
        })
        .catch(() => {
          // intentionally ignored — import errors are non-critical
        });
      return;
    }

    logger.warn("Unknown WS message type", {
      // biome-ignore lint/suspicious/noExplicitAny: payload shape unknown for unknown types
      type: (payload as any).type,
      workspaceId,
    });
  },

  close(ws, code, reason) {
    const raw = (ws as { raw: object }).raw;

    // Clean up pending auth state if socket closes before authenticating
    if (pendingAuth.has(raw)) {
      const authTimer = (raw as Record<string, unknown>).__authTimer as
        | ReturnType<typeof setTimeout>
        | undefined;
      if (authTimer) {
        clearTimeout(authTimer);
      }
      pendingAuth.delete(raw);
    }

    const meta = wsMeta.get(raw);
    const workspaceId = meta?.workspaceId;
    logger.info("WebSocket disconnected", {
      workspaceId: workspaceId ?? "(never authed)",
      code,
      reason: reason ?? "(none)",
    });
    meta?.heartbeat.stop();
    if (workspaceId) {
      // Pass the ws reference so removeConnection can check it matches the
      // current connection before deleting (prevents stale close handlers
      // from evicting a newer replacement connection).
      removeConnection(workspaceId, ws as any);
    }
    wsMeta.delete(raw);
  },
});
