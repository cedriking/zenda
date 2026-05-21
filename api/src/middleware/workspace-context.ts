import { db } from "@zenda/db/client";
import { workspaceMembers, workspaces } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";

/**
 * Type for Elysia route handler context that includes workspace-scoped auth.
 *
 * The actual values are injected by the auth middleware in the parent app.
 * Use `as AuthedContext` in route handler destructuring to satisfy TypeScript.
 */
export interface AuthedContext {
  userId: string;
  workspaceId: string;
}

// Workspace derivation with DB lookup (no macros)
export const workspaceBase = new Elysia({ name: "workspace-base" }).derive(
  async (ctx) => {
    // Values come from the parent app's auth middleware
    const { userId, workspaceId } = ctx as unknown as AuthedContext;

    if (!(userId && workspaceId)) {
      return { workspace: null };
    }

    // Verify user has access to this workspace
    const membership = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return { workspace: null };
    }

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return { workspace: workspace[0] ?? null };
  }
);

// Keep workspaceContext as alias
export const workspaceContext = workspaceBase;
