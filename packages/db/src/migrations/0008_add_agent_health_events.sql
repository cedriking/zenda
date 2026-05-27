-- Agent health monitoring events table
CREATE TYPE "public"."agent_health_status" AS ENUM('healthy', 'degraded', 'error', 'unknown');--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "agent_health_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_name" varchar(100) NOT NULL,
  "workspace_id" uuid REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "status" "agent_health_status" NOT NULL,
  "previous_status" "agent_health_status",
  "details" jsonb,
  "latency_ms" integer,
  "error" varchar(500),
  "recovered_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_agent_health_events_agent" ON "agent_health_events"("agent_name");
CREATE INDEX IF NOT EXISTS "idx_agent_health_events_created" ON "agent_health_events"("created_at");
