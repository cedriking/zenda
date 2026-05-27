import { timingSafeEqual } from "node:crypto";
import { db, Prisma } from "@zenda/db/client";
import { Elysia } from "elysia";
import { ADMIN_SECRET } from "../../config/env.js";
import { logger } from "../../infra/logger.js";
import { authBase } from "../../middleware/auth.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

// Derive valid plan tiers from the Prisma enum at runtime
const _VALID_PLAN_TIERS: Set<string> = new Set(
  Prisma.PropertyName as unknown as string[]
);

// Fallback: if the above doesn't work at runtime, hardcode from schema
const PLAN_TIER_VALUES = ["free", "solo", "starter", "pro", "business"];
const VALID_TIERS: Set<string> = new Set(PLAN_TIER_VALUES);

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
    ({ headers }: { headers: Record<string, string | undefined> }) => {
      const secret = headers["x-admin-secret"];
      if (!(ADMIN_SECRET && secret && safeCompare(secret, ADMIN_SECRET))) {
        return forbiddenRes;
      }
    }
  )

  // Workspace overview
  .get("/workspaces", async ({ set }) => {
    try {
      const wsList = await db.workspace.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          onboardingStep: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

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
      const ws = await db.workspace.findUnique({
        where: { id: params.id },
      });

      if (!ws) {
        return notFound(set, "Workspace not found");
      }

      const sub = await db.subscription.findFirst({
        where: { workspaceId: ws.id },
      });

      const connections = await db.whatsappConnection.findMany({
        where: { workspaceId: ws.id },
        take: 5,
      });

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
      const subs = await db.subscription.findMany({
        select: {
          workspaceId: true,
          planTier: true,
          status: true,
          billingPeriod: true,
          currentPeriodEnd: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

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
      if (!(data.planTier && VALID_TIERS.has(data.planTier))) {
        return badRequest(
          set,
          `Invalid planTier. Must be one of: ${PLAN_TIER_VALUES.join(", ")}`
        );
      }
      await db.subscription.updateMany({
        where: { workspaceId: params.id },
        data: {
          planTier: data.planTier as any,
          status: "active",
          updatedAt: new Date(),
        },
      });

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
      const totalWorkspaces = await db.workspace.count();

      const activeSubscriptions = await db.subscription.count({
        where: { status: "active" },
      });

      return {
        totalWorkspaces,
        activeSubscriptions,
      };
    } catch (err) {
      logger.error("Failed to get admin stats", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get admin stats");
    }
  });
