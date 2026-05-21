import { db } from "@zenda/db/client";
import { workspaces } from "@zenda/db/schema";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { notFound, serverError } from "../../utils/errors.js";

export const workspaceModule = new Elysia({ prefix: "/workspace" })
  .use(typedContext)
  .get("/", async ({ workspaceId, set }) => {
    try {
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId as string))
        .limit(1);
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
  .patch("/", async ({ workspaceId, body, set }) => {
    const wsId = workspaceId as string | null;
    const patchBody = body as Partial<typeof workspaces.$inferInsert>;
    try {
      if (!wsId) {
        return notFound(set, "Workspace not found");
      }
      const [updated] = await db
        .update(workspaces)
        .set({ ...patchBody, updatedAt: new Date() } as Partial<
          typeof workspaces.$inferInsert
        >)
        .where(eq(workspaces.id, wsId))
        .returning();
      if (!updated) {
        return notFound(set, "Workspace not found");
      }
      return updated;
    } catch (err) {
      logger.error("Failed to update workspace", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to update workspace");
    }
  });
