import { Elysia } from "elysia";
import { logger } from "../infra/logger.js";
import { redis } from "../infra/redis.js";

const WINDOW_S = 60; // 1 minute
const DEFAULT_MAX = 100;

const TRUSTED_PROXIES = new Set(
  (process.env.TRUSTED_PROXIES ?? "").split(",").map((s) => s.trim()).filter(Boolean)
);

function getKey(identifier: string, path: string): string {
  return `rl:${identifier}:${path}`;
}

// In-memory fallback limiter for when Redis is unavailable
class InMemoryLimiter {
  private counts = new Map<string, { count: number; expiresAt: number }>();

  increment(key: string): number {
    const now = Date.now();
    const entry = this.counts.get(key);

    if (!entry || entry.expiresAt < now) {
      const newEntry = { count: 1, expiresAt: now + WINDOW_S * 1000 };
      this.counts.set(key, newEntry);
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  /** Evict expired entries to prevent unbounded growth */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.counts) {
      if (entry.expiresAt < now) {
        this.counts.delete(key);
      }
    }
  }
}

const memoryLimiter = new InMemoryLimiter();

// Periodic cleanup every 60s
setInterval(() => memoryLimiter.cleanup(), WINDOW_S * 1000).unref?.();

export function rateLimit(max: number = DEFAULT_MAX) {
  return new Elysia({ name: "rate-limit" })
    .derive(({ request }: { request: Request }) => {
      const directIP =
        (
          request as unknown as {
            server?: { requestIP?: { address?: string } };
          }
        ).server?.requestIP?.address ??
        request.headers.get("x-real-ip") ??
        "unknown";

      let ip = directIP;

      // Only trust x-forwarded-for when the direct connection IP is a trusted proxy
      if (TRUSTED_PROXIES.has(directIP)) {
        ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          directIP;
      }

      return { _rlKey: getKey(ip, new URL(request.url).pathname) };
    })
    .onBeforeHandle(async ({ _rlKey, set }) => {
      let count: number;

      try {
        count = await redis.incr(_rlKey);
        if (count === 1) {
          await redis.expire(_rlKey, WINDOW_S);
        }
      } catch (err) {
        // Redis unavailable — fail closed using in-memory fallback
        logger.warn("Rate limit Redis error, using in-memory fallback", {
          error: err instanceof Error ? err.message : String(err),
        });
        count = memoryLimiter.increment(_rlKey);
      }

      const remaining = Math.max(0, max - count);
      set.headers["X-RateLimit-Remaining"] = String(remaining);

      if (count > max) {
        set.status = 429;
        return { error: "Too many requests" };
      }
    });
}
