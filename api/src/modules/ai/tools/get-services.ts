/**
 * Tool: get_services
 *
 * Safety constraints:
 * - All service data comes from the DB query filtered by workspaceId + active flag.
 * - Nothing is invented or hardcoded.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 */
import { db } from "@zenda/db/client";

export async function getServices(workspaceId: string) {
  const list = await db.services.findMany({
    where: {
      workspaceId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      durationMinutes: true,
      priceCents: true,
    },
  });

  return list;
}

export const getServicesToolDef = {
  type: "function" as const,
  function: {
    name: "get_services",
    description: "Get list of all active services offered by the business.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
