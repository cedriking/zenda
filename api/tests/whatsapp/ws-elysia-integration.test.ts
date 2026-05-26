/**
 * End-to-end integration test: starts a real Elysia server with the actual
 * ws-handler pattern (WeakMap keyed by ws.raw) and connects a real WebSocket
 * client to prove the heartbeat pong flow works across ElysiaWS recreation.
 *
 * This test validates the exact fix for the heartbeat timeout issue:
 *   - Elysia creates new ElysiaWS wrapper per event
 *   - ws.raw (Bun socket) is the stable reference
 *   - WeakMap keyed by ws.raw survives wrapper recreation
 *   - pong messages are processed correctly → heartbeat stays alive
 */
import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { jwtVerify, SignJWT } from "jose";

const jwtSecret = new TextEncoder().encode("test-jwt-secret-integration");

async function createTestToken(
  payload: { sub: string; workspaceId: string },
  expiresIn = "1h"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(jwtSecret);
}

/** Helper to create a connected WebSocket client to the Elysia server */
function connectWs(port: number, path: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
    ws.addEventListener("open", () => resolve(ws), { once: true });
    ws.addEventListener("error", (err) => reject(err), { once: true });
  });
}

/** Helper to wait for a WebSocket close event */
function waitForClose(
  ws: WebSocket
): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    ws.addEventListener(
      "close",
      (ev) => {
        resolve({ code: ev.code, reason: ev.reason });
      },
      { once: true }
    );
  });
}

