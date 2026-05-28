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
  "test_receptionist",
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

export function getPreviousStep(
  current: OnboardingStep
): OnboardingStep | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx <= 0) {
    return null;
  }
  return STEP_ORDER[idx - 1];
}

export function getProgress(current: OnboardingStep): number {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1) {
    return 0;
  }
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
}

export class OnboardingStepMismatchError extends Error {
  readonly expected: OnboardingStep;
  readonly actual: OnboardingStep;

  constructor(expected: OnboardingStep, actual: OnboardingStep) {
    super(
      `Onboarding step mismatch: expected ${expected}, but workspace is at ${actual}`
    );
    this.name = "OnboardingStepMismatchError";
    this.expected = expected;
    this.actual = actual;
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

  const data: {
    onboardingStep: OnboardingStep;
    updatedAt: Date;
    onboardingCompletedAt?: Date;
  } = {
    onboardingStep: next,
    updatedAt: new Date(),
  };

  // Set onboardingCompletedAt when reaching "ready"
  if (next === "ready") {
    data.onboardingCompletedAt = new Date();
  }

  const result = await db.workspace.updateMany({
    where: { id: workspaceId, onboardingStep: completedStep },
    data,
  });

  if (result.count === 0) {
    const ws = await db.workspace.findFirst({
      where: { id: workspaceId },
      select: { onboardingStep: true },
    });

    const currentStep = (ws?.onboardingStep as OnboardingStep) ?? "not_started";
    throw new OnboardingStepMismatchError(completedStep, currentStep);
  }

  return next;
}

export async function goBackOnboarding(
  workspaceId: string,
  currentStep: OnboardingStep
): Promise<OnboardingStep> {
  const prev = getPreviousStep(currentStep);
  if (!prev) {
    return currentStep;
  }

  // Skip auto-advance steps when going back
  const skipSteps: OnboardingStep[] = ["not_started", "whatsapp_connected"];
  const target = skipSteps.includes(prev)
    ? (getPreviousStep(prev) ?? prev)
    : prev;

  await db.workspace.update({
    where: { id: workspaceId },
    data: { onboardingStep: target, updatedAt: new Date() },
  });

  return target;
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

export { STEP_ORDER };
