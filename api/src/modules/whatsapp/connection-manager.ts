import { logger } from "../../infra/logger.js";

/**
 * Minimal type for the WS connection used in this module.
 * Elysia's ElysiaWS provides send, close, readyState via its raw Bun WS socket.
 */
interface WSConnection {
  close(code?: number, reason?: string): void;
  raw?: { rawListeners?: (event: string) => unknown[] };
  readyState: number;
  send(data: string | ArrayBuffer, compress?: boolean): number;
}

interface AuthenticatedWS extends WSConnection {
  data: {
    userId: string;
    workspaceId: string;
  };
}

// Track active connections: workspaceId -> { ws, generation }
const connections = new Map<string, { ws: AuthenticatedWS; generation: number }>();
let globalGeneration = 0;

export function addConnection(workspaceId: string, ws: AuthenticatedWS) {
  const old = connections.get(workspaceId);
  const generation = ++globalGeneration;

  // Set the new connection FIRST, then close the old one.
  // This prevents the old socket's close handler from deleting the new connection.
  connections.set(workspaceId, { ws, generation });

  if (old && old.ws.readyState === 1) {
    old.ws.close(1000, "Replaced by new connection");
  }
}

export function removeConnection(workspaceId: string, ws?: unknown) {
  // If a ws reference is provided, only remove if it matches the current entry.
  // This prevents a stale close handler from evicting a newer connection.
  if (ws) {
    const entry = connections.get(workspaceId);
    if (entry && entry.ws !== ws) return;
  }
  connections.delete(workspaceId);
}

export function getConnection(
  workspaceId: string
): AuthenticatedWS | undefined {
  return connections.get(workspaceId)?.ws;
}

export function sendToWorkspace(workspaceId: string, data: unknown): boolean {
  const entry = connections.get(workspaceId);
  const ws = entry?.ws;
  if (!ws || ws.readyState !== 1) {
    const typed = data as Record<string, unknown> | undefined;
    logger.warn("sendToWorkspace: WS not connected, message dropped", {
      workspaceId,
      type: typed?.type ?? "unknown",
      readyState: ws?.readyState ?? "no_ws",
    });
    return false;
  }
  ws.send(JSON.stringify(data));
  return true;
}

export function getActiveWorkspaceCount(): number {
  return connections.size;
}

export function isWorkspaceConnected(workspaceId: string): boolean {
  const entry = connections.get(workspaceId);
  return entry !== undefined && entry.ws.readyState === 1;
}

// Heartbeat: ping every 30s, close if no pong for 60s
const HEARTBEAT_INTERVAL = 30_000;
const _HEARTBEAT_TIMEOUT = 60_000;

export function startHeartbeat(workspaceId: string, ws: AuthenticatedWS) {
  let isAlive = true;

  const heartbeatInterval = setInterval(() => {
    if (ws.readyState !== 1) {
      clearInterval(heartbeatInterval);
      return;
    }
    if (!isAlive) {
      ws.close(4001, "Heartbeat timeout");
      clearInterval(heartbeatInterval);
      removeConnection(workspaceId, ws);
      return;
    }
    isAlive = false;
    ws.send(JSON.stringify({ type: "ping" }));
  }, HEARTBEAT_INTERVAL);

  // Listen for pong
  const _originalOnMessage = ws.raw?.rawListeners?.("message") ?? [];
  // Note: Elysia WS handles messages through its own pipeline
  // We track pong via the message handler in ws-handler
  return {
    pong: () => {
      isAlive = true;
    },
    stop: () => clearInterval(heartbeatInterval),
  };
}
