const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.zenda.bot";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: string;
}

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let token = getAccessToken();
  const makeRequest = (accessToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response = await makeRequest(token);

  // Auto-refresh on 401
  if (response.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) {
      response = await makeRequest(token);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (data?.details) {
      const msgs = data.details
        .map((d: { message: string }) => d.message)
        .join(". ");
      throw new ApiError(
        response.status,
        msgs || data?.error || `HTTP ${response.status}`
      );
    }
    throw new ApiError(
      response.status,
      data?.error ?? data?.message ?? `HTTP ${response.status}`
    );
  }

  return response.json();
}

// WebSocket connection with reconnection logic
export interface WSConnection {
  /** Tear down the connection and stop reconnecting. */
  cleanup(): void;
  /** Subscribe to connection close events. Returns an unsubscribe function. */
  onClose(handler: () => void): () => void;
  /** Subscribe to incoming messages. Returns an unsubscribe function. */
  onMessage(handler: (data: unknown) => void): () => void;
  /** Subscribe to connection open events. Returns an unsubscribe function. */
  onOpen(handler: () => void): () => void;
  /** Send data over the current socket. No-op if not connected. */
  send(data: unknown): void;
}

type Handler = (...args: unknown[]) => void;

export function createWSConnection(): WSConnection {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    // No token — return no-op stubs
    const noop = () => () => {
      /* no-op */
    };
    return {
      onMessage: noop,
      onOpen: noop,
      onClose: noop,
      send: () => {
        /* no-op */
      },
      cleanup: () => {
        /* no-op */
      },
    };
  }

  const wsUrl = API_BASE_URL.replace("http", "ws");
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let intentionallyClosed = false;

  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 3000;

  const messageHandlers = new Set<Handler>();
  const openHandlers = new Set<Handler>();
  const closeHandlers = new Set<Handler>();

  function attemptConnect() {
    const currentToken = localStorage.getItem("accessToken");
    if (!currentToken) {
      console.log("[WS] No access token available, skipping reconnect");
      return;
    }

    ws = new WebSocket(`${wsUrl}/ws`);

    ws.addEventListener("open", () => {
      // Send auth token as first message instead of URL query param to avoid
      // leaking the token in server access logs, proxy logs, and browser history.
      ws?.send(JSON.stringify({ type: "auth", token: currentToken }));

      reconnectAttempts = 0;
      console.log("[WS] Connected to Zenda API");
      for (const h of openHandlers) {
        h();
      }
    });

    ws.addEventListener("message", (event) => {
      let data: unknown;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      for (const h of messageHandlers) {
        h(data);
      }
    });

    ws.addEventListener("close", () => {
      if (intentionallyClosed) {
        return;
      }

      console.log("[WS] Disconnected from Zenda API");
      for (const h of closeHandlers) {
        h();
      }

      reconnectAttempts++;

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        console.error(
          `[WS] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`
        );
        return;
      }

      // Exponential backoff: 3s, 6s, 12s, 24s, 48s
      const delay = Math.min(
        BASE_RECONNECT_DELAY * 2 ** (reconnectAttempts - 1),
        48_000
      );
      console.log(
        `[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
      );
      reconnectTimer = setTimeout(attemptConnect, delay);
    });

    ws.addEventListener("error", (event) => {
      console.error("[WS] Error:", event);
    });
  }

  attemptConnect();

  function subscribe(set: Set<Handler>, handler: Handler): () => void {
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }

  return {
    onMessage: (h) => subscribe(messageHandlers, h),
    onOpen: (h) => subscribe(openHandlers, h),
    onClose: (h) => subscribe(closeHandlers, h),
    send: (data) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof data === "string" ? data : JSON.stringify(data));
      }
    },
    cleanup: () => {
      intentionallyClosed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws) {
        ws.close();
        ws = null;
      }
      messageHandlers.clear();
      openHandlers.clear();
      closeHandlers.clear();
    },
  };
}