describe("Elysia WS integration — WeakMap by ws.raw", () => {
  test("ws.raw is the same object across open/message/close events", async () => {
    const rawRefs: object[] = [];
    const eventOrder: string[] = [];

    const app = new Elysia().ws("/ws", {
      open(ws) {
        rawRefs.push((ws as { raw: object }).raw);
        eventOrder.push("open");
      },
      message(ws) {
        rawRefs.push((ws as { raw: object }).raw);
        eventOrder.push("message");
      },
      close(ws) {
        rawRefs.push((ws as { raw: object }).raw);
        eventOrder.push("close");
      },
    });

    const server = app.listen(0);
    const port = (server.server as any).port;

    const ws = await connectWs(port, "/ws");
    ws.send("hello");
    await new Promise((r) => setTimeout(r, 50));
    ws.close();
    await new Promise((r) => setTimeout(r, 50));

    server.stop();

    expect(eventOrder).toEqual(["open", "message", "close"]);

    // THE KEY ASSERTION: ws.raw is the exact same object across all events
    expect(rawRefs.length).toBe(3);
    expect(rawRefs[0]).toBe(rawRefs[1]); // open === message
    expect(rawRefs[1]).toBe(rawRefs[2]); // message === close
  });

  test("WeakMap keyed by ws.raw survives across events", async () => {
    const wsMeta = new WeakMap<
      object,
      { workspaceId: string; pongCount: number }
    >();
    const messageResults: string[] = [];

    const app = new Elysia().ws("/ws", {
      open(ws) {
        const raw = (ws as { raw: object }).raw;
        wsMeta.set(raw, { workspaceId: "ws-test-123", pongCount: 0 });
      },
      message(ws, rawMessage) {
        const raw = (ws as { raw: object }).raw;
        const meta = wsMeta.get(raw);
        if (meta) {
          const parsed = JSON.parse(rawMessage as string);
          if (parsed.type === "pong") {
            meta.pongCount++;
          }
          messageResults.push(`${meta.workspaceId}:${meta.pongCount}`);
        } else {
          messageResults.push("NO_META");
        }
      },
      close(ws) {
        const raw = (ws as { raw: object }).raw;
        wsMeta.delete(raw);
      },
    });

    const server = app.listen(0);
    const port = (server.server as any).port;

    const ws = await connectWs(port, "/ws");

    // Send two pong messages
    ws.send(JSON.stringify({ type: "pong" }));
    await new Promise((r) => setTimeout(r, 30));
    ws.send(JSON.stringify({ type: "pong" }));
    await new Promise((r) => setTimeout(r, 30));

    ws.close();
    await new Promise((r) => setTimeout(r, 30));
    server.stop();

    // Both pongs should have been processed with metadata found
    expect(messageResults).toEqual(["ws-test-123:1", "ws-test-123:2"]);
  });

  test("full WS auth + heartbeat flow with jose-signed token", async () => {
    const token = await createTestToken({
      sub: "user-integration",
      workspaceId: "ws-integration",
    });

    // Verify the token first (sanity check)
    const { payload } = await jwtVerify(token, jwtSecret);
    expect(payload.sub).toBe("user-integration");

    // Build the same pattern as ws-handler.ts
    const wsMeta = new WeakMap<
      object,
      { workspaceId: string; userId: string; heartbeat: { pong: () => void } }
    >();

    let isAlive = false;
    let pongReceived = false;

    const app = new Elysia().ws("/ws", {
      async open(ws) {
        const url = new URL(
          ((ws.data as Record<string, unknown>).url as string) ?? "",
          "http://localhost"
        );
        const tokenParam = url.searchParams.get("token");
        if (!tokenParam) {
          ws.close(4003, "No token");
          return;
        }

        try {
          const { payload: jwtPayload } = await jwtVerify(
            tokenParam,
            jwtSecret
          );
          const workspaceId = jwtPayload.workspaceId as string;
          const userId = jwtPayload.sub as string;

          const raw = (ws as { raw: object }).raw;
          isAlive = true;
          wsMeta.set(raw, {
            workspaceId,
            userId,
            heartbeat: {
              pong: () => {
                isAlive = true;
              },
            },
          });
        } catch {
          ws.close(4003, "Invalid token");
        }
      },
      message(ws, rawMessage) {
        const raw = (ws as { raw: object }).raw;
        const meta = wsMeta.get(raw);
        if (!meta) {
          return;
        }

        const parsed = JSON.parse(rawMessage as string);
        if (parsed.type === "pong") {
          meta.heartbeat.pong();
          pongReceived = true;
        }
      },
      close(ws) {
        const raw = (ws as { raw: object }).raw;
        wsMeta.delete(raw);
      },
    });

    const server = app.listen(0);
    const port = (server.server as any).port;

    // Connect with valid token
    const ws = await connectWs(port, `/ws?token=${token}`);

    // Simulate: server marks connection as dead (heartbeat check interval)
    isAlive = false;
    expect(isAlive).toBe(false);

    // Client sends pong
    ws.send(JSON.stringify({ type: "pong" }));
    await new Promise((r) => setTimeout(r, 50));

    // Verify pong was processed and heartbeat restored
    expect(pongReceived).toBe(true);
    expect(isAlive).toBe(true);

    ws.close();
    await new Promise((r) => setTimeout(r, 30));
    server.stop();
  });

  test("WS auth rejects expired token — connection closed", async () => {
    const expiredToken = await createTestToken(
      { sub: "user-expired", workspaceId: "ws-expired" },
      "-1s"
    );

    const app = new Elysia().ws("/ws", {
      async open(ws) {
        const url = new URL(
          ((ws.data as Record<string, unknown>).url as string) ?? "",
          "http://localhost"
        );
        const tokenParam = url.searchParams.get("token");
        if (!tokenParam) {
          ws.close(4003, "No token");
          return;
        }

        try {
          await jwtVerify(tokenParam, jwtSecret);
        } catch {
          ws.close(4003, "Invalid or expired token");
        }
      },
    });

    const server = app.listen(0);
    const port = (server.server as any).port;

    const ws = await connectWs(port, `/ws?token=${expiredToken}`);
    const { code } = await waitForClose(ws);
    server.stop();

    expect(code).toBe(4003);
  });
});
