import { Elysia } from 'elysia'
import { getUsageForPeriod } from './tracker.js'

export const usageModule = new Elysia({ prefix: '/usage' })

  .get('/', async ({ workspaceId }) => {
    return getUsageForPeriod(workspaceId!)
  })
