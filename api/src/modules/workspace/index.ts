import { db } from "@zenda/db/client";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { notFound, serverError } from "../../utils/errors.js";

// Fields that are safe to update via PATCH
const ALLOWED_PATCH_FIELDS = [
  "name",
  "defaultLanguage",
  "timezone",
  "country",
  "onboardingStep",
  "slug",
] as const;

export const workspaceModule = new Elysia({ prefix: "/workspace" })
  .use(typedContext)
  .get("/", async ({ workspaceId, set }) => {
    try {
      const ws = await db.workspace.findUnique({
        where: { id: workspaceId as string },
      });
      if (!ws) {
        return notFound(set, "Workspace not found");
      }
      return ws;
    } catch (err) {
      logger.error("Failed to get workspace", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get workspace");
    }
  })
  .patch(
    "/",
    async ({ workspaceId, body, set }) => {
      const wsId = workspaceId as string | null;
      const patchBody = body as Record<string, unknown>;
      try {
        if (!wsId) {
          return notFound(set, "Workspace not found");
        }

        // Whitelist only allowed fields to prevent mass assignment
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of ALLOWED_PATCH_FIELDS) {
          if (field in patchBody) {
            updateData[field] = patchBody[field];
          }
        }

        const updated = await db.workspace.update({
          where: { id: wsId },
          data: updateData as Parameters<typeof db.workspace.update>[0]["data"],
        });
        return updated;
      } catch (err) {
        if ((err as any)?.code === "P2025") {
          return notFound(set, "Workspace not found");
        }
        logger.error("Failed to update workspace", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update workspace");
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        defaultLanguage: t.Optional(t.String()),
        timezone: t.Optional(t.String()),
        country: t.Optional(t.String()),
        onboardingStep: t.Optional(t.String()),
        slug: t.Optional(t.String()),
      }),
    }
  );
