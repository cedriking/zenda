import { Elysia } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { getUsageForPeriod } from './tracker.js'

export const usageModule = new Elysia({ prefix: '/usage' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async ({ workspaceId }) => {
    return getUsageForPeriod(workspaceId!)
  })
