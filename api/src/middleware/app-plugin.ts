import { Elysia } from 'elysia'
import { authBase } from './auth.js'
import { workspaceBase } from './workspace-context.js'

const unauthorizedRes = new Response(JSON.stringify({ error: 'Unauthorized' }), {
  status: 401,
  headers: { 'Content-Type': 'application/json' },
})

const forbiddenRes = new Response(JSON.stringify({ error: 'Workspace not found or access denied' }), {
  status: 403,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Combined plugin that provides auth, workspace context, and guards.
 * Using .use(appPlugin) on a module enables all auth/workspace checks.
 */
export const appPlugin = new Elysia({ name: 'app' })
  .use(authBase)
  .use(workspaceBase)
  .onBeforeHandle(({ userId }) => {
    if (!userId) return unauthorizedRes
  })
  .onBeforeHandle(({ workspace }) => {
    if (!workspace) return forbiddenRes
  })
