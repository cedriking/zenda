DO $$ BEGIN
  CREATE TYPE "public"."integration_provider" AS ENUM('zernio', 'composio', 'stripe', 'custom', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."integration_status" AS ENUM('active', 'inactive', 'error', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."integration_type" AS ENUM('whatsapp', 'instagram', 'telegram', 'google_calendar', 'google_mail', 'stripe', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TYPE "public"."onboarding_step" ADD VALUE IF NOT EXISTS 'plan_selection' BEFORE 'ready';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"type" "integration_type" NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"config" text,
	"status" "integration_status" DEFAULT 'pending' NOT NULL,
	"credentials" text,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "zernio_account_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "zernio_access_token" varchar(500);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "zernio_connected_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "composio_account_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "composio_calendar_id" varchar(255);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "composio_connected_at" timestamp with time zone;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_workspace_status_idx" ON "appointments" ("workspace_id","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_confirmation_status_idx" ON "appointments" ("workspace_id","confirmation_status");
