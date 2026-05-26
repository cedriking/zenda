import type { LoginResponse, SignupResponse } from '@zenda/shared'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.zenda.bot'

const TOKEN_KEY = 'zenda_tokens'

interface StoredTokens {
  accessToken: string
  refreshToken: string
}

function getStoredTokens(): StoredTokens | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? (JSON.parse(raw) as StoredTokens) : null
  } catch {
    return null
  }
}

export function storeTokens(tokens: StoredTokens): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens()
  if (!tokens?.refreshToken) return null

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    return data.accessToken
  } catch {
    return null
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// Deduplicate concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null

function deduplicatedRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getAccessToken()

  const makeRequest = (accessToken: string | null) => {
    const headers = new Headers(options.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    })
  }

  let res = await makeRequest(token)

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    token = await deduplicatedRefresh()
    if (token) {
      res = await makeRequest(token)
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

/** Typed helper for login — persists tokens on success */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const result = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken })
  return result
}

/** Typed helper for signup — persists tokens on success */
export async function signup(data: {
  email: string
  password: string
  name: string
  businessName: string
}): Promise<SignupResponse> {
  const result = await apiFetch<SignupResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  storeTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken })
  return result
}

/** Logout — clears local tokens and notifies the server */
export async function logout(): Promise<void> {
  const tokens = getStoredTokens()
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
    })
  } finally {
    clearTokens()
  }
}
