import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { workspaces } from "./workspaces.js";

export const notificationTypeEnum = pgEnum("notification_type", [
  "appointment_booked",
  "appointment_cancelled",
  "appointment_rescheduled",
  "needs_attention",
  "discount_requested",
  "ai_unsure",
  "whatsapp_disconnected",
  "whatsapp_reconnected",
  "usage_warning",
  "usage_limit",
  "payment_failed",
  "subscription_updated",
  "agent_error",
  "agent_recovered",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: varchar("body", { length: 500 }).notNull(),
  relatedId: uuid("related_id"),
  read: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
