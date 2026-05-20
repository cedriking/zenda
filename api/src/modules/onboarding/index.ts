import { Elysia, t } from 'elysia'
import { getOnboardingStatus, advanceOnboarding } from './flow.js'
import { getNextOnboardingQuestion, processOnboardingResponse } from './conversation-handler.js'
import { logger } from '../../infra/logger.js'

export const onboardingModule = new Elysia({ prefix: '/onboarding' })

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
    try {
      return await processOnboardingResponse(workspaceId!, step, response)
    } catch (err: any) {
      logger.error('Onboarding respond error', { step, response, error: err?.message, stack: err?.stack })
      throw err
    }
  }, {
    body: t.Object({
      step: t.String(),
      response: t.String(),
    }),
  })
