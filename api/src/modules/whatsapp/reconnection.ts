import { logger } from "../../infra/logger.js";

interface ReconnectionState {
  attempts: number;
  maxAttempts: number;
  nextRetry: number;
  state: "idle" | "reconnecting" | "connected";
  workspaceId: string;
}

const connections = new Map<string, ReconnectionState>();
const BASE_DELAY = 2000;
const MAX_DELAY = 300_000; // 5 minutes

export function markConnected(workspaceId: string): void {
  const state = getOrCreate(workspaceId);
  state.state = "connected";
  state.attempts = 0;
  state.nextRetry = 0;
}

export function markDisconnected(workspaceId: string): ReconnectionState {
  const state = getOrCreate(workspaceId);
  state.state = "reconnecting";
  state.attempts++;
  state.nextRetry = Date.now() + getDelay(state.attempts);

  logger.warn("WhatsApp disconnected, scheduling reconnect", {
    workspaceId,
    attempts: state.attempts,
    nextRetry: new Date(state.nextRetry).toISOString(),
  });

  return state;
}

export function shouldReconnect(workspaceId: string): boolean {
  const state = connections.get(workspaceId);
  if (!state) {
    return false;
  }
  if (state.state === "connected") {
    return false;
  }
  if (state.attempts >= state.maxAttempts) {
    return false;
  }
  return Date.now() >= state.nextRetry;
}

export function getReconnectionStatus(
  workspaceId: string
): ReconnectionState | null {
  return connections.get(workspaceId) ?? null;
}

export function resetReconnection(workspaceId: string): void {
  const state = connections.get(workspaceId);
  if (state) {
    state.state = "idle";
    state.attempts = 0;
  }
}

function getOrCreate(workspaceId: string): ReconnectionState {
  if (!connections.has(workspaceId)) {
    connections.set(workspaceId, {
      workspaceId,
      attempts: 0,
      maxAttempts: 50,
      nextRetry: 0,
      state: "idle",
    });
  }
  return connections.get(workspaceId)!;
}

function getDelay(attempt: number): number {
  // Exponential backoff with jitter
  const delay = Math.min(BASE_DELAY * 2 ** attempt, MAX_DELAY);
  const jitter = delay * 0.2 * Math.random();
  return Math.round(delay + jitter);
}
