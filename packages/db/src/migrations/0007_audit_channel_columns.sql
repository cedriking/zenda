-- Add channel and source columns to audit_logs (idempotent)
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "channel" varchar(50);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "source" varchar(50);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
