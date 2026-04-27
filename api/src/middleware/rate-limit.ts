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

export function rateLimit(max: number = DEFAULT_MAX) {
  return new Elysia({ name: 'rate-limit' })
    .derive(({ request }: { request: Request }) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? request.headers.get('x-real-ip')
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
}
