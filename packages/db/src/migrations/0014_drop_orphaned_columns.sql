-- Drop orphaned workspace reminder columns (superseded by reminder_schedule jsonb)
-- Migration 0014

ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "day_before_reminder_enabled";
--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "same_day_reminder_enabled";
--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "same_day_reminder_hours_before";
