const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}
