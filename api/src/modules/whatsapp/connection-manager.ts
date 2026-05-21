import { Elysia } from 'elysia'

/**
 * Minimal type for the WS connection used in this module.
 * Elysia's ElysiaWS provides send, close, readyState via its raw Bun WS socket.
 */
interface WSConnection {
  send(data: string | ArrayBuffer, compress?: boolean): number
  close(code?: number, reason?: string): void
  readyState: number
  raw?: { rawListeners?: (event: string) => unknown[] }
}

interface AuthenticatedWS extends WSConnection {
  data: {
    userId: string
    workspaceId: string
  }
}

// Track active connections: workspaceId -> WebSocket
const connections = new Map<string, AuthenticatedWS>()

export function addConnection(workspaceId: string, ws: AuthenticatedWS) {
  // Close existing connection for this workspace (1 connection per workspace in v1)
  const existing = connections.get(workspaceId)
  if (existing && existing.readyState === 1) {
    existing.close(1000, 'Replaced by new connection')
  }
  connections.set(workspaceId, ws)
}

export function removeConnection(workspaceId: string) {
  connections.delete(workspaceId)
}

export function getConnection(workspaceId: string): AuthenticatedWS | undefined {
  return connections.get(workspaceId)
}

export function sendToWorkspace(workspaceId: string, data: unknown): boolean {
  const ws = connections.get(workspaceId)
  if (!ws || ws.readyState !== 1) return false
  ws.send(JSON.stringify(data))
  return true
}

export function getActiveWorkspaceCount(): number {
  return connections.size
}

export function isWorkspaceConnected(workspaceId: string): boolean {
  const ws = connections.get(workspaceId)
  return ws !== undefined && ws.readyState === 1
}

// Heartbeat: ping every 30s, close if no pong for 60s
const HEARTBEAT_INTERVAL = 30_000
const HEARTBEAT_TIMEOUT = 60_000

export function startHeartbeat(workspaceId: string, ws: AuthenticatedWS) {
  let isAlive = true

  const heartbeatInterval = setInterval(() => {
    if (ws.readyState !== 1) {
      clearInterval(heartbeatInterval)
      return
    }
    if (!isAlive) {
      ws.close(4001, 'Heartbeat timeout')
      clearInterval(heartbeatInterval)
      removeConnection(workspaceId)
      return
    }
    isAlive = false
    ws.send(JSON.stringify({ type: 'ping' }))
  }, HEARTBEAT_INTERVAL)

  // Listen for pong
  const originalOnMessage = ws.raw?.rawListeners?.('message') ?? []
  // Note: Elysia WS handles messages through its own pipeline
  // We track pong via the message handler in ws-handler
  return {
    pong: () => { isAlive = true },
    stop: () => clearInterval(heartbeatInterval),
  }
}
