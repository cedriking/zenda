-- Comprehensive schema sync: fix all discrepancies between Drizzle schema and DB
-- Migration 0012

-- 1. Create missing cancellation_strictness enum (used in 0008/0010 but never created)
DO $$ BEGIN
  CREATE TYPE "public"."cancellation_strictness" AS ENUM('lenient', 'standard', 'strict');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

-- 2. audit_logs: rename migration's "source" to schema's "channel_provider"
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'source'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_logs' AND column_name = 'channel_provider'
  ) THEN
    ALTER TABLE "audit_logs" RENAME COLUMN "source" TO "channel_provider";
  END IF;
END $$;
--> statement-breakpoint

-- 3. business_profiles: fix sensitive_topics type from varchar[] to text[]
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "sensitive_topics";
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "sensitive_topics" text[] DEFAULT '{}';
--> statement-breakpoint

-- 4. workspaces: fix default values to match schema
-- Schema says max_reminders_per_appointment default is 2, migration 0011 set 3
ALTER TABLE "workspaces" ALTER COLUMN "max_reminders_per_appointment" SET DEFAULT 2;
--> statement-breakpoint
-- Schema says max_outbound_without_reply default is 3, migration 0011 set 5
ALTER TABLE "workspaces" ALTER COLUMN "max_outbound_without_reply" SET DEFAULT 3;
--> statement-breakpoint

-- 5. business_profiles: drop orphaned columns from migration 0008 that have no schema counterpart
-- The schema has different columns for the same concepts (e.g., depositRequired vs deposit_policy)
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "deposit_policy";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "booking_notes";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "custom_booking_url";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "auto_confirm_bookings";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "allow_rescheduling";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "allow_cancellations";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "max_advance_booking_days";
--> statement-breakpoint
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "min_booking_notice_hours";
--> statement-breakpoint
-- "cancellation_strictness" column was renamed concept to "cancellation_window_hours" + "cancellation_policy_strictness" on receptionist
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "cancellation_strictness";
--> statement-breakpoint
-- "timezone" on business_profiles is not in the schema (workspace owns timezone)
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "timezone";
--> statement-breakpoint
-- "price_display" was added in 0008 but schema already has "price_display_preference" from 0000
ALTER TABLE "business_profiles" DROP COLUMN IF EXISTS "price_display";
