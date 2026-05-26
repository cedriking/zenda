import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversations } from "./conversations.js";
import { workspaces } from "./workspaces.js";

export const escalationReasonEnum = pgEnum("escalation_reason", [
  "customer_requested_human",
  "unknown_question",
  "discount_request",
  "price_dispute",
  "refund_request",
  "angry_customer",
  "medical_legal_financial",
  "sensitive_info",
  "custom_exception",
  "unlisted_service",
  "outside_rules",
  "unclear_audio",
  "emergency",
  "low_confidence",
  "technology_question",
]);

export const escalationStatusEnum = pgEnum("escalation_status", [
  "open",
  "resolved",
]);

export const escalations = pgTable("escalations", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  reason: escalationReasonEnum("reason").notNull(),
  status: escalationStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
