-- Add missing updated_at column to usage_records (schema defined it but migration 0000 omitted it)
ALTER TABLE "usage_records" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
