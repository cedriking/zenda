import { beforeEach, describe, expect, test } from "bun:test";
import {
  addConnection,
  getActiveWorkspaceCount,
  getConnection,
  isWorkspaceConnected,
  removeConnection,
  sendToWorkspace,
} from "../../src/modules/whatsapp/connection-manager";

// Helper to create a mock WebSocket
function createMockWS(
  overrides: Partial<{
    readyState: number;
    send: (data: string) => void;
    close: () => void;
  }> = {}
) {
  return {
    readyState: overrides.readyState ?? 1,
    send:
      overrides.send ??
      (() => {
        /* noop */
      }),
    close:
      overrides.close ??
      (() => {
        /* noop */
      }),
    data: { userId: "user-1", workspaceId: "ws-1" },
  } as any;
}

const WS_1 = "workspace-1";
const WS_2 = "workspace-2";

// Clean up connections between tests
beforeEach(() => {
  removeConnection(WS_1);
  removeConnection(WS_2);
});

// ===========================================================================
// addConnection / getConnection
// ===========================================================================

describe("addConnection / getConnection", () => {
  test("stores and retrieves a connection", () => {
    const ws = createMockWS();
    addConnection(WS_1, ws);
    expect(getConnection(WS_1)).toBe(ws);
  });

  test("returns undefined for unknown workspace", () => {
    expect(getConnection("nonexistent")).toBeUndefined();
  });

  test("replaces existing connection for same workspace", () => {
    const ws1 = createMockWS();
    const ws2 = createMockWS();
    let closed = false;
    ws1.close = () => {
      closed = true;
    };

    addConnection(WS_1, ws1);
    addConnection(WS_1, ws2);

    expect(getConnection(WS_1)).toBe(ws2);
    expect(closed).toBe(true);
  });
});

// ===========================================================================
// removeConnection
// ===========================================================================

describe("removeConnection", () => {
  test("removes an existing connection", () => {
    addConnection(WS_1, createMockWS());
    removeConnection(WS_1);
    expect(getConnection(WS_1)).toBeUndefined();
  });

  test("does nothing for nonexistent workspace", () => {
    expect(() => removeConnection("nonexistent")).not.toThrow();
  });
});

// ===========================================================================
// sendToWorkspace
// ===========================================================================

describe("sendToWorkspace", () => {
  test("sends JSON-stringified data to connected workspace", () => {
    let sentData = "";
    const ws = createMockWS({
      send: (d: string) => {
        sentData = d;
      },
    });
    addConnection(WS_1, ws);

    const result = sendToWorkspace(WS_1, { type: "test", data: "hello" });
    expect(result).toBe(true);
    expect(sentData).toBe('{"type":"test","data":"hello"}');
  });

  test("returns false for disconnected workspace", () => {
    const ws = createMockWS({ readyState: 3 }); // CLOSED
    addConnection(WS_1, ws);

    expect(sendToWorkspace(WS_1, { type: "test" })).toBe(false);
  });

  test("returns false for unknown workspace", () => {
    expect(sendToWorkspace("nonexistent", { type: "test" })).toBe(false);
  });
});

// ===========================================================================
// getActiveWorkspaceCount
// ===========================================================================

describe("getActiveWorkspaceCount", () => {
  test("returns 0 when no connections", () => {
    expect(getActiveWorkspaceCount()).toBe(0);
  });

  test("returns correct count", () => {
    addConnection(WS_1, createMockWS());
    addConnection(WS_2, createMockWS());
    expect(getActiveWorkspaceCount()).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// isWorkspaceConnected
// ===========================================================================

describe("isWorkspaceConnected", () => {
  test("returns true for connected (readyState=1) workspace", () => {
    addConnection(WS_1, createMockWS({ readyState: 1 }));
    expect(isWorkspaceConnected(WS_1)).toBe(true);
  });

  test("returns false for disconnected (readyState=3) workspace", () => {
    addConnection(WS_1, createMockWS({ readyState: 3 }));
    expect(isWorkspaceConnected(WS_1)).toBe(false);
  });

  test("returns false for unknown workspace", () => {
    expect(isWorkspaceConnected("nonexistent")).toBe(false);
  });
});
