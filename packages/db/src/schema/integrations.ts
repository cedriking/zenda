import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const integrationTypeEnum = pgEnum("integration_type", [
  "whatsapp",
  "instagram",
  "telegram",
  "google_calendar",
  "google_mail",
  "stripe",
  "other",
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "composio",
  "stripe",
  "custom",
  "other",
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "active",
  "inactive",
  "error",
  "pending",
]);

export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  type: integrationTypeEnum("type").notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  config: text("config"), // JSON string for provider-specific configuration
  status: integrationStatusEnum("status").notNull().default("pending"),
  credentials: text("credentials"), // Encrypted JSON string for sensitive data
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
