import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { workspaces, workspaceMembers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'

// Workspace derivation only (no macros)
export const workspaceBase = new Elysia({ name: 'workspace-base' })
  .derive(async ({ userId, workspaceId }) => {
    if (!userId || !workspaceId) {
      return { workspace: null }
    }

    // Verify user has access to this workspace
    const membership = await db
      .select()
      .from(workspaceMembers)
      .where(and(
        eq(workspaceMembers.userId, userId),
        eq(workspaceMembers.workspaceId, workspaceId),
      ))
      .limit(1)

    if (membership.length === 0) {
      return { workspace: null }
    }

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)

    return { workspace: workspace[0] ?? null }
  })

// Keep workspaceContext as alias
export const workspaceContext = workspaceBase
