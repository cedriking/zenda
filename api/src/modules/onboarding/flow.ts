import { db } from '@zenda/db/client'
import { workspaces } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import type { OnboardingStep } from '@zenda/shared'

const STEP_ORDER: OnboardingStep[] = [
  'not_started',
  'whatsapp_connected',
  'business_info',
  'services',
  'availability',
  'policies',
  'receptionist_config',
  'ready',
]

export function getNextStep(current: OnboardingStep): OnboardingStep | null {
  const idx = STEP_ORDER.indexOf(current)
  if (idx === -1 || idx >= STEP_ORDER.length - 1) return null
  return STEP_ORDER[idx + 1]
}

export function getProgress(current: OnboardingStep): number {
  const idx = STEP_ORDER.indexOf(current)
  if (idx === -1) return 0
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100)
}

export async function advanceOnboarding(
  workspaceId: string,
  completedStep: OnboardingStep,
): Promise<OnboardingStep> {
  const next = getNextStep(completedStep)
  if (!next) return 'ready'

  await db
    .update(workspaces)
    .set({ onboardingStep: next, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId))

  return next
}

export async function getOnboardingStatus(workspaceId: string) {
  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  const current = (ws?.onboardingStep as OnboardingStep) ?? 'not_started'
  return {
    currentStep: current,
    progress: getProgress(current),
    steps: STEP_ORDER,
    nextStep: getNextStep(current),
  }
}
