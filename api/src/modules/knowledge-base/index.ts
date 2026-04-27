import { Elysia, t } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import {
  getKnowledgeBase,
  searchKnowledgeBase,
  createKnowledgeItem,
  deleteKnowledgeItem,
} from './service.js'

export const knowledgeBaseModule = new Elysia({ prefix: '/knowledge-base' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/', async ({ workspaceId }) => {
    return getKnowledgeBase(workspaceId!)
  })

  .get('/search', async ({ workspaceId, query }) => {
    const { q } = (query as Record<string, string>) ?? {}
    if (!q) return []
    return searchKnowledgeBase(workspaceId!, q)
  })

  .post('/', async ({ workspaceId, body }) => {
    const data = body as Record<string, string>
    return createKnowledgeItem(workspaceId!, {
      question: data.question,
      answer: data.answer,
      category: data.category,
    })
  }, {
    body: t.Object({
      question: t.String(),
      answer: t.String(),
      category: t.Optional(t.String()),
    }),
  })

  .delete('/:id', async ({ workspaceId, params }) => {
    return deleteKnowledgeItem(workspaceId!, params.id)
  })
