import { db } from "@zenda/db/client";
import {
  updateBusinessProfileSchema,
  updateReceptionistProfileSchema,
} from "@zenda/shared";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const businessModule = new Elysia({ prefix: "/business" })
  .use(typedContext)

  // Get business profile
  .get("/profile", async ({ workspaceId, set }) => {
    try {
      const profile = await db.businessProfile.findFirst({
        where: { workspaceId: workspaceId! },
      });
      if (!profile) {
        return notFound(set, "Business profile not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get business profile", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get business profile");
    }
  })

  // Update business profile
  .patch(
    "/profile",
    async ({ workspaceId, body, set }) => {
      try {
        const parsed = updateBusinessProfileSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        const updated = await db.businessProfile.update({
          where: { workspaceId: workspaceId! },
          data: { ...parsed.data, updatedAt: new Date() },
        });
        if (!updated) {
          return notFound(set, "Business profile not found");
        }
        return updated;
      } catch (err) {
        logger.error("Failed to update business profile", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update business profile");
      }
    },
  // No Elysia body schema — Zod handles validation (Elysia t.Object rejects
  // extra fields that the frontend round-trips from GET, causing 422 errors)
  )

  // Get receptionist profile
  .get("/receptionist", async ({ workspaceId, set }) => {
    try {
      const profile = await db.receptionistProfile.findFirst({
        where: { workspaceId: workspaceId! },
      });
      if (!profile) {
        return notFound(set, "Receptionist profile not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get receptionist profile", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get receptionist profile");
    }
  })

  // Update receptionist profile
  .patch(
    "/receptionist",
    async ({ workspaceId, body, set }) => {
      try {
        const parsed = updateReceptionistProfileSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`
          );
        }

        // Pass through all validated data plus any extra fields the schema allows through
        const data = parsed.data;
        const updated = await db.receptionistProfile.update({
          where: { workspaceId: workspaceId! },
          data: { ...data, updatedAt: new Date() },
        });
        if (!updated) {
          return notFound(set, "Receptionist profile not found");
        }
        return updated;
      } catch (err) {
        logger.error("Failed to update receptionist profile", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update receptionist profile");
      }
    },
  // No Elysia body schema — Zod handles validation (Elysia t.Object rejects
  // extra fields that the frontend round-trips from GET, causing 422 errors)
  );
