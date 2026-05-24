import { db } from "@zenda/db/client";
import {
  conversationSummaries,
  conversations,
  customers,
  messages,
} from "@zenda/db/schema";
import { sendMessageSchema, updateConversationModeSchema } from "@zenda/shared";
import { and, desc, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, notFound, serverError } from "../../utils/errors.js";

export const conversationModule = new Elysia({ prefix: "/conversations" })
  .use(typedContext)

  // List conversations
  // biome-ignore lint/suspicious/useAwait: async needed for try/catch to catch promise rejections
  .get("/", async ({ workspaceId, query, set }) => {
    try {
      const {
        mode,
        limit = "50",
        offset = "0",
      } = query as Record<string, string>;
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      const parsedOffset = Math.max(0, Number(offset) || 0);

      type ConversationMode =
        | "auto"
        | "needs_attention"
        | "human_takeover"
        | "paused"
        | "queued_offline"
        | "closed";
      const conditions = [eq(conversations.workspaceId, workspaceId as string)];
      if (mode) {
        conditions.push(eq(conversations.mode, mode as ConversationMode));
      }

      const include = (query as Record<string, string>).include;
      if (include?.includes("customer")) {
        return db
          .select({
            id: conversations.id,
            workspaceId: conversations.workspaceId,
            customerId: conversations.customerId,
            channel: conversations.channel,
            mode: conversations.mode,
            lastMessageAt: conversations.lastMessageAt,
            language: conversations.language,
            assignedToOwner: conversations.assignedToOwner,
            needsAttentionReason: conversations.needsAttentionReason,
            summary: conversations.summary,
            createdAt: conversations.createdAt,
            updatedAt: conversations.updatedAt,
            customerName: customers.name,
            customerPhone: customers.phoneNumber,
            customerLanguage: customers.language,
            lastMessagePreview: sql<string | null>`(
              SELECT body FROM ${messages}
              WHERE ${messages.conversationId} = ${conversations.id}
              ORDER BY ${messages.createdAt} DESC LIMIT 1
            )`,
          })
          .from(conversations)
          .leftJoin(customers, eq(conversations.customerId, customers.id))
          .where(and(...conditions))
          .orderBy(desc(conversations.lastMessageAt))
          .limit(parsedLimit)
          .offset(parsedOffset);
      }

      return db
        .select()
        .from(conversations)
        .where(and(...conditions))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(parsedLimit)
        .offset(parsedOffset);
    } catch (err) {
      logger.error("Failed to list conversations", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list conversations");
    }
  })

  // Get conversation by ID
  .get("/:id", async ({ workspaceId, params, set }) => {
    try {
      const [conv] = await db
        .select({
          id: conversations.id,
          workspaceId: conversations.workspaceId,
          customerId: conversations.customerId,
          channel: conversations.channel,
          mode: conversations.mode,
          lastMessageAt: conversations.lastMessageAt,
          language: conversations.language,
          assignedToOwner: conversations.assignedToOwner,
          needsAttentionReason: conversations.needsAttentionReason,
          summary: conversations.summary,
          createdAt: conversations.createdAt,
          updatedAt: conversations.updatedAt,
          customerName: customers.name,
          customerPhone: customers.phoneNumber,
          customerLanguage: customers.language,
        })
        .from(conversations)
        .leftJoin(customers, eq(conversations.customerId, customers.id))
        .where(
          and(
            eq(conversations.id, params.id),
            eq(conversations.workspaceId, workspaceId as string)
          )
        )
        .limit(1);
      if (!conv) {
        return notFound(set, "Conversation not found");
      }
      return conv;
    } catch (err) {
      logger.error("Failed to get conversation", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get conversation");
    }
  })

  // Get messages for a conversation
  .get("/:id/messages", async ({ workspaceId, params, query, set }) => {
    try {
      const { limit = "50", offset = "0" } = query as Record<string, string>;
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      const parsedOffset = Math.max(0, Number(offset) || 0);

      const [conv] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, params.id),
            eq(conversations.workspaceId, workspaceId as string)
          )
        )
        .limit(1);
      if (!conv) {
        return notFound(set, "Conversation not found");
      }

      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, params.id))
        .orderBy(desc(messages.createdAt))
        .limit(parsedLimit)
        .offset(parsedOffset);
    } catch (err) {
      logger.error("Failed to get messages", { error: (err as Error).message });
      return serverError(set, "Failed to get messages");
    }
  })

  // Update conversation mode (takeover / return to auto)
  .patch(
    "/:id/mode",
    async ({ workspaceId, params, body, set }) => {
      try {
        const parsed = updateConversationModeSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            "Validation failed: " +
              parsed.error.issues.map((i) => i.message).join(", ")
          );
        }

        const { mode } = parsed.data;

        const [conv] = await db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.id, params.id),
              eq(conversations.workspaceId, workspaceId as string)
            )
          )
          .limit(1);
        if (!conv) {
          return notFound(set, "Conversation not found");
        }

        const updates: Record<string, unknown> = {
          mode,
          needsAttentionReason:
            mode === "auto" ? null : conv.needsAttentionReason,
          updatedAt: new Date(),
        };

        // When returning to auto, generate a summary from recent messages
        if (
          mode === "auto" &&
          (conv.mode === "human_takeover" || conv.mode === "needs_attention")
        ) {
          try {
            const recentMessages = await db
              .select()
              .from(messages)
              .where(eq(messages.conversationId, params.id))
              .orderBy(desc(messages.createdAt))
              .limit(20);

            if (recentMessages.length > 0) {
              await db.insert(conversationSummaries).values({
                conversationId: params.id,
                summary: `Human takeover ended. Last ${recentMessages.length} messages summarized.`,
                keyTopics: [],
                extractedPreferences: {},
              });

              updates.summary = `Human took over from ${conv.mode}. Summary saved with ${recentMessages.length} messages.`;
              logger.info("Conversation summary generated", {
                conversationId: params.id,
              });
            }
          } catch (err) {
            logger.warn("Failed to generate summary", {
              conversationId: params.id,
              error: (err as Error).message,
            });
          }
        }

        const [updated] = await db
          .update(conversations)
          .set(updates)
          .where(eq(conversations.id, params.id))
          .returning();

        return updated;
      } catch (err) {
        logger.error("Failed to update conversation mode", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update conversation mode");
      }
    },
    {
      body: t.Object({
        mode: t.String(),
      }),
    }
  )

  // Send owner message in a conversation
  .post(
    "/:id/messages",
    async ({ workspaceId, params, body, set }) => {
      try {
        const parsed = sendMessageSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            "Validation failed: " +
              parsed.error.issues.map((i) => i.message).join(", ")
          );
        }

        const { body: text, contentType } = parsed.data;

        const [conv] = await db
          .select()
          .from(conversations)
          .where(
            and(
              eq(conversations.id, params.id),
              eq(conversations.workspaceId, workspaceId as string)
            )
          )
          .limit(1);
        if (!conv) {
          return notFound(set, "Conversation not found");
        }

        const [msg] = await db
          .insert(messages)
          .values({
            conversationId: params.id,
            workspaceId: workspaceId as string,
            senderType: "owner",
            contentType,
            body: text,
            language: conv.language,
            status: "queued",
          })
          .returning();

        await db
          .update(conversations)
          .set({ lastMessageAt: new Date(), updatedAt: new Date() })
          .where(eq(conversations.id, params.id));

        return msg;
      } catch (err) {
        logger.error("Failed to send message", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to send message");
      }
    },
    {
      body: t.Object({
        body: t.String(),
        contentType: t.Optional(t.String()),
      }),
    }
  );
