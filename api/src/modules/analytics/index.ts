import { Elysia } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { getAnalytics } from './service.js'

export const analyticsModule = new Elysia({ prefix: '/analytics' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async ({ workspaceId, query }) => {
    const { period } = (query as Record<string, string>) ?? {}
    const days = parseInt(period ?? '30')
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    return getAnalytics(workspaceId!, { start, end })
  })
