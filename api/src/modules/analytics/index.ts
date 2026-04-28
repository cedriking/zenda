import { Elysia } from 'elysia'
import { appPlugin } from '../../middleware/app-plugin.js'
import { getAnalytics } from './service.js'

export const analyticsModule = new Elysia({ prefix: '/analytics' })
  .use(appPlugin)

  .get('/', async ({ workspaceId, query }) => {
    const { period } = (query as Record<string, string>) ?? {}
    const days = parseInt(period ?? '30')
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    return getAnalytics(workspaceId!, { start, end })
  })
