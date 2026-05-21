-- Phase 1.0: Create messaging tables and enums (idempotent)

-- Enums
DO $$ BEGIN
  CREATE TYPE "public"."messaging_consent_status" AS ENUM('unknown', 'allowed', 'limited', 'opted_out');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."consent_source" AS ENUM('customer_inbound_message', 'whatsapp_booking', 'booking_form', 'business_import', 'manual_owner_confirmation', 'opt_out_request');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."message_purpose" AS ENUM(
    'appointment_confirmation', 'appointment_reminder', 'appointment_reschedule',
    'appointment_cancellation', 'booking_follow_up', 'booking_assistance',
    'booking_confirmation', 'customer_inquiry_reply', 'inbound_reply',
    'business_follow_up', 'marketing', 'unknown'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."reminder_type" AS ENUM('day_before', 'same_day');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."queue_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'dead_letter');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "public"."queue_priority" AS ENUM ('emergency', 'reminder', 'notification', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

-- Tables
CREATE TABLE IF NOT EXISTS "messaging_consent" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "phone_number" varchar(30) NOT NULL,
  "status" "messaging_consent_status" NOT NULL DEFAULT 'unknown',
  "source" "consent_source",
  "allowed_purposes" "message_purpose"[] DEFAULT '{}',
  "captured_at" timestamp with time zone,
  "last_inbound_message_at" timestamp with time zone,
  "last_outbound_message_at" timestamp with time zone,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "outbound_message_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "conversation_id" uuid,
  "outbound_since_last_inbound" integer NOT NULL DEFAULT 0,
  "last_inbound_at" timestamp with time zone,
  "last_outbound_at" timestamp with time zone,
  "purpose_of_last_outbound" "message_purpose",
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "sent_reminder_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "appointment_id" uuid NOT NULL,
  "reminder_type" "reminder_type" NOT NULL,
  "sent_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "outbound_queue" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "workspace_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "conversation_id" uuid,
  "purpose" "message_purpose" NOT NULL,
  "content" text NOT NULL,
  "content_type" varchar(20) NOT NULL DEFAULT 'text',
  "status" "queue_status" NOT NULL DEFAULT 'pending',
  "priority" "queue_priority" NOT NULL DEFAULT 'notification',
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "next_retry_at" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "failure_reason" text,
  "appointment_id" uuid,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Indexes (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "messaging_consent_workspace_customer_idx" ON "messaging_consent" ("workspace_id", "customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messaging_consent_phone_idx" ON "messaging_consent" ("phone_number");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "outbound_message_log_workspace_customer_idx" ON "outbound_message_log" ("workspace_id", "customer_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sent_reminder_log_appointment_type_idx" ON "sent_reminder_log" ("appointment_id", "reminder_type");
--> statement-breakpoint

-- Foreign keys (idempotent via DO blocks)
DO $$ BEGIN
  ALTER TABLE "messaging_consent" ADD CONSTRAINT "messaging_consent_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "messaging_consent" ADD CONSTRAINT "messaging_consent_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "sent_reminder_log" ADD CONSTRAINT "sent_reminder_log_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint

-- Phase 1.1: Expand consent_source and message_purpose enums (idempotent)

ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'booking_form';
--> statement-breakpoint
ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'business_import';
--> statement-breakpoint
ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'manual_owner_confirmation';
--> statement-breakpoint

ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'inbound_reply';
--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'business_follow_up';
--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'marketing';
--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'unknown';
