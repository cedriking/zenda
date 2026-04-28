import { Elysia } from 'elysia'
import { appPlugin } from '../../middleware/app-plugin.js'
import { getUsageForPeriod } from './tracker.js'

export const usageModule = new Elysia({ prefix: '/usage' })
  .use(appPlugin)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async ({ workspaceId }) => {
    return getUsageForPeriod(workspaceId!)
  })
