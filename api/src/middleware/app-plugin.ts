import { Elysia } from 'elysia'
import { authBase } from './auth.js'
import { workspaceBase } from './workspace-context.js'

/**
 * Combined plugin that provides both requireAuth and requireWorkspace macros.
 * Using a single .use(appPlugin) ensures macros persist across the chain.
 */
export const appPlugin = new Elysia({ name: 'app' })
  .use(authBase)
  .use(workspaceBase)
  .macro(({ onBeforeHandle }) => ({
    requireAuth(enabled: boolean) {
      if (!enabled) return
      onBeforeHandle(({ userId }) => {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    },
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
