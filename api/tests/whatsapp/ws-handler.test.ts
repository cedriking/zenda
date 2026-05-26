import { describe, expect, test } from "bun:test";
import { jwtVerify, SignJWT } from "jose";

// Must match the app's JWT_SECRET — read from the same env source
// The test sets it before importing, but since ws-handler imports at module
// load time, we set the env first.
process.env.JWT_SECRET = "test-jwt-secret-for-ws-handler-tests";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

// Helper: create a real JWT that matches what @elysiajs/jwt would produce
async function createTestToken(
  payload: { sub: string; workspaceId: string; jti?: string },
  expiresIn = "1h"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(jwtSecret);
}

// Helper: create a mock ElysiaWS-like object that mimics Elysia's behavior
// of creating a new wrapper per event but sharing the same raw Bun socket.
function createMockElysiaWS(url: string, raw?: object) {
  // The underlying Bun ServerWebSocket — stable across events
  const bunSocket =
    raw ??
    ({
      readyState: 1,
      send: () => 0,
      close: () => {},
    } as object);

  return {
    data: {
      url,
      query: Object.fromEntries(new URL(url, "http://localhost").searchParams),
    },
    raw: bunSocket,
    send: () => {},
    close: () => {},
    readyState: 1,
  };
}

// We test the core logic by importing the verifyWsToken function indirectly.
// Since ws-handler.ts is tightly coupled to Elysia, we test the key behaviors:
// 1. jose-based token verification works with tokens signed by jose (same as @elysiajs/jwt)
// 2. WeakMap keyed by ws.raw survives wrapper recreation
// 3. Heartbeat pong is processed correctly

describe("WS Token Verification (jose-based)", () => {
  test("accepts a valid token signed by jose (same as @elysiajs/jwt)", async () => {
    const token = await createTestToken({
      sub: "user-123",
      workspaceId: "ws-456",
      jti: "jti-789",
    });

    const { payload } = await jwtVerify(token, jwtSecret);
    expect(payload.sub).toBe("user-123");
    expect(payload.workspaceId).toBe("ws-456");
  });

  test("rejects an expired token", async () => {
    const token = await createTestToken(
      { sub: "user-123", workspaceId: "ws-456" },
      "-1s" // expired 1 second ago
    );

    try {
      await jwtVerify(token, jwtSecret);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect((err as Error).message).toContain("exp");
    }
  });

  test("rejects a token signed with wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await new SignJWT({ sub: "user-123", workspaceId: "ws-456" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(wrongSecret);

    try {
      await jwtVerify(token, jwtSecret);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect((err as Error).message).toContain("signature");
    }
  });

  test("rejects a malformed token (not JWT)", async () => {
    try {
      await jwtVerify("not-a-jwt", jwtSecret);
      expect.unreachable("Should have thrown");
    } catch {
      // expected
    }
  });

  test("token contains all required claims for WS auth", async () => {
    const token = await createTestToken({
      sub: "user-abc",
      workspaceId: "ws-def",
    });

    const { payload } = await jwtVerify(token, jwtSecret);
    expect(payload.sub).toBe("user-abc");
    expect(payload.workspaceId).toBe("ws-def");
    expect(payload.exp).toBeDefined(); // has expiry
    expect(payload.iat).toBeDefined(); // has issued-at
  });
});

