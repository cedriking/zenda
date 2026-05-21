import { Elysia } from 'elysia'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limits = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000 // 1 minute
const DEFAULT_MAX = 100

function getKey(identifier: string, path: string): string {
  return `${identifier}:${path}`
}

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of limits) {
    if (now >= entry.resetAt) {
      limits.delete(key)
    }
  }
}, WINDOW_MS)

export function rateLimit(max: number = DEFAULT_MAX) {
  return new Elysia({ name: 'rate-limit' })
    .derive(({ request }: { request: Request }) => {
      // IMPORTANT: This middleware must run behind a trusted reverse proxy that
      // sets x-forwarded-for. These headers are client-spoofable if exposed directly.
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
        ?? (request as any).server?.requestIP?.address
        ?? 'unknown'

      const key = getKey(ip, new URL(request.url).pathname)
      const now = Date.now()
      const entry = limits.get(key)

      if (!entry || now >= entry.resetAt) {
        limits.set(key, { count: 1, resetAt: now + WINDOW_MS })
        return { rateLimitRemaining: max - 1, rateLimited: false }
      }

      entry.count++
      const remaining = Math.max(0, max - entry.count)
      const rateLimited = entry.count > max

      return { rateLimitRemaining: remaining, rateLimited }
    })
    .onAfterHandle(({ rateLimitRemaining, set }) => {
      set.headers['X-RateLimit-Remaining'] = String(rateLimitRemaining)
    })
    .onBeforeHandle(({ rateLimited, set }) => {
      if (rateLimited) {
        set.status = 429
        return { error: 'Too many requests' }
      }
    })
}
