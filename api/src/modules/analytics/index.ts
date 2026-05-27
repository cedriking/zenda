import { db } from "@zenda/db/client";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { serverError } from "../../utils/errors.js";
import { getAnalytics } from "./service.js";

export const analyticsModule = new Elysia({ prefix: "/analytics" })
  .use(typedContext)

  .get("/", async ({ workspaceId, query, set }) => {
    try {
      const { period } = (query as Record<string, string>) ?? {};
      const days = Math.max(
        1,
        Math.min(365, Number.parseInt(period ?? "30", 10) || 30)
      );
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

      return await getAnalytics(workspaceId!, { start, end });
    } catch (err) {
      logger.error("Failed to get analytics", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get analytics");
    }
  })

  .get("/messages-today", async ({ workspaceId, set }) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await db.message.count({
        where: {
          workspaceId: workspaceId!,
          createdAt: { gte: today },
        },
      });

      return { todayCount: count };
    } catch (err) {
      logger.error("Failed to get messages today", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get messages today");
    }
  })

  .get("/dashboard-stats", async ({ workspaceId, set }) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [todayAppts, activeConvs, needsAttention, todayMsgs] =
        await Promise.all([
          db.appointment.count({
            where: {
              workspaceId: workspaceId!,
              startAt: { gte: new Date(today) },
              status: { notIn: ["cancelled", "completed", "no_show"] },
            },
          }),
          db.conversation.count({
            where: {
              workspaceId: workspaceId!,
              mode: "auto",
            },
          }),
          db.conversation.count({
            where: {
              workspaceId: workspaceId!,
              mode: { in: ["needs_attention", "human_takeover"] },
            },
          }),
          db.message.count({
            where: {
              workspaceId: workspaceId!,
              createdAt: { gte: new Date(today) },
            },
          }),
        ]);

      return {
        todayAppointments: todayAppts,
        activeConversations: activeConvs,
        needsAttention,
        todayMessages: todayMsgs,
      };
    } catch (err) {
      logger.error("Failed to get dashboard stats", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get dashboard stats");
    }
  });
