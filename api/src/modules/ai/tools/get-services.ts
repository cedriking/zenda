/**
 * Tool: get_services
 *
 * Safety constraints:
 * - All service data comes from the DB query filtered by workspaceId + active flag.
 * - Nothing is invented or hardcoded.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 */
import { db } from "@zenda/db/client";
import { services } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";

export async function getServices(workspaceId: string) {
  const list = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      durationMinutes: services.durationMinutes,
      priceCents: services.priceCents,
    })
    .from(services)
    .where(
      and(eq(services.workspaceId, workspaceId), eq(services.active, true))
    );

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
