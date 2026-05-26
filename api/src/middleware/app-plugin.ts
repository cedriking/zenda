import { db } from "@zenda/db/client";
import { workspaceMembers, workspaces } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../config/env.js";
import { logger } from "../infra/logger.js";

const jwtSecret = new TextEncoder().encode(JWT_SECRET);

const unauthorizedRes = new Response(
  JSON.stringify({ error: "Unauthorized" }),
  {
    status: 401,
    headers: { "Content-Type": "application/json" },
  }
);

const forbiddenRes = new Response(
  JSON.stringify({ error: "Workspace not found or access denied" }),
  {
    status: 403,
    headers: { "Content-Type": "application/json" },
  }
);

/**
 * Factory function that creates a FRESH auth + workspace guard plugin per call.
 * This prevents Elysia from deduplicating a shared singleton across modules.
 *
 * Uses jose directly for JWT verification — no Elysia JWT plugin dependency.
 */
export function createAppPlugin() {
  return new Elysia()
    .derive(async ({ headers }) => {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        logger.debug("[appPlugin] No Bearer token");
        return {
          userId: null as string | null,
          workspaceId: null as string | null,
        };
      }
      try {
        const token = authHeader.slice(7);
        const { payload } = await jwtVerify(token, jwtSecret);
        const userId = (payload.sub as string) ?? null;
        const workspaceId =
          ((payload as Record<string, unknown>).workspaceId as string) ?? null;
        logger.debug("[appPlugin] Token OK", { userId, workspaceId });
        return { userId, workspaceId };
      } catch (err) {
        logger.debug("[appPlugin] Token FAILED", {
          error: (err as Error).message,
        });
        return {
          userId: null as string | null,
          workspaceId: null as string | null,
        };
      }
    })
    .derive(async ({ userId, workspaceId }) => {
      if (!(userId && workspaceId)) {
        return { workspace: null };
      }

      const membership = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return { workspace: null };
      }

      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      return { workspace: workspace[0] ?? null };
    })
    .onBeforeHandle(({ userId }) => {
      if (!userId) {
        return unauthorizedRes;
      }
    })
    .onBeforeHandle(({ workspace }) => {
      if (!workspace) {
        return forbiddenRes;
      }
    });
}

/**
 * NOTE: Do NOT export a singleton. Consumers must call createAppPlugin()
 * directly to avoid shared mutable state across tests and instances.
 */
