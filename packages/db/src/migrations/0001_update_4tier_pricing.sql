-- Update plan_tier enum: drop old values, add new 4-tier values
ALTER TYPE "public"."plan_tier" RENAME TO "plan_tier_old";
CREATE TYPE "public"."plan_tier" AS ENUM('local_solo', 'local_starter', 'local_pro', 'local_business');
--> statement-breakpoint

-- Drop old plans data and restructure table
DELETE FROM "plans";
--> statement-breakpoint

-- Alter plans table: drop old columns, add new ones
ALTER TABLE "plans" DROP COLUMN IF EXISTS "annual_price_cents";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "conversations_limit";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "appointments_limit";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "voice_minutes_limit";
ALTER TABLE "plans" DROP COLUMN IF EXISTS "staff_limit";
--> statement-breakpoint

ALTER TABLE "plans" ADD COLUMN "active_contacts_limit" integer NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN "calendars_staff_limit" integer NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN "locations_limit" integer NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN "setup_type" varchar(20) NOT NULL DEFAULT 'self_serve';
--> statement-breakpoint

-- Alter plans tier column to use new enum
ALTER TABLE "plans" ALTER COLUMN "tier" TYPE "public"."plan_tier" USING "tier"::text::"public"."plan_tier";
--> statement-breakpoint

-- Insert new 4-tier plan data
INSERT INTO "plans" ("tier", "name", "monthly_price_cents", "active_contacts_limit", "calendars_staff_limit", "locations_limit", "setup_type", "retention_days") VALUES
  ('local_solo', 'Solo', 2900, 50, 1, 1, 'self_serve', 30),
  ('local_starter', 'Starter', 4900, 150, 3, 1, 'self_serve', 60),
  ('local_pro', 'Pro', 8900, 500, 10, 3, 'priority', 90),
  ('local_business', 'Business', 14900, 1500, 25, 10, 'assisted', 180);
--> statement-breakpoint

-- Update subscriptions plan_tier default to local_solo
ALTER TABLE "subscriptions" ALTER COLUMN "plan_tier" SET DEFAULT 'local_solo';
ALTER TABLE "subscriptions" ALTER COLUMN "plan_tier" TYPE "public"."plan_tier" USING "plan_tier"::text::"public"."plan_tier";
--> statement-breakpoint

-- Create active_contact_dedup table with composite PK
CREATE TABLE IF NOT EXISTS "active_contact_dedup" (
  "workspace_id" uuid NOT NULL,
  "customer_phone" varchar(50) NOT NULL,
  "period_start" timestamp with time zone NOT NULL,
  "period_end" timestamp with time zone NOT NULL,
  "first_action_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "active_contact_dedup_workspace_id_customer_phone_period_start_pk" PRIMARY KEY("workspace_id","customer_phone","period_start")
);
--> statement-breakpoint

ALTER TABLE "active_contact_dedup" ADD CONSTRAINT "active_contact_dedup_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Drop old enum type
DROP TYPE "public"."plan_tier_old";
