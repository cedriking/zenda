import { Elysia } from 'elysia'
import { createAppPlugin } from '../../middleware/app-plugin.js'
import { getUsageForPeriod } from './tracker.js'

export const usageModule = new Elysia({ prefix: '/usage' })
  .use(createAppPlugin())

  .get('/', async ({ workspaceId }) => {
    return getUsageForPeriod(workspaceId!)
  })
