-- Add business config fields (idempotent)
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "cancellation_policy" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "deposit_policy" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "booking_notes" text;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "price_display" "price_display" DEFAULT 'show';
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "custom_booking_url" varchar(255);
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "timezone" varchar(50) DEFAULT 'UTC';
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "auto_confirm_bookings" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "allow_rescheduling" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "allow_cancellations" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "max_advance_booking_days" integer DEFAULT 30;
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "min_booking_notice_hours" integer DEFAULT 2;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "business_profiles" ADD COLUMN IF NOT EXISTS "cancellation_strictness" "cancellation_strictness" DEFAULT 'standard';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
