import { db } from "@zenda/db/client";
import { Elysia, t } from "elysia";
import { typedContext } from "../../middleware/typed-context.js";
import { redactPII } from "./logger.js";

export const auditModule = new Elysia({ prefix: "/audit" })
  .use(typedContext)

  // List audit logs with pagination and optional filters
  .get(
    "/",
    async ({ workspaceId, query }) => {
      const { entityType, entityId, action, limit = 50, offset = 0 } = query;

      const where: Record<string, unknown> = { workspaceId: workspaceId! };
      if (entityType) {
        where.entityType = entityType;
      }
      if (entityId) {
        where.entityId = entityId;
      }
      if (action) {
        where.action = action;
      }

      const [logs, totalResult] = await Promise.all([
        db.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        db.auditLog.count({ where }),
      ]);

      return { logs, total: totalResult };
    },
    {
      query: t.Object({
        entityType: t.Optional(t.String()),
        entityId: t.Optional(t.String()),
        action: t.Optional(t.String()),
        limit: t.Optional(t.Number()),
        offset: t.Optional(t.Number()),
      }),
    }
  )

  // Export audit logs as CSV
  .get(
    "/export",
    async ({ workspaceId, query, set }) => {
      const { entityType, from, to } = query;

      const where: Record<string, unknown> = { workspaceId: workspaceId! };
      if (entityType) {
        where.entityType = entityType;
      }
      if (from) {
        where.createdAt = {
          ...((where.createdAt as object) ?? {}),
          gte: new Date(from),
        };
      }
      if (to) {
        where.createdAt = {
          ...((where.createdAt as object) ?? {}),
          lte: new Date(to),
        };
      }

      const rows = await db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      const header =
        "timestamp,actor_type,actor_id,action,entity_type,entity_id,details";
      const csv = rows
        .map((r) =>
          [
            r.createdAt.toISOString(),
            r.actorType,
            r.actorId ?? "",
            r.action,
            r.entityType,
            r.entityId ?? "",
            redactPII(JSON.stringify(r.metadata ?? {})),
          ].join(",")
        )
        .join("\n");

      set.headers["content-type"] = "text/csv";
      return `${header}\n${csv}`;
    },
    {
      query: t.Object({
        entityType: t.Optional(t.String()),
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
      }),
    }
  )

  // Get audit event counts grouped by action
  .get("/stats", async ({ workspaceId }) => {
    const rows = await db.auditLog.groupBy({
      by: ["action"],
      where: { workspaceId: workspaceId! },
      _count: { action: true },
    });

    const counts: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      counts[row.action] = row._count.action;
      total += row._count.action;
    }

    return { counts, total };
  });
