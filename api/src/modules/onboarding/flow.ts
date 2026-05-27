import { db } from "@zenda/db/client";
import type { OnboardingStep } from "@zenda/shared";

const STEP_ORDER: OnboardingStep[] = [
  "not_started",
  "whatsapp_connected",
  "business_info",
  "services",
  "availability",
  "policies",
  "receptionist_config",
  "plan_selection",
  "ready",
];

export function getNextStep(current: OnboardingStep): OnboardingStep | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1 || idx >= STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[idx + 1];
}

export function getProgress(current: OnboardingStep): number {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1) {
    return 0;
  }
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
}

export class OnboardingStepMismatchError extends Error {
  constructor(
    public readonly expected: OnboardingStep,
    public readonly actual: OnboardingStep
  ) {
    super(
      `Onboarding step mismatch: expected ${expected}, but workspace is at ${actual}`
    );
    this.name = "OnboardingStepMismatchError";
  }
}

export async function advanceOnboarding(
  workspaceId: string,
  completedStep: OnboardingStep
): Promise<OnboardingStep> {
  const next = getNextStep(completedStep);
  if (!next) {
    return "ready";
  }

  const result = await db.workspace.updateMany({
    where: { id: workspaceId, onboardingStep: completedStep },
    data: { onboardingStep: next, updatedAt: new Date() },
  });

  if (result.count === 0) {
    // Step didn't match — fetch current to report the mismatch
    const ws = await db.workspace.findFirst({
      where: { id: workspaceId },
      select: { onboardingStep: true },
    });

    const currentStep = (ws?.onboardingStep as OnboardingStep) ?? "not_started";
    throw new OnboardingStepMismatchError(completedStep, currentStep);
  }

  return next;
}

export async function getOnboardingStatus(workspaceId: string) {
  const ws = await db.workspace.findFirst({
    where: { id: workspaceId },
  });

  const current = (ws?.onboardingStep as OnboardingStep) ?? "not_started";
  return {
    currentStep: current,
    progress: getProgress(current),
    steps: STEP_ORDER,
    nextStep: getNextStep(current),
  };
}
