import {
  integer,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { messages } from "./conversations.js";
import { languageEnum, workspaces } from "./workspaces.js";

export const audioAssets = pgTable("audio_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messages.id, {
    onDelete: "set null",
  }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  durationSeconds: integer("duration_seconds"),
  transcript: varchar("transcript", { length: 2000 }),
  language: languageEnum("language"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
