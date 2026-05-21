import { Elysia, t } from 'elysia'
import { getOnboardingStatus, advanceOnboarding } from './flow.js'
import { getNextOnboardingQuestion, processOnboardingResponse } from './conversation-handler.js'
import { logger } from '../../infra/logger.js'
import { serverError } from '../../utils/errors.js'

export const onboardingModule = new Elysia({ prefix: '/onboarding' })

  .get('/status', async ({ workspaceId, set }) => {
    try {
    return getOnboardingStatus(workspaceId!)
    } catch (err: any) {
      logger.error('Get onboarding status error', { workspaceId, error: err?.message })
      return serverError(set, 'Failed to get onboarding status')
    }
  })

  .get('/question', async ({ workspaceId, set }) => {
    try {
    return getNextOnboardingQuestion(workspaceId!)
    } catch (err: any) {
      logger.error('Get onboarding question error', { workspaceId, error: err?.message })
      return serverError(set, 'Failed to get onboarding question')
    }
  })

  .post('/advance', async ({ workspaceId, body, set }) => {
    const { completedStep } = body as { completedStep: string }
    try {
    const next = await advanceOnboarding(workspaceId!, completedStep as any)
    return { nextStep: next, progress: 100 }
    } catch (err: any) {
      logger.error('Advance onboarding error', { workspaceId, completedStep, error: err?.message })
      return serverError(set, 'Failed to advance onboarding')
    }
  }, {
    body: t.Object({
      completedStep: t.String(),
    }),
  })

  .post('/respond', async ({ workspaceId, body, set }) => {
    const { step, response } = body as { step: string; response: string }
    try {
    return await processOnboardingResponse(workspaceId!, step, response)
    } catch (err: any) {
      logger.error('Onboarding respond error', { step, response, error: err?.message, stack: err?.stack })
      return serverError(set, 'Failed to process onboarding response')
    }
  }, {
    body: t.Object({
      step: t.String(),
      response: t.String(),
    }),
  })
