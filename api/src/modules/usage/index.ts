import { Elysia } from 'elysia'
import { getUsageForPeriod } from './tracker.js'
import { logger } from '../../infra/logger.js'
import { serverError } from '../../utils/errors.js'

export const usageModule = new Elysia({ prefix: '/usage' })

  .get('/', async ({ workspaceId, set }) => {
    try {
      return await getUsageForPeriod(workspaceId!)
    } catch (err) {
      logger.error('Failed to get usage', { error: (err as Error).message })
      return serverError(set, 'Failed to get usage')
    }
  })
