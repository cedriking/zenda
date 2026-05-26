import { db } from "@zenda/db/client";
import { businessProfiles, receptionistProfiles } from "@zenda/db/schema";
import {
  updateBusinessProfileSchema,
  updateReceptionistProfileSchema,
} from "@zenda/shared";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const businessModule = new Elysia({ prefix: "/business" })
  .use(typedContext)

  // Get business profile
  .get("/profile", async ({ workspaceId, set }) => {
    try {
      const [profile] = await db
        .select()
        .from(businessProfiles)
        .where(eq(businessProfiles.workspaceId, workspaceId!))
        .limit(1);
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

        const [updated] = await db
          .update(businessProfiles)
          .set({ ...parsed.data, updatedAt: new Date() })
          .where(eq(businessProfiles.workspaceId, workspaceId!))
          .returning();
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
    {
      body: t.Object({
        name: t.Optional(t.String()),
        category: t.Optional(t.String()),
        description: t.Optional(t.String()),
        location: t.Optional(t.String()),
        cancellationPolicy: t.Optional(t.String()),
        refundPolicy: t.Optional(t.String()),
        priceDisplayPreference: t.Optional(t.String()),
        minimumNoticeHours: t.Optional(t.Number()),
        maximumBookingWindowDays: t.Optional(t.Number()),
        staffAssignmentMode: t.Optional(t.String()),
        escalationBehavior: t.Optional(t.Object({})),
        ownerNotificationPreferences: t.Optional(t.Object({})),
      }),
    }
  )

  // Get receptionist profile
  .get("/receptionist", async ({ workspaceId, set }) => {
    try {
      const [profile] = await db
        .select()
        .from(receptionistProfiles)
        .where(eq(receptionistProfiles.workspaceId, workspaceId!))
        .limit(1);
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
        const [updated] = await db
          .update(receptionistProfiles)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(receptionistProfiles.workspaceId, workspaceId!))
          .returning();
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
    {
      body: t.Object({
        name: t.Optional(t.String()),
        tone: t.Optional(t.String()),
        greetingTemplate: t.Optional(t.String()),
        personalityPreset: t.Optional(t.String()),
        formalityLevel: t.Optional(t.Number()),
        concisenessLevel: t.Optional(t.Number()),
        warmthLevel: t.Optional(t.Number()),
        useEmoji: t.Optional(t.Boolean()),
        speaksAsBusiness: t.Optional(t.Boolean()),
        proactivelySuggestTimes: t.Optional(t.Boolean()),
        confirmsBeforeBooking: t.Optional(t.Boolean()),
        greetingStyle: t.Optional(t.String()),
      }),
    }
  );
