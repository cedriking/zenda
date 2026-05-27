import { db } from "@zenda/db/client";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { serverError } from "../../utils/errors.js";
import { getCircuitStatus } from "../ai/circuit-breaker/index.js";
import {
  getAgentHealthHistory,
  getAgentStatusSummary,
} from "./agent-health-monitor.js";

export const monitoringModule = new Elysia({ prefix: "/monitoring" })

  // Readiness probe (for load balancers) — intentionally unauthenticated
  .get("/ready", async ({ set }) => {
    try {
      await db.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch (err) {
      logger.error("Readiness check failed", { error: (err as Error).message });
      set.status = 503;
      return { ready: false };
    }
  })

  // Error reporting endpoint (for Sentry-style client reports) — intentionally unauthenticated
  .post("/errors", async ({ body }) => {
    const data = body as Record<string, unknown>;
    logger.error("Client error report", data);
    return { received: true };
  })

  // Extended health check — protected by shared secret
  .get("/health", async ({ set, headers }) => {
    const monitorSecret = process.env.MONITOR_SECRET;
    if (monitorSecret) {
      const auth = headers.authorization;
      if (!auth || auth !== `Bearer ${monitorSecret}`) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
    try {
      const checks: Record<
        string,
        { status: string; latency?: number; details?: string }
      > = {};

      // Database check
      const dbStart = Date.now();
      try {
        await db.$queryRaw`SELECT 1`;
        checks.database = { status: "ok", latency: Date.now() - dbStart };
      } catch (err) {
        checks.database = {
          status: "error",
          latency: Date.now() - dbStart,
          details: (err as Error).message,
        };
      }

      // AI providers circuit breaker
      checks.circuitBreaker = {
        status: "ok",
        details: JSON.stringify(getCircuitStatus()),
      };

      // Queue status — count pending messages in persistent queue
      const queueResult: Array<{ pending: bigint }> =
        await db.$queryRaw`SELECT count(*) as pending FROM outbound_queue WHERE status = 'pending'`;
      const pendingCount = Number(queueResult[0]?.pending ?? 0);
      checks.queues = {
        status: pendingCount > 100 ? "warn" : "ok",
        details: `${pendingCount} pending messages`,
      };

      const allOk = Object.values(checks).every((c) => c.status === "ok");
      const hasError = Object.values(checks).some((c) => c.status === "error");

      return {
        status: hasError ? "unhealthy" : allOk ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        version: "0.3.0",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        checks,
      };
    } catch (err) {
      logger.error("Health check failed", { error: (err as Error).message });
      return serverError(set, "Health check failed");
    }
  })

  // Agent health summary and history — protected by shared secret
  .get("/agents", async ({ set, headers, query }) => {
    const monitorSecret = process.env.MONITOR_SECRET;
    if (monitorSecret) {
      const auth = headers.authorization;
      if (!auth || auth !== `Bearer ${monitorSecret}`) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
    try {
      const agentName = query?.agent as string | undefined;
      const limit = Math.min(Number(query?.limit ?? 100), 500);

      const [summary, history] = await Promise.all([
        getAgentStatusSummary(),
        getAgentHealthHistory(agentName, limit),
      ]);

      return {
        timestamp: new Date().toISOString(),
        agents: summary,
        history,
      };
    } catch (err) {
      logger.error("Agent health endpoint failed", {
        error: (err as Error).message,
      });
      return serverError(set, "Agent health check failed");
    }
  });
