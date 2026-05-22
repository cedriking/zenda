import { Elysia } from "elysia";
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

async function verifyWsToken(
  token: string
): Promise<{ sub?: string; workspaceId?: string } | null> {
  try {
    // Use Web Crypto API for JWT verification (no dependency on Elysia jwt plugin)
    const secret = new TextEncoder().encode(JWT_SECRET);
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(atob(headerB64));
    if (header.alg !== "HS256") {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      secret,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = Uint8Array.from(atob(signatureB64), (c) =>
      c.charCodeAt(0)
    );
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) {
      return null;
    }

    const payload = JSON.parse(atob(payloadB64));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return { sub: payload.sub, workspaceId: payload.workspaceId };
  } catch {
    return null;
  }
}

export const wsModule = new Elysia({ prefix: "/ws" }).ws("/", {
  async open(ws) {
    // Extract token from URL query params for authentication
    // Use ws.data.url (reliable) instead of ws.data.query (may be empty in some Elysia versions)
    const rawUrl = ((ws.data as Record<string, unknown>).url as string) ?? "";
    const url = new URL(rawUrl, "http://localhost");
    const token =
      url.searchParams.get("token") ??
      ((ws.data as Record<string, unknown>).query
        ? (ws.data.query as Record<string, string>).token
        : undefined);

    if (!token) {
      logger.warn("WS open: no token found", {
        rawUrl: rawUrl || "(empty)",
        hasQuery: !!(ws.data as Record<string, unknown>).query,
      });
      ws.close(4003, "Missing authentication token");
      return;
    }

    const payload = await verifyWsToken(token);
    if (!(payload?.sub && payload?.workspaceId)) {
      logger.warn("WS open: token verification failed", {
        sub: payload?.sub ?? "(missing)",
        workspaceId: payload?.workspaceId ?? "(missing)",
      });
      ws.close(4003, "Invalid or expired token");
      return;
    }

    const workspaceId = payload.workspaceId;
    const userId = payload.sub;

    logger.info("WebSocket connected", { workspaceId, userId });
    // biome-ignore lint/suspicious/noExplicitAny: Elysia WS types don't expose internal fields
    addConnection(workspaceId, ws as any);

    // Cache workspaceId on ws for use in message/close handlers
    // biome-ignore lint/suspicious/noExplicitAny: Elysia WS context doesn't allow arbitrary props
    (ws as any).__workspaceId = workspaceId;
    // biome-ignore lint/suspicious/noExplicitAny: same
    (ws as any).__userId = userId;

    // biome-ignore lint/suspicious/noExplicitAny: same
    const heartbeat = startHeartbeat(workspaceId, ws as any);
    // Store heartbeat stopper on ws for cleanup
    // biome-ignore lint/suspicious/noExplicitAny: same
    (ws as any).__heartbeat = heartbeat;
  },

  message(ws, rawMessage) {
    const url = new URL(
      ((ws.data as Record<string, unknown>).url as string) ?? "",
      "http://localhost"
    );
    const token = url.searchParams.get("token");

    // Re-derive workspaceId from token (stored at connection time)
    // Fall back to parsing from data for backward compat
    let workspaceId: string | undefined;

    if (token) {
      // Use cached value from open handler — store on ws
      // biome-ignore lint/suspicious/noExplicitAny: Elysia WS context doesn't expose custom props
      workspaceId = (ws as any).__workspaceId;
    }

    if (!workspaceId) {
      logger.warn("WS message without workspace context");
      return;
    }

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
      // biome-ignore lint/suspicious/noExplicitAny: Elysia WS context custom prop
      (ws as any).__heartbeat?.pong();
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
    // biome-ignore lint/suspicious/noExplicitAny: Elysia WS context custom prop
    const workspaceId = (ws as any).__workspaceId;
    logger.info("WebSocket disconnected", {
      workspaceId: workspaceId ?? "(never authed)",
      code,
      reason: reason ?? "(none)",
    });
    // biome-ignore lint/suspicious/noExplicitAny: Elysia WS context custom prop
    (ws as any).__heartbeat?.stop();
    if (workspaceId) {
      removeConnection(workspaceId);
    }
  },
});
