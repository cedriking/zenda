import { db } from "@zenda/db/client";
import { createAvailabilityRuleSchema } from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const availabilityModule = new Elysia({ prefix: "/availability" })
  .use(typedContext)

  .get("/", async ({ workspaceId, query, set }) => {
    try {
      const { staffMemberId } = query as Record<string, string>;
      const where: Record<string, unknown> = { workspaceId: workspaceId! };
      if (staffMemberId) {
        where.staffMemberId = staffMemberId;
      }

      return db.availabilityRule.findMany({ where });
    } catch (err) {
      logger.error("Failed to list availability rules", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list availability rules");
    }
  })

  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      try {
        const parsed = createAvailabilityRuleSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const { staffMemberId, dayOfWeek, startTime, endTime, available } =
          parsed.data;
        const rule = await db.availabilityRule.create({
          data: {
            workspaceId: workspaceId!,
            staffMemberId: staffMemberId ?? null,
            dayOfWeek,
            startTime,
            endTime,
            available: available ?? true,
          },
        });
        return rule;
      } catch (err) {
        logger.error("Failed to create availability rule", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to create availability rule");
      }
    },
    {
      body: t.Object({
        staffMemberId: t.Optional(t.String()),
        dayOfWeek: t.Number(),
        startTime: t.String(),
        endTime: t.String(),
        available: t.Optional(t.Boolean()),
      }),
    }
  )

  .patch(
    "/:id",
    async ({ workspaceId, params, body, set }) => {
      try {
        const data = body as Record<string, unknown>;
        const updated = await db.availabilityRule.update({
          where: { id: params.id, workspaceId: workspaceId! },
          data: { ...data, updatedAt: new Date() },
        });
        return updated;
      } catch (err) {
        if ((err as any)?.code === "P2025") {
          return notFound(set, "Availability rule not found");
        }
        logger.error("Failed to update availability rule", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update availability rule");
      }
    },
    {
      body: t.Object({
        dayOfWeek: t.Optional(t.Number()),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        available: t.Optional(t.Boolean()),
      }),
    }
  )

  .delete("/:id", async ({ workspaceId, params, set }) => {
    try {
      await db.availabilityRule.delete({
        where: { id: params.id, workspaceId: workspaceId! },
      });
      return { deleted: true };
    } catch (err) {
      if ((err as any)?.code === "P2025") {
        return { deleted: false };
      }
      logger.error("Failed to delete availability rule", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to delete availability rule");
    }
  });