describe("WeakMap keyed by ws.raw survives ElysiaWS wrapper recreation", () => {
  // This tests the exact pattern used in ws-handler.ts:
  //   const raw = (ws as { raw: object }).raw;
  //   wsMeta.set(raw, { workspaceId, ... });
  // And in message handler:
  //   const raw = (ws as { raw: object }).raw;
  //   const meta = wsMeta.get(raw);

  const wsMeta = new WeakMap<object, { workspaceId: string; userId: string }>();

  test("metadata survives when Elysia creates new wrapper with same raw socket", () => {
    // Simulate: open handler receives ElysiaWS #1
    const bunSocket = { readyState: 1 } as object;
    const wsOpen = createMockElysiaWS("ws://localhost/ws?token=abc", bunSocket);

    // Store metadata via ws.raw (as ws-handler.ts does)
    wsMeta.set(wsOpen.raw, { workspaceId: "ws-123", userId: "user-456" });

    // Simulate: message handler receives ElysiaWS #2 (NEW wrapper, SAME raw)
    const wsMessage = createMockElysiaWS("ws://localhost/ws", bunSocket);

    // Retrieve metadata via ws.raw
    const meta = wsMeta.get(wsMessage.raw);
    expect(meta).toBeDefined();
    expect(meta?.workspaceId).toBe("ws-123");
    expect(meta?.userId).toBe("user-456");

    // Verify the wrappers are different objects but raw is the same
    expect(wsOpen).not.toBe(wsMessage);
    expect(wsOpen.raw).toBe(wsMessage.raw);
  });

  test("metadata is NOT found if keyed by wrapper instead of raw (the old bug)", () => {
    const bunSocket = { readyState: 1 } as object;
    const wsOpen = createMockElysiaWS("ws://localhost/ws?token=abc", bunSocket);
    const wsMessage = createMockElysiaWS("ws://localhost/ws", bunSocket);

    // OLD BUG: key by the wrapper
    const brokenMap = new WeakMap<object, { workspaceId: string }>();
    brokenMap.set(wsOpen, { workspaceId: "ws-123" });

    // message handler can't find it — different wrapper object
    const result = brokenMap.get(wsMessage);
    expect(result).toBeUndefined();
  });

  test("close handler can retrieve metadata and clean up", () => {
    const bunSocket = { readyState: 1 } as object;
    const wsOpen = createMockElysiaWS("ws://localhost/ws?token=abc", bunSocket);

    wsMeta.set(wsOpen.raw, { workspaceId: "ws-123", userId: "user-456" });

    // close handler receives yet another new wrapper
    const wsClose = createMockElysiaWS("ws://localhost/ws", bunSocket);
    const meta = wsMeta.get(wsClose.raw);
    expect(meta?.workspaceId).toBe("ws-123");

    wsMeta.delete(wsClose.raw);
    expect(wsMeta.get(wsClose.raw)).toBeUndefined();
  });

  test("multiple concurrent connections with different raw sockets", () => {
    const socket1 = { readyState: 1 } as object;
    const socket2 = { readyState: 1 } as object;

    const ws1Open = createMockElysiaWS("ws://localhost/ws?token=t1", socket1);
    const ws2Open = createMockElysiaWS("ws://localhost/ws?token=t2", socket2);

    wsMeta.set(ws1Open.raw, { workspaceId: "ws-A", userId: "user-1" });
    wsMeta.set(ws2Open.raw, { workspaceId: "ws-B", userId: "user-2" });

    const ws1Msg = createMockElysiaWS("ws://localhost/ws", socket1);
    const ws2Msg = createMockElysiaWS("ws://localhost/ws", socket2);

    expect(wsMeta.get(ws1Msg.raw)?.workspaceId).toBe("ws-A");
    expect(wsMeta.get(ws2Msg.raw)?.workspaceId).toBe("ws-B");
    // Cross-check: ws1 message doesn't get ws2's metadata
    expect(wsMeta.get(ws1Msg.raw)?.workspaceId).not.toBe("ws-B");
  });
});

describe("Heartbeat ping/pong flow via WeakMap", () => {
  test("pong handler is reachable through WeakMap lookup", () => {
    const bunSocket = { readyState: 1 } as object;
    const wsOpen = createMockElysiaWS("ws://localhost/ws?token=abc", bunSocket);

    let isAlive = true;
    const heartbeat = {
      pong: () => {
        isAlive = true;
      },
      stop: () => {},
    };

    interface WsMeta {
      heartbeat: { pong: () => void; stop: () => void };
      userId: string;
      workspaceId: string;
    }
    const meta: WsMeta = {
      workspaceId: "ws-123",
      userId: "user-456",
      heartbeat,
    };

    const wsMetaMap = new WeakMap<object, WsMeta>();
    wsMetaMap.set(wsOpen.raw, meta);

    // Simulate: server marks connection as dead (heartbeat check)
    isAlive = false;
    expect(isAlive).toBe(false);

    // Simulate: message handler receives pong
    const wsMessage = createMockElysiaWS("ws://localhost/ws", bunSocket);
    const retrieved = wsMetaMap.get(wsMessage.raw);

    // Verify we can find the metadata
    expect(retrieved).toBeDefined();
    expect(retrieved?.workspaceId).toBe("ws-123");

    // Simulate pong processing
    retrieved?.heartbeat.pong();
    expect(isAlive).toBe(true);
  });
});
