import { Elysia } from 'elysia'
import { db } from '@zenda/db/client'
import { workspaces, workspaceMembers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'

export const workspaceContext = new Elysia({ name: 'workspace' })
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
  .macro(({ onBeforeHandle }) => ({
    requireWorkspace(enabled: boolean) {
      if (!enabled) return
      onBeforeHandle(({ workspace }) => {
        if (!workspace) {
          return new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    },
  }))
