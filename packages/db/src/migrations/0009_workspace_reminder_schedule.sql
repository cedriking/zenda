-- Add reminder schedule columns to workspaces (idempotent)
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "day_before_reminder_enabled" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "same_day_reminder_enabled" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "same_day_reminder_hours_before" integer DEFAULT 2;
