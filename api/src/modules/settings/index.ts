import { db } from "@zenda/db/client";
import {
  businessProfiles,
  escalations,
  messagingConsent,
  receptionistProfiles,
  systemSettings,
} from "@zenda/db/schema";
import { desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { notFound, serverError } from "../../utils/errors.js";

// ── Helper: get/set workspace-scoped settings from system_settings ──
async function getWorkspaceSetting(
  workspaceId: string,
  key: string
): Promise<string | null> {
  const [row] = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, `ws:${workspaceId}:${key}`))
    .limit(1);
  return row?.value ?? null;
}

async function setWorkspaceSetting(
  workspaceId: string,
  key: string,
  value: string
): Promise<void> {
  await db
    .insert(systemSettings)
    .values({ key: `ws:${workspaceId}:${key}`, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

export const settingsModule = new Elysia({ prefix: "/settings" })
  .use(typedContext)

  // ── Receptionist settings ────────────────────────────────────────
  .get("/receptionist", async ({ workspaceId, set }) => {
    try {
      const [profile] = await db
        .select({
          personalityPreset: receptionistProfiles.personalityPreset,
          formalityLevel: receptionistProfiles.formalityLevel,
          concisenessLevel: receptionistProfiles.concisenessLevel,
          warmthLevel: receptionistProfiles.warmthLevel,
          useEmoji: receptionistProfiles.useEmoji,
          speaksAsBusiness: receptionistProfiles.speaksAsBusiness,
          proactivelySuggestTimes: receptionistProfiles.proactivelySuggestTimes,
          confirmsBeforeBooking: receptionistProfiles.confirmsBeforeBooking,
          greetingStyle: receptionistProfiles.greetingStyle,
        })
        .from(receptionistProfiles)
        .where(eq(receptionistProfiles.workspaceId, workspaceId!))
        .limit(1);
      if (!profile) {
        return notFound(set, "Receptionist profile not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get receptionist settings", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get receptionist settings");
    }
  })

  .patch(
    "/receptionist",
    async ({ workspaceId, body, set }) => {
      try {
        const data = body as Record<string, unknown>;
        // Explicitly pick only allowed fields to prevent mass assignment
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        const allowedFields = [
          "personalityPreset",
          "formalityLevel",
          "concisenessLevel",
          "warmthLevel",
          "useEmoji",
          "speaksAsBusiness",
          "proactivelySuggestTimes",
          "confirmsBeforeBooking",
          "greetingStyle",
        ] as const;
        for (const field of allowedFields) {
          if (field in data) {
            updateData[field] = data[field];
          }
        }
        const [updated] = await db
          .update(receptionistProfiles)
          .set(updateData)
          .where(eq(receptionistProfiles.workspaceId, workspaceId!))
          .returning();
        if (!updated) {
          return notFound(set, "Receptionist profile not found");
        }
        return {
          personalityPreset: updated.personalityPreset,
          formalityLevel: updated.formalityLevel,
          concisenessLevel: updated.concisenessLevel,
          warmthLevel: updated.warmthLevel,
          useEmoji: updated.useEmoji,
          speaksAsBusiness: updated.speaksAsBusiness,
          proactivelySuggestTimes: updated.proactivelySuggestTimes,
          confirmsBeforeBooking: updated.confirmsBeforeBooking,
          greetingStyle: updated.greetingStyle,
        };
      } catch (err) {
        logger.error("Failed to update receptionist settings", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update receptionist settings");
      }
    },
    {
      body: t.Object({
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
  )

  // ── Appointment settings ─────────────────────────────────────────
  .get("/appointments", async ({ workspaceId, set }) => {
    try {
      const [profile] = await db
        .select({
          cancellationWindowHours: businessProfiles.cancellationWindowHours,
          reschedulingWindowHours: businessProfiles.reschedulingWindowHours,
          cancellationPolicyStrictness:
            receptionistProfiles.cancellationPolicyStrictness,
          depositRequired: businessProfiles.depositRequired,
          depositAmountCents: businessProfiles.depositAmountCents,
          approvedCancellationText: businessProfiles.approvedCancellationText,
          approvedRefundText: businessProfiles.approvedRefundText,
        })
        .from(businessProfiles)
        .leftJoin(
          receptionistProfiles,
          eq(receptionistProfiles.workspaceId, businessProfiles.workspaceId)
        )
        .where(eq(businessProfiles.workspaceId, workspaceId!))
        .limit(1);
      if (!profile) {
        return notFound(set, "Business profile not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get appointment settings", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get appointment settings");
    }
  })

  .patch(
    "/appointments",
    async ({ workspaceId, body, set }) => {
      try {
        const data = body as Record<string, unknown>;

        // Split fields between business_profiles and receptionist_profiles
        const businessFields: Record<string, unknown> = {};
        const receptionistFields: Record<string, unknown> = {};

        if ("cancellationWindowHours" in data) {
          businessFields.cancellationWindowHours = data.cancellationWindowHours;
        }
        if ("reschedulingWindowHours" in data) {
          businessFields.reschedulingWindowHours = data.reschedulingWindowHours;
        }
        if ("depositRequired" in data) {
          businessFields.depositRequired = data.depositRequired;
        }
        if ("depositAmountCents" in data) {
          businessFields.depositAmountCents = data.depositAmountCents;
        }
        if ("approvedCancellationText" in data) {
          businessFields.approvedCancellationText =
            data.approvedCancellationText;
        }
        if ("approvedRefundText" in data) {
          businessFields.approvedRefundText = data.approvedRefundText;
        }
        if ("cancellationPolicyStrictness" in data) {
          receptionistFields.cancellationPolicyStrictness =
            data.cancellationPolicyStrictness;
        }

        let result: Record<string, unknown> = {};

        if (Object.keys(businessFields).length > 0) {
          const [updated] = await db
            .update(businessProfiles)
            .set({ ...businessFields, updatedAt: new Date() })
            .where(eq(businessProfiles.workspaceId, workspaceId!))
            .returning();
          if (!updated) {
            return notFound(set, "Business profile not found");
          }
          result = { ...result, ...businessFields };
        }

        if (Object.keys(receptionistFields).length > 0) {
          await db
            .update(receptionistProfiles)
            .set({ ...receptionistFields, updatedAt: new Date() })
            .where(eq(receptionistProfiles.workspaceId, workspaceId!));
          result = { ...result, ...receptionistFields };
        }

        return result;
      } catch (err) {
        logger.error("Failed to update appointment settings", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update appointment settings");
      }
    },
    {
      body: t.Object({
        cancellationWindowHours: t.Optional(t.Number()),
        reschedulingWindowHours: t.Optional(t.Number()),
        cancellationPolicyStrictness: t.Optional(t.String()),
        depositRequired: t.Optional(t.Boolean()),
        depositAmountCents: t.Optional(t.Number()),
        approvedCancellationText: t.Optional(t.String()),
        approvedRefundText: t.Optional(t.String()),
      }),
    }
  )

  // ── Safety settings ──────────────────────────────────────────────
  .get("/safety", async ({ workspaceId, set }) => {
    try {
      const [profile] = await db
        .select({
          sensitiveTopics: businessProfiles.sensitiveTopics,
          emergencyEscalationInstructions:
            businessProfiles.emergencyEscalationInstructions,
        })
        .from(businessProfiles)
        .where(eq(businessProfiles.workspaceId, workspaceId!))
        .limit(1);
      if (!profile) {
        return notFound(set, "Business profile not found");
      }
      return profile;
    } catch (err) {
      logger.error("Failed to get safety settings", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get safety settings");
    }
  })

  .patch(
    "/safety",
    async ({ workspaceId, body, set }) => {
      try {
        const data = body as Record<string, unknown>;

        // sensitiveTopics comes as string from client, convert to array if needed
        if (typeof data.sensitiveTopics === "string") {
          data.sensitiveTopics = (data.sensitiveTopics as string)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }

        const [updated] = await db
          .update(businessProfiles)
          .set({
            sensitiveTopics: data.sensitiveTopics as string[] | undefined,
            emergencyEscalationInstructions:
              data.emergencyEscalationInstructions as string | undefined,
            updatedAt: new Date(),
          })
          .where(eq(businessProfiles.workspaceId, workspaceId!))
          .returning({
            sensitiveTopics: businessProfiles.sensitiveTopics,
            emergencyEscalationInstructions:
              businessProfiles.emergencyEscalationInstructions,
          });
        if (!updated) {
          return notFound(set, "Business profile not found");
        }
        return updated;
      } catch (err) {
        logger.error("Failed to update safety settings", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update safety settings");
      }
    },
    {
      body: t.Object({
        sensitiveTopics: t.Optional(t.String()),
        emergencyEscalationInstructions: t.Optional(t.String()),
      }),
    }
  )

  .get("/safety/escalations", async ({ workspaceId, query, set }) => {
    try {
      const { limit = "50", offset = "0" } = query as Record<string, string>;
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      const parsedOffset = Math.max(0, Number(offset) || 0);

      return db
        .select({
          id: escalations.id,
          reason: escalations.reason,
          status: escalations.status,
          escalatedAt: escalations.createdAt,
          resolvedAt: escalations.resolvedAt,
        })
        .from(escalations)
        .where(eq(escalations.workspaceId, workspaceId!))
        .orderBy(desc(escalations.createdAt))
        .limit(parsedLimit)
        .offset(parsedOffset);
    } catch (err) {
      logger.error("Failed to get escalations", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get escalations");
    }
  })

  // ── Messaging settings ───────────────────────────────────────────
  .get("/messaging", async ({ workspaceId, set }) => {
    try {
      const [maxOutbound, maxReminders] = await Promise.all([
        getWorkspaceSetting(workspaceId!, "maxOutboundWithoutReply"),
        getWorkspaceSetting(workspaceId!, "maxRemindersPerAppointment"),
      ]);
      return {
        maxOutboundWithoutReply: maxOutbound ? Number(maxOutbound) : 5,
        maxRemindersPerAppointment: maxReminders ? Number(maxReminders) : 2,
      };
    } catch (err) {
      logger.error("Failed to get messaging settings", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get messaging settings");
    }
  })

  .patch(
    "/messaging",
    async ({ workspaceId, body, set }) => {
      try {
        const data = body as Record<string, unknown>;
        if ("maxOutboundWithoutReply" in data) {
          await setWorkspaceSetting(
            workspaceId!,
            "maxOutboundWithoutReply",
            String(data.maxOutboundWithoutReply)
          );
        }
        if ("maxRemindersPerAppointment" in data) {
          await setWorkspaceSetting(
            workspaceId!,
            "maxRemindersPerAppointment",
            String(data.maxRemindersPerAppointment)
          );
        }
        return {
          maxOutboundWithoutReply: Number(
            data.maxOutboundWithoutReply ??
              (await getWorkspaceSetting(
                workspaceId!,
                "maxOutboundWithoutReply"
              )) ??
              5
          ),
          maxRemindersPerAppointment: Number(
            data.maxRemindersPerAppointment ??
              (await getWorkspaceSetting(
                workspaceId!,
                "maxRemindersPerAppointment"
              )) ??
              2
          ),
        };
      } catch (err) {
        logger.error("Failed to update messaging settings", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update messaging settings");
      }
    },
    {
      body: t.Object({
        maxOutboundWithoutReply: t.Optional(t.Number()),
        maxRemindersPerAppointment: t.Optional(t.Number()),
      }),
    }
  )

  .get("/messaging/consent", async ({ workspaceId, query, set }) => {
    try {
      const { limit = "50", offset = "0" } = query as Record<string, string>;
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      const parsedOffset = Math.max(0, Number(offset) || 0);

      return db
        .select({
          id: messagingConsent.id,
          customerPhone: messagingConsent.phoneNumber,
          status: messagingConsent.status,
          consentedAt: messagingConsent.capturedAt,
        })
        .from(messagingConsent)
        .where(eq(messagingConsent.workspaceId, workspaceId!))
        .orderBy(desc(messagingConsent.updatedAt))
        .limit(parsedLimit)
        .offset(parsedOffset);
    } catch (err) {
      logger.error("Failed to get messaging consent", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get messaging consent");
    }
  });
