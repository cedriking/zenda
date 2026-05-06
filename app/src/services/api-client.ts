const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.zenda.bot'

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

async function getAccessToken(): Promise<string | null> {
  return localStorage.getItem('accessToken')
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data.accessToken
  } catch {
    return null
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  let token = await getAccessToken()
  const makeRequest = (accessToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

  let response = await makeRequest(token)

  // Auto-refresh on 401
  if (response.status === 401 && token) {
    token = await refreshAccessToken()
    if (token) {
      response = await makeRequest(token)
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    if (data?.details) {
      const msgs = data.details.map((d: { message: string }) => d.message).join('. ')
      throw new Error(msgs || data?.error || `HTTP ${response.status}`)
    }
    throw new Error(data?.error ?? data?.message ?? `HTTP ${response.status}`)
  }

  return response.json()
}

// WebSocket connection with reconnection logic
export function createWSConnection(): { ws: WebSocket | null; cleanup: () => void } {
  const token = localStorage.getItem('accessToken')
  if (!token) return { ws: null, cleanup: () => {} }

  const wsUrl = API_BASE_URL.replace('http', 'ws')
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  let intentionallyClosed = false

  const MAX_RECONNECT_ATTEMPTS = 5
  const BASE_RECONNECT_DELAY = 3000

  function attemptConnect() {
    const currentToken = localStorage.getItem('accessToken')
    if (!currentToken) {
      console.log('[WS] No access token available, skipping reconnect')
      return
    }

    ws = new WebSocket(`${wsUrl}/ws?token=${currentToken}`)

    ws.addEventListener('open', () => {
      reconnectAttempts = 0
      console.log('[WS] Connected to Zenda API')
    })

    ws.addEventListener('close', () => {
      if (intentionallyClosed) return

      console.log('[WS] Disconnected from Zenda API')
      reconnectAttempts++

      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        console.error(`[WS] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`)
        return
      }

      // Exponential backoff: 3s, 6s, 12s, 24s, 48s
      const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 48000)
      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
      reconnectTimer = setTimeout(attemptConnect, delay)
    })

    ws.addEventListener('error', (event) => {
      console.error('[WS] Error:', event)
    })
  }

  attemptConnect()

  const cleanup = () => {
    intentionallyClosed = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (ws) {
      ws.close()
      ws = null
    }
  }

  return { ws, cleanup }
}
