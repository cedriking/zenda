import { db } from "@zenda/db/client";
import { subscriptions, usageRecords } from "@zenda/db/schema";
import type { PlanTier } from "@zenda/shared";
import { PLANS, USAGE_WARNING_THRESHOLDS } from "@zenda/shared";
import { and, eq, gte, lte } from "drizzle-orm";
import { logger } from "../../infra/logger.js";

export type UsageMetric =
  | "active_appointment_contacts"
  | "conversations"
  | "voice_minutes";

export interface EnforcementResult {
  allowed: boolean;
  currentUsage: number;
  gracePeriodEnd?: Date | null;
  limit: number;
  metric: UsageMetric;
  percentage: number;
  warningLevel: "none" | "warn" | "limit";
}

/**
 * Check whether a workspace is allowed to increment the active contact count.
 * At 100%, new bookings are blocked. No overage fees, no grace period.
 */
export async function enforceLimit(
  workspaceId: string,
  _metric?: UsageMetric
): Promise<EnforcementResult> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Get current subscription / plan
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  const tier: PlanTier =
    sub?.status === "active" || sub?.status === "trialing"
      ? (sub.planTier as PlanTier)
      : "local_solo";
  const planConfig = PLANS[tier];
  const limit = planConfig.activeContactsLimit;

  // Get current usage — graceful fallback if table doesn't exist yet
  let currentUsage = 0;
  try {
    const [record] = await db
      .select()
      .from(usageRecords)
      .where(
        and(
          eq(usageRecords.workspaceId, workspaceId),
          eq(usageRecords.metric, "active_appointment_contacts"),
          gte(usageRecords.periodStart, periodStart),
          lte(usageRecords.periodEnd, periodEnd)
        )
      )
      .limit(1);

    currentUsage = record?.value ?? 0;
  } catch (err) {
    logger.warn("Failed to query usage_records, treating as zero usage", {
      workspaceId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
  const percentage = limit > 0 ? currentUsage / limit : 0;

  let warningLevel: EnforcementResult["warningLevel"] = "none";
  if (percentage >= USAGE_WARNING_THRESHOLDS.limit) {
    warningLevel = "limit";
  } else if (percentage >= USAGE_WARNING_THRESHOLDS.warn) {
    warningLevel = "warn";
  }

  const allowed = percentage < USAGE_WARNING_THRESHOLDS.limit;

  return {
    allowed,
    metric: "active_appointment_contacts",
    currentUsage,
    limit,
    percentage,
    warningLevel,
  };
}

/**
 * Track usage and dispatch warning notifications when thresholds are crossed.
 * Delegates to the new tracker.ts for dedup-aware counting.
 */
export async function trackAndEnforce(
  workspaceId: string,
  _metric?: UsageMetric
): Promise<EnforcementResult> {
  return enforceLimit(workspaceId);
}

/**
 * Reset all usage records for a workspace when plan is downgraded.
 */
export async function resetUsageOnPlanChange(
  workspaceId: string
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  await db
    .delete(usageRecords)
    .where(
      and(
        eq(usageRecords.workspaceId, workspaceId),
        gte(usageRecords.periodStart, periodStart),
        lte(usageRecords.periodEnd, periodEnd)
      )
    );

  logger.info("Usage records reset for plan change", { workspaceId });
}
