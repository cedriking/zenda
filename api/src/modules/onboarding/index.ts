import { db } from "@zenda/db/client";
import { workspaces } from "@zenda/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { serverError, unauthorized } from "../../utils/errors.js";
import {
  getNextOnboardingQuestion,
  processOnboardingResponse,
} from "./conversation-handler.js";
import {
  advanceOnboarding,
  getOnboardingStatus,
  OnboardingStepMismatchError,
} from "./flow.js";

async function getWorkspaceLanguage(workspaceId: string): Promise<"en" | "es"> {
  const [ws] = await db
    .select({ defaultLanguage: workspaces.defaultLanguage })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return (ws?.defaultLanguage as "en" | "es") ?? "en";
}

export const onboardingModule = new Elysia({ prefix: "/onboarding" })
  .use(typedContext)

  .get("/status", async ({ workspaceId, set }) => {
    if (!workspaceId) {
      return unauthorized(set);
    }
    try {
      return getOnboardingStatus(workspaceId);
    } catch (err: any) {
      logger.error("Get onboarding status error", {
        workspaceId,
        error: err?.message,
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
    } catch (err: any) {
      logger.error("Get onboarding question error", {
        workspaceId,
        error: err?.message,
      });
      return serverError(set, "Failed to get onboarding question");
    }
  })

  .post(
    "/advance",
    async ({ workspaceId, body, set }) => {
      if (!workspaceId) {
        return unauthorized(set);
      }
      const { completedStep } = body as { completedStep: string };
      try {
        const next = await advanceOnboarding(workspaceId, completedStep as any);
        return { nextStep: next, progress: 100 };
      } catch (err: any) {
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
          error: err?.message,
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
    "/respond",
    async ({ workspaceId, body, set }) => {
      if (!workspaceId) {
        return unauthorized(set);
      }
      const { step, response } = body as { step: string; response: string };
      try {
        const language = await getWorkspaceLanguage(workspaceId);
        return await processOnboardingResponse(
          workspaceId,
          step,
          response,
          language
        );
      } catch (err: any) {
        logger.error("Onboarding respond error", {
          step,
          response,
          error: err?.message,
          stack: err?.stack,
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
