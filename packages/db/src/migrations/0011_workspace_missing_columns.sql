-- Add missing workspace columns (idempotent)
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "max_reminders_per_appointment" integer NOT NULL DEFAULT 3;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "max_outbound_without_reply" integer NOT NULL DEFAULT 5;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "outbound_limits_config" jsonb;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "reminder_schedule" jsonb;
