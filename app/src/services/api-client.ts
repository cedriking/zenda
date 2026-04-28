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
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error ?? `HTTP ${response.status}`)
  }

  return response.json()
}

// WebSocket connection
export function createWSConnection(): WebSocket | null {
  const token = localStorage.getItem('accessToken')
  if (!token) return null

  const wsUrl = API_BASE_URL.replace('http', 'ws')
  const ws = new WebSocket(`${wsUrl}/ws?token=${token}`)

  ws.addEventListener('open', () => {
    console.log('[WS] Connected to Zenda API')
  })

  ws.addEventListener('close', () => {
    console.log('[WS] Disconnected from Zenda API')
  })

  ws.addEventListener('error', (event) => {
    console.error('[WS] Error:', event)
  })

  return ws
}
