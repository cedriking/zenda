import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";
import { clearQueue, getQueuedItems } from "./offline-queue.js";
import {
  getDeadLetters,
  getQueueStats,
  retryDeadLetter,
} from "./persistent-queue.js";
import {
  isOutboundPaused,
  pauseOutbound,
  resumeOutbound,
} from "./processor.js";

export const queueModule = new Elysia({ prefix: "/queue" })

  .get("/", async ({ set }) => {
    try {
      const items = getQueuedItems();
      return {
        offlineQueue: {
          total: items.length,
          safe: items.filter((i) => i.type === "safe").length,
          unsafe: items.filter((i) => i.type === "unsafe").length,
        },
        note: "Per-workspace stats available at /queue/stats?workspaceId=...",
      };
    } catch (err) {
      logger.error("Failed to get queue overview", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get queue overview");
    }
  })

  .delete("/", async ({ query, set }) => {
    try {
      const { type } = (query as Record<string, string>) ?? {};
      const cleared = clearQueue(type as any);
      return { cleared };
    } catch (err) {
      logger.error("Failed to clear queue", { error: (err as Error).message });
      return serverError(set, "Failed to clear queue");
    }
  })

  .get("/stats", async ({ query, set }) => {
    try {
      const { workspaceId } = (query as Record<string, string>) ?? {};
      if (!workspaceId) {
        return badRequest(set, "workspaceId query parameter is required");
      }
      const stats = await getQueueStats(workspaceId);
      return {
        workspaceId,
        outboundPaused: isOutboundPaused(),
        ...stats,
      };
    } catch (err) {
      logger.error("Failed to get queue stats", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get queue stats");
    }
  })

  .post("/kill-switch", async ({ body, set }) => {
    try {
      const { action } = (body as Record<string, string>) ?? {};
      if (action === "pause") {
        pauseOutbound();
        return {
          status: "paused",
          message: "All outbound message processing has been paused",
        };
      }
      if (action === "resume") {
        resumeOutbound();
        return {
          status: "resumed",
          message: "Outbound message processing has been resumed",
        };
      }
      // Toggle
      if (isOutboundPaused()) {
        resumeOutbound();
        return {
          status: "resumed",
          message: "Outbound message processing has been resumed",
        };
      }
      pauseOutbound();
      return {
        status: "paused",
        message: "All outbound message processing has been paused",
      };
    } catch (err) {
      logger.error("Failed to toggle kill switch", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to toggle kill switch");
    }
  })

  .get("/dead-letters", async ({ query, set }) => {
    try {
      const { workspaceId, limit } = (query as Record<string, string>) ?? {};
      if (!workspaceId) {
        return badRequest(set, "workspaceId query parameter is required");
      }
      const items = await getDeadLetters(
        workspaceId,
        limit ? Number.parseInt(limit, 10) : undefined
      );
      return { workspaceId, count: items.length, items };
    } catch (err) {
      logger.error("Failed to get dead letters", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get dead letters");
    }
  })

  .post("/dead-letters/:id/retry", async ({ params, set }) => {
    try {
      const result = await retryDeadLetter(params.id);
      if (!result) {
        return notFound(
          set,
          "Dead letter message not found or not in dead_letter status"
        );
      }
      return { status: "retried", message: result };
    } catch (err) {
      logger.error("Failed to retry dead letter", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to retry dead letter");
    }
  });
