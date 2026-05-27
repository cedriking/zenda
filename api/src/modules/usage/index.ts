import { db } from "@zenda/db/client";
import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { serverError } from "../../utils/errors.js";
import { enforceLimit } from "./enforcement.js";
import { getUsageForPeriod } from "./tracker.js";

export const usageModule = new Elysia({ prefix: "/usage" })
  .use(typedContext)

  // Current period usage summary for dashboard
  .get("/", async ({ workspaceId, set }) => {
    try {
      return await getUsageForPeriod(workspaceId!);
    } catch (err) {
      logger.error("Failed to get usage", { error: (err as Error).message });
      return serverError(set, "Failed to get usage");
    }
  })

  // Detailed analytics: enforcement status + plan info
  .get("/analytics", async ({ workspaceId, set }) => {
    try {
      const wsId = workspaceId!;

      // Get subscription/plan
      const sub = await db.subscription.findFirst({
        where: { workspaceId: wsId },
      });

      const tier: PlanTier = (sub?.planTier as PlanTier) ?? "local_solo";
      const plan = PLANS[tier];

      // Get enforcement status for active contacts
      const enforcementResult = await enforceLimit(wsId);

      return {
        plan: {
          tier,
          name: plan.name,
          limits: {
            activeContacts: plan.activeContactsLimit,
          },
        },
        billing: sub
          ? {
              status: sub.status,
              periodStart: sub.currentPeriodStart,
              periodEnd: sub.currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            }
          : null,
        usage: [enforcementResult],
        summary: {
          highestWarning: enforcementResult.warningLevel,
          atLimit: enforcementResult.warningLevel === "limit",
          nearLimit: enforcementResult.warningLevel === "warn",
        },
      };
    } catch (err) {
      logger.error("Failed to get usage analytics", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get usage analytics");
    }
  });
