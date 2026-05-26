import { timingSafeEqual } from "node:crypto";
import { db } from "@zenda/db/client";
import {
  planTierEnum,
  subscriptions,
  whatsappConnections,
  workspaces,
} from "@zenda/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { ADMIN_SECRET } from "../../config/env.js";
import { logger } from "../../infra/logger.js";
import { authBase } from "../../middleware/auth.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

const VALID_PLAN_TIERS: Set<string> = new Set(planTierEnum.enumValues);

const forbiddenRes = new Response(
  JSON.stringify({ error: "Admin access denied" }),
  {
    status: 403,
    headers: { "Content-Type": "application/json" },
  }
);

function safeCompare(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  const bufA = Buffer.alloc(maxLen);
  const bufB = Buffer.alloc(maxLen);
  bufA.write(a);
  bufB.write(b);
  return timingSafeEqual(bufA, bufB);
}

export const adminModule = new Elysia({ prefix: "/admin" })
  .use(authBase)
  .use(typedContext)
  .onBeforeHandle(
    ({
      headers,
    }: {
      headers: Record<string, string | undefined>;
    }) => {
      const secret = headers["x-admin-secret"];
      if (!(ADMIN_SECRET && secret && safeCompare(secret, ADMIN_SECRET))) {
        return forbiddenRes;
      }
    }
  )

  // Workspace overview
  .get("/workspaces", async ({ set }) => {
    try {
      const wsList = await db
        .select({
          id: workspaces.id,
          name: workspaces.name,
          slug: workspaces.slug,
          onboardingStep: workspaces.onboardingStep,
          createdAt: workspaces.createdAt,
        })
        .from(workspaces)
        .orderBy(desc(workspaces.createdAt))
        .limit(100);

      return wsList;
    } catch (err) {
      logger.error("Failed to list workspaces", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list workspaces");
    }
  })

  .get("/workspaces/:id", async ({ params, set }) => {
    try {
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, params.id))
        .limit(1);

      if (!ws) {
        return notFound(set, "Workspace not found");
      }

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.workspaceId, ws.id))
        .limit(1);

      const connections = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.workspaceId, ws.id))
        .limit(5);

      return { workspace: ws, subscription: sub, connections };
    } catch (err) {
      logger.error("Failed to get workspace detail", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get workspace detail");
    }
  })

  // Subscription overview
  .get("/subscriptions", async ({ set }) => {
    try {
      const subs = await db
        .select({
          workspaceId: subscriptions.workspaceId,
          planTier: subscriptions.planTier,
          status: subscriptions.status,
          billingPeriod: subscriptions.billingPeriod,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
        })
        .from(subscriptions)
        .orderBy(desc(subscriptions.createdAt))
        .limit(100);

      return subs;
    } catch (err) {
      logger.error("Failed to list subscriptions", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list subscriptions");
    }
  })

  // Override plan
  .post("/workspaces/:id/override-plan", async ({ params, body, set }) => {
    try {
      const data = body as Record<string, string>;
      if (!data.planTier || !VALID_PLAN_TIERS.has(data.planTier)) {
        return badRequest(set, `Invalid planTier. Must be one of: ${planTierEnum.enumValues.join(", ")}`);
      }
      await db
        .update(subscriptions)
        .set({
          // biome-ignore lint/suspicious/noExplicitAny: planTier is a pgEnum that doesn't accept string directly
          planTier: data.planTier as typeof planTierEnum.enumValues[number],
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.workspaceId, params.id));

      logger.info("Plan override", {
        workspaceId: params.id,
        plan: data.planTier,
      });
      return { success: true };
    } catch (err) {
      logger.error("Failed to override plan", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to override plan");
    }
  })

  // Stats
  .get("/stats", async ({ set }) => {
    try {
      const [workspaceCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(workspaces);

      const [activeSubs] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.status, "active"));

      return {
        totalWorkspaces: workspaceCount?.count ?? 0,
        activeSubscriptions: activeSubs?.count ?? 0,
      };
    } catch (err) {
      logger.error("Failed to get admin stats", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get admin stats");
    }
  });
