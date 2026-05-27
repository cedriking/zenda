import { db } from "@zenda/db/client";
import {
  createStaffMemberSchema,
  updateStaffMemberSchema,
} from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const staffModule = new Elysia({ prefix: "/staff" })
  .use(typedContext)

  .get("/", async ({ workspaceId, set }) => {
    try {
      return db.staffMember.findMany({
        where: { workspaceId: workspaceId! },
      });
    } catch (err) {
      logger.error("Failed to list staff", { error: (err as Error).message });
      return serverError(set, "Failed to list staff");
    }
  })

  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      try {
        const parsed = createStaffMemberSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const { name, serviceIds } = parsed.data;
        const member = await db.staffMember.create({
          data: {
            workspaceId: workspaceId!,
            name,
            serviceIds: serviceIds ?? [],
          },
        });
        return member;
      } catch (err) {
        logger.error("Failed to create staff member", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to create staff member");
      }
    },
    {
      body: t.Object({
        name: t.String(),
        serviceIds: t.Optional(t.Array(t.String())),
      }),
    }
  )

  .patch(
    "/:id",
    async ({ workspaceId, params, body, set }) => {
      try {
        const parsed = updateStaffMemberSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const updated = await db.staffMember.update({
          where: { id: params.id, workspaceId: workspaceId! },
          data: { ...parsed.data, updatedAt: new Date() },
        });
        return updated;
      } catch (err) {
        if ((err as any)?.code === "P2025") {
          return notFound(set, "Staff member not found");
        }
        logger.error("Failed to update staff member", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update staff member");
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        serviceIds: t.Optional(t.Array(t.String())),
        active: t.Optional(t.Boolean()),
      }),
    }
  )

  .delete("/:id", async ({ workspaceId, params, set }) => {
    try {
      await db.staffMember.delete({
        where: { id: params.id, workspaceId: workspaceId! },
      });
      return { deleted: true };
    } catch (err) {
      if ((err as any)?.code === "P2025") {
        return { deleted: false };
      }
      logger.error("Failed to delete staff member", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to delete staff member");
    }
  });
