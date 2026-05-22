import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { customers } from "./customers.js";
import { languageEnum, workspaces } from "./workspaces.js";

export const conversationModeEnum = pgEnum("conversation_mode", [
  "auto",
  "needs_attention",
  "human_takeover",
  "paused",
  "queued_offline",
  "closed",
]);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    channel: varchar("channel", { length: 20 }).notNull().default("whatsapp"),
    mode: conversationModeEnum("mode").notNull().default("auto"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    language: languageEnum("language").notNull().default("es"),
    assignedToOwner: timestamp("assigned_to_owner", { withTimezone: true }),
    needsAttentionReason: varchar("needs_attention_reason", { length: 200 }),
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("conversations_workspace_customer_unique").on(
      table.workspaceId,
      table.customerId,
      table.channel
    ),
  ]
);

export const senderTypeEnum = pgEnum("sender_type", [
  "customer",
  "ai",
  "owner",
  "system",
]);
export const messageContentTypeEnum = pgEnum("message_content_type", [
  "text",
  "audio",
  "image",
  "file",
  "system",
]);
export const messageStatusEnum = pgEnum("message_status", [
  "received",
  "queued",
  "sent",
  "failed",
]);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    externalMessageId: varchar("external_message_id", { length: 255 }),
    senderType: senderTypeEnum("sender_type").notNull(),
    contentType: messageContentTypeEnum("content_type")
      .notNull()
      .default("text"),
    body: text("body").notNull(),
    language: languageEnum("language"),
    aiProvider: varchar("ai_provider", { length: 50 }),
    aiModel: varchar("ai_model", { length: 100 }),
    toolCalls: jsonb("tool_calls"),
    status: messageStatusEnum("status").notNull().default("received"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_workspace_idx").on(table.workspaceId),
    index("messages_external_id_idx").on(table.externalMessageId),
  ]
);

export const conversationSummaries = pgTable("conversation_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  keyTopics: varchar("key_topics", { length: 200 })
    .array()
    .notNull()
    .default([]),
  extractedPreferences: jsonb("extracted_preferences"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
