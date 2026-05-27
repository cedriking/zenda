import { db, Prisma } from "@zenda/db/client";
import type { PlanTier } from "@zenda/shared";
import { PLANS, USAGE_WARNING_THRESHOLDS } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { createNotification } from "../notification/service.js";

export interface ActiveContactUsage {
  limit: number;
  percentage: number;
  used: number;
  warningLevel: "none" | "warn" | "limit";
}

/**
 * Track a unique active contact for the current billing period.
 * Only increments usage if this customerPhone hasn't been seen this period.
 *
 * Counts toward: active_appointment_contacts
 * Qualifying actions: book_appointment (confirmed), reschedule_appointment, confirm_appointment
 */
export async function trackActiveContact(
  workspaceId: string,
  customerPhone: string
): Promise<{ isNew: boolean; usage: ActiveContactUsage }> {
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

  // Try to insert dedup row — if it already exists, this is a no-op
  let isNew = false;
  try {
    await db.activeContactDedup.create({
      data: {
        workspaceId,
        customerPhone,
        periodStart,
        periodEnd,
        firstActionAt: now,
      },
    });
    isNew = true;
  } catch (err) {
    // Duplicate key — check for Prisma unique constraint error or raw PG error
    const pgErr = err as { code?: string } | undefined;
    if (
      pgErr?.code === "23505" ||
      (err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002")
    ) {
      isNew = false;
    } else {
      throw err;
    }
  }

  // Only increment the usage counter if this is a new contact
  if (isNew) {
    const existing = await db.usageRecord.findFirst({
      where: {
        workspaceId,
        metric: "active_appointment_contacts",
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    });

    if (existing) {
      await db.usageRecord.update({
        where: { id: existing.id },
        data: { value: existing.value + 1 },
      });
    } else {
      await db.usageRecord.create({
        data: {
          workspaceId,
          metric: "active_appointment_contacts",
          value: 1,
          periodStart,
          periodEnd,
        },
      });
    }
  }

  const usage = await getActiveContactUsage(workspaceId);

  // Dispatch notification on threshold crossing
  if (isNew) {
    await dispatchUsageNotification(workspaceId, usage);
  }

  return { isNew, usage };
}

/**
 * Get current active contact usage for a workspace.
 */
export async function getActiveContactUsage(
  workspaceId: string
): Promise<ActiveContactUsage> {
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

  // Get current plan
  const sub = await db.subscription.findFirst({
    where: { workspaceId },
  });

  const tier: PlanTier =
    sub?.status === "active" || sub?.status === "trialing"
      ? (sub.planTier as PlanTier)
      : "local_solo";
  const planConfig = PLANS[tier];
  const limit = planConfig.activeContactsLimit;

  // Get current usage
  const record = await db.usageRecord.findFirst({
    where: {
      workspaceId,
      metric: "active_appointment_contacts",
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
  });

  const used = record?.value ?? 0;
  const percentage = limit > 0 ? used / limit : 0;

  let warningLevel: ActiveContactUsage["warningLevel"] = "none";
  if (percentage >= USAGE_WARNING_THRESHOLDS.limit) {
    warningLevel = "limit";
  } else if (percentage >= USAGE_WARNING_THRESHOLDS.warn) {
    warningLevel = "warn";
  }

  return { used, limit, percentage, warningLevel };
}

/**
 * Returns true when proactive automations should be restricted.
 * At >=100% of active contact limit, only inbound messages remain active.
 * No overage fees — just suppress proactive sending.
 */
export async function shouldRestrictProactive(
  workspaceId: string
): Promise<boolean> {
  const usage = await getActiveContactUsage(workspaceId);
  return usage.percentage >= USAGE_WARNING_THRESHOLDS.limit;
}

/**
 * Get usage data for a billing period (kept for backward compatibility).
 */
export async function getUsageForPeriod(
  workspaceId: string
): Promise<ActiveContactUsage & { metric: string }> {
  const usage = await getActiveContactUsage(workspaceId);
  return { ...usage, metric: "active_appointment_contacts" };
}

/**
 * Dispatch usage notification at warning (80%) and limit (100%) thresholds.
 */
async function dispatchUsageNotification(
  workspaceId: string,
  usage: ActiveContactUsage
): Promise<void> {
  const pct = Math.round(usage.percentage * 100);

  try {
    if (usage.warningLevel === "limit") {
      await createNotification({
        workspaceId,
        type: "usage_limit",
        title: "Active contact limit reached",
        body: `You've reached ${usage.used} of ${usage.limit} active contacts this month (${pct}%). Proactive automations (reminders, follow-ups) are paused. Inbound messages still work. Upgrade your plan for more contacts.`,
      });
    } else if (usage.warningLevel === "warn") {
      await createNotification({
        workspaceId,
        type: "usage_warning",
        title: `Active contact usage at ${pct}%`,
        body: `You've used ${usage.used} of ${usage.limit} active appointment contacts this month. Consider upgrading to avoid hitting your limit.`,
      });
    }
  } catch (err) {
    logger.error("Failed to send usage notification", {
      workspaceId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Check if a workspace can still accept new active contacts.
 * Used by appointment tools to gate bookings.
 */
export async function checkActiveContactLimit(
  workspaceId: string
): Promise<{ allowed: boolean; usage: ActiveContactUsage }> {
  const usage = await getActiveContactUsage(workspaceId);
  return {
    allowed: usage.percentage < USAGE_WARNING_THRESHOLDS.limit,
    usage,
  };
}
