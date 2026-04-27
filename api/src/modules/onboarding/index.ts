import { Elysia, t } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { getOnboardingStatus, advanceOnboarding } from './flow.js'
import { getNextOnboardingQuestion, processOnboardingResponse } from './conversation-handler.js'

export const onboardingModule = new Elysia({ prefix: '/onboarding' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  .get('/status', async ({ workspaceId }) => {
    return getOnboardingStatus(workspaceId!)
  })

  .get('/question', async ({ workspaceId }) => {
    return getNextOnboardingQuestion(workspaceId!)
  })

  .post('/advance', async ({ workspaceId, body }) => {
    const { completedStep } = body as { completedStep: string }
    const next = await advanceOnboarding(workspaceId!, completedStep as any)
    return { nextStep: next, progress: 100 }
  }, {
    body: t.Object({
      completedStep: t.String(),
    }),
  })

  .post('/respond', async ({ workspaceId, body }) => {
    const { step, response } = body as { step: string; response: string }
    return processOnboardingResponse(workspaceId!, step, response)
  }, {
    body: t.Object({
      step: t.String(),
      response: t.String(),
    }),
  })
