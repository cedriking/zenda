import Redis from "ioredis";
import { logger } from "./logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CREDENTIAL_PATTERN = /\/\/.*@/;

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

redis.on("connect", () => {
  logger.info("Redis connected", {
    url: REDIS_URL.replace(CREDENTIAL_PATTERN, "//***@"),
  });
});
