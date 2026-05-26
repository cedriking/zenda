import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, serverError } from "../../utils/errors.js";
import {
  createKnowledgeItem,
  deleteKnowledgeItem,
  getKnowledgeBase,
  searchKnowledgeBase,
} from "./service.js";

export const knowledgeBaseModule = new Elysia({ prefix: "/knowledge-base" })
  .use(typedContext)

  .get("/", async ({ workspaceId, set }) => {
    try {
      return await getKnowledgeBase(workspaceId!);
    } catch (err) {
      logger.error("Failed to get knowledge base", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get knowledge base");
    }
  })

  .get("/search", async ({ workspaceId, query, set }) => {
    try {
      const { q } = (query as Record<string, string>) ?? {};
      if (!q) {
        return [];
      }
      return await searchKnowledgeBase(workspaceId!, q);
    } catch (err) {
      logger.error("Failed to search knowledge base", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to search knowledge base");
    }
  })

  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      try {
        const data = body as Record<string, string>;
        if (!(data.question && data.answer)) {
          return badRequest(set, "Question and answer are required");
        }
        return await createKnowledgeItem(workspaceId!, {
          question: data.question,
          answer: data.answer,
          category: data.category,
        });
      } catch (err) {
        logger.error("Failed to create knowledge item", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to create knowledge item");
      }
    },
    {
      body: t.Object({
        question: t.String(),
        answer: t.String(),
        category: t.Optional(t.String()),
      }),
    }
  )

  .delete("/:id", async ({ workspaceId, params, set }) => {
    try {
      return await deleteKnowledgeItem(workspaceId!, params.id);
    } catch (err) {
      logger.error("Failed to delete knowledge item", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to delete knowledge item");
    }
  });
