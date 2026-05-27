import { db } from "@zenda/db/client";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { notFound, serverError } from "../../utils/errors.js";
import { getCustomerProfile } from "./customer-profile.js";

export const customerModule = new Elysia({ prefix: "/customers" })
  .use(typedContext)

  .get("/", async ({ workspaceId, set }) => {
    try {
      return await db.customer.findMany({
        where: { workspaceId: workspaceId! },
      });
    } catch (err) {
      logger.error("Failed to list customers", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list customers");
    }
  })

  .get("/:id", async ({ workspaceId, params, set }) => {
    try {
      const profile = await getCustomerProfile(workspaceId!, params.id);
      if (!profile) {
        return notFound(set, "Customer not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get customer", { error: (err as Error).message });
      return serverError(set, "Failed to get customer");
    }
  })

  .patch(
    "/:id",
    async ({ workspaceId, params, body, set }) => {
      try {
        const data = body as Record<string, unknown>;
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if ("name" in data) {
          updateData.name = data.name;
        }
        if ("language" in data) {
          updateData.language = data.language;
        }
        const updated = await db.customer.update({
          where: { id: params.id },
          data: updateData,
        });
        if (!updated || updated.workspaceId !== workspaceId) {
          return notFound(set, "Customer not found");
        }
        return updated;
      } catch (err) {
        logger.error("Failed to update customer", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update customer");
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        language: t.Optional(t.String()),
      }),
    }
  );
