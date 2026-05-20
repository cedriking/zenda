-- Phase 1.1: Expand consent_source and message_purpose enums to match shared types

-- Add new consent sources
ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'booking_form';--> statement-breakpoint
ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'business_import';--> statement-breakpoint
ALTER TYPE "public"."consent_source" ADD VALUE IF NOT EXISTS 'manual_owner_confirmation';--> statement-breakpoint

-- Add new message purposes
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'inbound_reply';--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'business_follow_up';--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'marketing';--> statement-breakpoint
ALTER TYPE "public"."message_purpose" ADD VALUE IF NOT EXISTS 'unknown';--> statement-breakpoint
