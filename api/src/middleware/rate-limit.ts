import { Elysia } from "elysia";
import { logger } from "../infra/logger.js";
import { redis } from "../infra/redis.js";

const WINDOW_S = 60; // 1 minute
const DEFAULT_MAX = 100;

function getKey(identifier: string, path: string): string {
  return `rl:${identifier}:${path}`;
}

export function rateLimit(max: number = DEFAULT_MAX) {
  return new Elysia({ name: "rate-limit" })
    .derive(({ request }: { request: Request }) => {
      // IMPORTANT: This middleware must run behind a trusted reverse proxy that
      // sets x-forwarded-for. These headers are client-spoofable if exposed directly.
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        (
          request as unknown as {
            server?: { requestIP?: { address?: string } };
          }
        ).server?.requestIP?.address ??
        "unknown";

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
        // On Redis failure, allow request through (fail-open)
        logger.error("Rate limit Redis error", {
          error: err instanceof Error ? err.message : String(err),
        });
        return;
      }

      const remaining = Math.max(0, max - count);
      set.headers["X-RateLimit-Remaining"] = String(remaining);

      if (count > max) {
        set.status = 429;
        return { error: "Too many requests" };
      }
    });
}
