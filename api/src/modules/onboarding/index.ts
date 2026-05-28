import { db } from "@zenda/db/client";
import type { OnboardingStep } from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, serverError, unauthorized } from "../../utils/errors.js";
import {
  getNextOnboardingQuestion,
  getOnboardingResponses,
  processOnboardingResponse,
} from "./conversation-handler.js";
import {
  advanceOnboarding,
  getOnboardingStatus,
  goBackOnboarding,
  OnboardingStepMismatchError,
} from "./flow.js";

async function getWorkspaceLanguage(workspaceId: string): Promise<"en" | "es"> {
  const ws = await db.workspace.findFirst({
    where: { id: workspaceId },
    select: { defaultLanguage: true },
  });
  return (ws?.defaultLanguage as "en" | "es") ?? "en";
}

function getErrorMessage(err: unknown): string | undefined {
  if (err instanceof Error) {
    return err.message;
  }
  return;
}

function getErrorStack(err: unknown): string | undefined {
  if (err instanceof Error) {
    return err.stack;
  }
  return;
}

export const onboardingModule = new Elysia({ prefix: "/onboarding" })
  .use(typedContext)

  .get("/status", ({ workspaceId, set }) => {
    if (!workspaceId) {
      return unauthorized(set);
    }
    try {
      return getOnboardingStatus(workspaceId);
    } catch (err: unknown) {
      logger.error("Get onboarding status error", {
        workspaceId,
        error: getErrorMessage(err),
      });
      return serverError(set, "Failed to get onboarding status");
    }
  })

  .get("/question", async ({ workspaceId, set }) => {
    if (!workspaceId) {
      return unauthorized(set);
    }
    try {
      const language = await getWorkspaceLanguage(workspaceId);
      return getNextOnboardingQuestion(workspaceId, language);
    } catch (err: unknown) {
      logger.error("Get onboarding question error", {
        workspaceId,
        error: getErrorMessage(err),
      });
      return serverError(set, "Failed to get onboarding question");
    }
  })

  .get("/responses", async ({ workspaceId, set }) => {
    if (!workspaceId) {
      return unauthorized(set);
    }
    try {
      const responses = await getOnboardingResponses(workspaceId);
      return { responses };
    } catch (err: unknown) {
      logger.error("Get onboarding responses error", {
        workspaceId,
        error: getErrorMessage(err),
      });
      return serverError(set, "Failed to get onboarding responses");
    }
  })

  .post(
    "/advance",
    async ({ workspaceId, body, set }) => {
      if (!workspaceId) {
        return unauthorized(set);
      }
      const { completedStep } = body as { completedStep: string };
      if (!completedStep) {
        return badRequest(set, "completedStep is required");
      }
      try {
        const next = await advanceOnboarding(
          workspaceId,
          completedStep as OnboardingStep
        );
        const status = await getOnboardingStatus(workspaceId);
        return { nextStep: next, progress: status.progress };
      } catch (err: unknown) {
        if (err instanceof OnboardingStepMismatchError) {
          set.status = 409;
          return {
            error: "step_mismatch",
            message: err.message,
            currentStep: err.actual,
          };
        }
        logger.error("Advance onboarding error", {
          workspaceId,
          completedStep,
          error: getErrorMessage(err),
        });
        return serverError(set, "Failed to advance onboarding");
      }
    },
    {
      body: t.Object({
        completedStep: t.String(),
      }),
    }
  )

  .post(
    "/go-back",
    async ({ workspaceId, body, set }) => {
      if (!workspaceId) {
        return unauthorized(set);
      }
      const { currentStep } = body as { currentStep: string };
      if (!currentStep) {
        return badRequest(set, "currentStep is required");
      }
      try {
        const target = await goBackOnboarding(
          workspaceId,
          currentStep as OnboardingStep
        );
        const language = await getWorkspaceLanguage(workspaceId);
        const question = await getNextOnboardingQuestion(workspaceId, language);
        const status = await getOnboardingStatus(workspaceId);
        return { previousStep: target, progress: status.progress, question };
      } catch (err: unknown) {
        logger.error("Go back onboarding error", {
          workspaceId,
          currentStep,
          error: getErrorMessage(err),
        });
        return serverError(set, "Failed to go back");
      }
    },
    {
      body: t.Object({
        currentStep: t.String(),
      }),
    }
  )

  .post(
    "/respond",
    async ({ workspaceId, body, set }) => {
      if (!workspaceId) {
        return unauthorized(set);
      }
      const { step, response } = body as { step: string; response: string };
      if (!step) {
        return badRequest(set, "step is required");
      }
      try {
        const language = await getWorkspaceLanguage(workspaceId);
        return await processOnboardingResponse(
          workspaceId,
          step,
          response,
          language
        );
      } catch (err: unknown) {
        logger.error("Onboarding respond error", {
          step,
          response,
          error: getErrorMessage(err),
          stack: getErrorStack(err),
        });
        return serverError(set, "Failed to process onboarding response");
      }
    },
    {
      body: t.Object({
        step: t.String(),
        response: t.String(),
      }),
    }
  );
