-- Create missing enums (idempotent)
DO $$ BEGIN
  CREATE TYPE "public"."personality_preset" AS ENUM('professional', 'warm', 'minimal', 'premium', 'friendly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
-- Add missing receptionist profile columns (idempotent)
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "personality_preset" "personality_preset" NOT NULL DEFAULT 'professional';
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "greeting_style" text;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "formality_level" integer NOT NULL DEFAULT 3;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "conciseness_level" integer NOT NULL DEFAULT 3;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "warmth_level" integer NOT NULL DEFAULT 3;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "use_emoji" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "speaks_as_business" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "proactively_suggest_times" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "confirms_before_booking" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "notify_owner_every_appointment" boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "cancellation_policy_strictness" "cancellation_strictness" NOT NULL DEFAULT 'standard';
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "refund_handling_mode" varchar(50);
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "discount_handling_mode" varchar(50);
--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD COLUMN IF NOT EXISTS "deposit_handling_mode" varchar(50);
--> statement-breakpoint
-- Add missing business profile columns
DO $$ BEGIN
  CREATE TYPE "public"."staff_assignment_mode" AS ENUM('auto_assign', 'customer_chooses', 'manual_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "cancellation_window_hours" integer NOT NULL DEFAULT 24;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "rescheduling_window_hours" integer NOT NULL DEFAULT 2;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "minimum_notice_hours" integer NOT NULL DEFAULT 2;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "maximum_booking_window_days" integer NOT NULL DEFAULT 30;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "deposit_required" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "deposit_amount_cents" integer;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "staff_assignment_mode" "staff_assignment_mode" NOT NULL DEFAULT 'auto_assign';
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "approved_cancellation_text" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "approved_refund_text" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "approved_discount_text" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "emergency_escalation_instructions" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "sensitive_topics" varchar[] DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "escalation_behavior" jsonb DEFAULT '{"autoPauseAi": true, "notificationChannel": "dashboard", "responseSlaMinutes": 30}';
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "owner_notification_preferences" jsonb DEFAULT '{"appointmentBooked": true, "appointmentCancelled": true, "escalationCreated": true, "optOut": true}';
