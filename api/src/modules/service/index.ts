import { db } from "@zenda/db/client";
import { createServiceSchema, updateServiceSchema } from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const serviceModule = new Elysia({ prefix: "/services" })
  .use(typedContext)

  .get("/", async ({ workspaceId, set }) => {
    try {
      return db.services.findMany({
        where: { workspaceId: workspaceId! },
      });
    } catch (err) {
      logger.error("Failed to list services", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list services");
    }
  })

  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      try {
        const parsed = createServiceSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const { name, description, durationMinutes, priceCents } = parsed.data;
        const svc = await db.services.create({
          data: {
            workspaceId: workspaceId!,
            name,
            description: description ?? null,
            durationMinutes,
            priceCents: priceCents ?? null,
          },
        });
        return svc;
      } catch (err) {
        logger.error("Failed to create service", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to create service");
      }
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        durationMinutes: t.Number(),
        priceCents: t.Optional(t.Number()),
      }),
    }
  )

  .patch(
    "/:id",
    async ({ workspaceId, params, body, set }) => {
      try {
        const parsed = updateServiceSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const updated = await db.services.update({
          where: { id: params.id, workspaceId: workspaceId! },
          data: { ...parsed.data, updatedAt: new Date() },
        });
        return updated;
      } catch (err) {
        if ((err as any)?.code === "P2025") {
          return notFound(set, "Service not found");
        }
        logger.error("Failed to update service", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update service");
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        durationMinutes: t.Optional(t.Number()),
        priceCents: t.Optional(t.Number()),
        active: t.Optional(t.Boolean()),
      }),
    }
  )

  .delete("/:id", async ({ workspaceId, params, set }) => {
    try {
      await db.services.delete({
        where: { id: params.id, workspaceId: workspaceId! },
      });
      return { deleted: true };
    } catch (err) {
      if ((err as any)?.code === "P2025") {
        return { deleted: false };
      }
      logger.error("Failed to delete service", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to delete service");
    }
  });
