/**
 * Tool: get_business_info
 *
 * Safety constraints:
 * - All business info comes from the DB query filtered by workspaceId.
 * - Business hours are derived from actual availability_rules rows, not hardcoded.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 */
import { db } from "@zenda/db/client";

export async function getBusinessInfo(workspaceId: string) {
  const biz = await db.businessProfile.findFirst({
    where: { workspaceId },
  });

  if (!biz) {
    throw new Error("Business profile not found");
  }

  // Get availability rules for business hours
  const rules = await db.availabilityRule.findMany({
    where: { workspaceId },
  });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const hours = rules
    .filter((r) => r.available)
    .map((r) => `${dayNames[r.dayOfWeek]}: ${r.startTime} - ${r.endTime}`);

  return {
    name: biz.name,
    category: biz.category,
    description: biz.description,
    location: biz.location,
    cancellationPolicy: biz.cancellationPolicy,
    refundPolicy: biz.refundPolicy,
    businessHours: hours,
  };
}

export const getBusinessInfoToolDef = {
  type: "function" as const,
  function: {
    name: "get_business_info",
    description:
      "Get business information including hours, location, and policies.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
