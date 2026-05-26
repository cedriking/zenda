import { db } from "@zenda/db/client";
import { appointments, conversations, messages } from "@zenda/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
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

      const [result] = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.workspaceId, workspaceId!),
            gte(messages.createdAt, today)
          )
        );

      return { todayCount: result?.count ?? 0 };
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
          db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(appointments)
            .where(
              and(
                eq(appointments.workspaceId, workspaceId!),
                sql`DATE(${appointments.startAt}) = ${today}`,
                sql`${appointments.status} NOT IN ('cancelled', 'completed', 'no_show')`
              )
            ),
          db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(conversations)
            .where(
              and(
                eq(conversations.workspaceId, workspaceId!),
                eq(conversations.mode, "auto")
              )
            ),
          db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(conversations)
            .where(
              and(
                eq(conversations.workspaceId, workspaceId!),
                sql`${conversations.mode} IN ('needs_attention', 'human_takeover')`
              )
            ),
          db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(messages)
            .where(
              and(
                eq(messages.workspaceId, workspaceId!),
                gte(messages.createdAt, new Date(today))
              )
            ),
        ]);

      return {
        todayAppointments: todayAppts[0]?.count ?? 0,
        activeConversations: activeConvs[0]?.count ?? 0,
        needsAttention: needsAttention[0]?.count ?? 0,
        todayMessages: todayMsgs[0]?.count ?? 0,
      };
    } catch (err) {
      logger.error("Failed to get dashboard stats", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get dashboard stats");
    }
  });
