import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces.js";

export const agentHealthStatusEnum = pgEnum("agent_health_status", [
  "healthy",
  "degraded",
  "error",
  "unknown",
]);

export const agentHealthEvents = pgTable("agent_health_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  status: agentHealthStatusEnum("status").notNull(),
  previousStatus: agentHealthStatusEnum("previous_status"),
  details: jsonb("details"),
  latencyMs: integer("latency_ms"),
  error: varchar("error", { length: 500 }),
  recoveredAt: timestamp("recovered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
