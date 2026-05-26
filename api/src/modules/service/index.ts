import { db } from "@zenda/db/client";
import { services } from "@zenda/db/schema";
import { createServiceSchema, updateServiceSchema } from "@zenda/shared";
import { and, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const serviceModule = new Elysia({ prefix: "/services" })
  .use(typedContext)

  .get("/", async ({ workspaceId, set }) => {
    try {
      return db
        .select()
        .from(services)
        .where(eq(services.workspaceId, workspaceId!));
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
        const [svc] = await db
          .insert(services)
          .values({
            workspaceId: workspaceId!,
            name,
            description: description ?? null,
            durationMinutes,
            priceCents: priceCents ?? null,
          })
          .returning();
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

        const [updated] = await db
          .update(services)
          .set({ ...parsed.data, updatedAt: new Date() })
          .where(
            and(
              eq(services.id, params.id),
              eq(services.workspaceId, workspaceId!)
            )
          )
          .returning();
        if (!updated) {
          return notFound(set, "Service not found");
        }
        return updated;
      } catch (err) {
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
      const result = await db
        .delete(services)
        .where(
          and(
            eq(services.id, params.id),
            eq(services.workspaceId, workspaceId!)
          )
        )
        .returning();
      return { deleted: result.length > 0 };
    } catch (err) {
      logger.error("Failed to delete service", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to delete service");
    }
  });
