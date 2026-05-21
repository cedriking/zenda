CREATE TYPE "public"."actor_type" AS ENUM('ai', 'owner', 'system', 'customer');--> statement-breakpoint
CREATE TYPE "public"."appointment_reminder_status" AS ENUM('none', 'scheduled', 'sent', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('requested', 'pending_confirmation', 'confirmed', 'reminder_sent', 'client_confirmed', 'reschedule_requested', 'rescheduled', 'cancel_requested', 'cancelled', 'completed', 'no_show', 'needs_attention');--> statement-breakpoint
CREATE TYPE "public"."billing_period" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."business_category" AS ENUM('beauty', 'wellness', 'health', 'coaching', 'fitness', 'other');--> statement-breakpoint
CREATE TYPE "public"."cancellation_strictness" AS ENUM('lenient', 'standard', 'strict');--> statement-breakpoint
CREATE TYPE "public"."confirmation_status" AS ENUM('pending', 'confirmed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."consent_source" AS ENUM('customer_inbound_message', 'whatsapp_booking', 'booking_form', 'business_import', 'manual_owner_confirmation', 'opt_out_request');--> statement-breakpoint
CREATE TYPE "public"."conversation_mode" AS ENUM('auto', 'needs_attention', 'human_takeover', 'paused', 'queued_offline', 'closed');--> statement-breakpoint
CREATE TYPE "public"."created_by" AS ENUM('ai', 'owner', 'system');--> statement-breakpoint
CREATE TYPE "public"."escalation_reason" AS ENUM('customer_requested_human', 'unknown_question', 'discount_request', 'price_dispute', 'refund_request', 'angry_customer', 'medical_legal_financial', 'sensitive_info', 'custom_exception', 'unlisted_service', 'outside_rules', 'unclear_audio', 'emergency', 'low_confidence', 'technology_question');--> statement-breakpoint
CREATE TYPE "public"."escalation_status" AS ENUM('open', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('composio', 'stripe', 'custom', 'other');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('active', 'inactive', 'error', 'pending');--> statement-breakpoint
CREATE TYPE "public"."integration_type" AS ENUM('whatsapp', 'instagram', 'telegram', 'google_calendar', 'google_mail', 'stripe', 'other');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'es');--> statement-breakpoint
CREATE TYPE "public"."memory_source" AS ENUM('ai_extraction', 'owner_note', 'system');--> statement-breakpoint
CREATE TYPE "public"."message_content_type" AS ENUM('text', 'audio', 'image', 'file', 'system');--> statement-breakpoint
CREATE TYPE "public"."message_purpose" AS ENUM('appointment_confirmation', 'appointment_reminder', 'appointment_reschedule', 'appointment_cancellation', 'booking_follow_up', 'booking_assistance', 'booking_confirmation', 'customer_inquiry_reply', 'inbound_reply', 'business_follow_up', 'marketing', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('received', 'queued', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."messaging_consent_status" AS ENUM('unknown', 'allowed', 'limited', 'opted_out');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('appointment_booked', 'appointment_cancelled', 'appointment_rescheduled', 'needs_attention', 'discount_requested', 'ai_unsure', 'whatsapp_disconnected', 'whatsapp_reconnected', 'usage_warning', 'usage_limit', 'payment_failed', 'subscription_updated');--> statement-breakpoint
CREATE TYPE "public"."onboarding_step" AS ENUM('not_started', 'whatsapp_connected', 'business_info', 'services', 'availability', 'policies', 'receptionist_config', 'plan_selection', 'ready');--> statement-breakpoint
CREATE TYPE "public"."personality_preset" AS ENUM('professional', 'warm', 'minimal', 'premium', 'friendly');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('starter', 'pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."price_display" AS ENUM('show', 'hide', 'on_request');--> statement-breakpoint
CREATE TYPE "public"."queue_priority" AS ENUM('emergency', 'reminder', 'notification', 'low');--> statement-breakpoint
CREATE TYPE "public"."queue_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'dead_letter');--> statement-breakpoint
CREATE TYPE "public"."receptionist_tone" AS ENUM('professional', 'warm', 'friendly', 'elegant', 'casual');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('day_before', 'same_day');--> statement-breakpoint
CREATE TYPE "public"."sender_type" AS ENUM('customer', 'ai', 'owner', 'system');--> statement-breakpoint
CREATE TYPE "public"."staff_assignment_mode" AS ENUM('auto_assign', 'customer_chooses', 'manual_only');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'paused');--> statement-breakpoint
CREATE TYPE "public"."whatsapp_connection_status" AS ENUM('connected', 'connecting', 'qr_required', 'disconnected', 'session_expired', 'error', 'rate_limited', 'maintenance');--> statement-breakpoint
CREATE TABLE "agent_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"source" "memory_source" DEFAULT 'ai_extraction' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"staff_member_id" uuid,
	"service_id" uuid NOT NULL,
	"status" "appointment_status" DEFAULT 'requested' NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"source_conversation_id" uuid,
	"created_by" "created_by" DEFAULT 'owner' NOT NULL,
	"confirmation_status" "confirmation_status" DEFAULT 'pending' NOT NULL,
	"reminder_status" "appointment_reminder_status" DEFAULT 'none' NOT NULL,
	"notes" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid,
	"workspace_id" uuid NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"duration_seconds" integer,
	"transcript" varchar(2000),
	"language" "language",
	"confidence" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"channel" varchar(50),
	"channel_provider" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"staff_member_id" uuid,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "business_category" DEFAULT 'other',
	"description" text,
	"description_es" text,
	"location" varchar(300),
	"cancellation_policy" text,
	"cancellation_policy_es" text,
	"refund_policy" text,
	"price_display_preference" "price_display" DEFAULT 'show' NOT NULL,
	"cancellation_window_hours" integer DEFAULT 24 NOT NULL,
	"rescheduling_window_hours" integer DEFAULT 2 NOT NULL,
	"minimum_notice_hours" integer DEFAULT 2 NOT NULL,
	"maximum_booking_window_days" integer DEFAULT 30 NOT NULL,
	"deposit_required" boolean DEFAULT false NOT NULL,
	"deposit_amount_cents" integer,
	"staff_assignment_mode" "staff_assignment_mode" DEFAULT 'auto_assign' NOT NULL,
	"approved_cancellation_text" text,
	"approved_refund_text" text,
	"approved_discount_text" text,
	"emergency_escalation_instructions" text,
	"sensitive_topics" text[] DEFAULT '{}',
	"escalation_behavior" jsonb DEFAULT '{"autoPauseAi":true,"notificationChannel":"dashboard","responseSlaMinutes":30}'::jsonb,
	"owner_notification_preferences" jsonb DEFAULT '{"appointmentBooked":true,"appointmentCancelled":true,"escalationCreated":true,"optOut":true}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"key_topics" varchar(200)[] DEFAULT '{}' NOT NULL,
	"extracted_preferences" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"channel" varchar(20) DEFAULT 'whatsapp' NOT NULL,
	"mode" "conversation_mode" DEFAULT 'auto' NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"language" "language" DEFAULT 'es' NOT NULL,
	"assigned_to_owner" timestamp with time zone,
	"needs_attention_reason" varchar(200),
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"name" varchar(100),
	"language" "language" DEFAULT 'es' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"reason" "escalation_reason" NOT NULL,
	"status" "escalation_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "integrations" (
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
CREATE TABLE "knowledge_base_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"question" varchar(300) NOT NULL,
	"answer" text NOT NULL,
	"language" "language" DEFAULT 'es' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"workspace_id" uuid NOT NULL,
	"external_message_id" varchar(255),
	"sender_type" "sender_type" NOT NULL,
	"content_type" "message_content_type" DEFAULT 'text' NOT NULL,
	"body" text NOT NULL,
	"language" "language",
	"ai_provider" varchar(50),
	"ai_model" varchar(100),
	"tool_calls" jsonb,
	"status" "message_status" DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messaging_consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"status" "messaging_consent_status" DEFAULT 'unknown' NOT NULL,
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
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" varchar(500) NOT NULL,
	"related_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbound_message_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"conversation_id" uuid,
	"outbound_since_last_inbound" integer DEFAULT 0 NOT NULL,
	"last_inbound_at" timestamp with time zone,
	"last_outbound_at" timestamp with time zone,
	"purpose_of_last_outbound" "message_purpose",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbound_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"conversation_id" uuid,
	"purpose" "message_purpose" NOT NULL,
	"content" text NOT NULL,
	"content_type" varchar(20) DEFAULT 'text' NOT NULL,
	"status" "queue_status" DEFAULT 'pending' NOT NULL,
	"priority" "queue_priority" DEFAULT 'notification' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"failure_reason" text,
	"appointment_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"name" varchar(50) NOT NULL,
	"monthly_price_cents" integer NOT NULL,
	"annual_price_cents" integer NOT NULL,
	"conversations_limit" integer NOT NULL,
	"appointments_limit" integer NOT NULL,
	"voice_minutes_limit" integer NOT NULL,
	"staff_limit" integer NOT NULL,
	"retention_days" integer NOT NULL,
	CONSTRAINT "plans_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "provider_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"provider" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receptionist_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(50) DEFAULT 'Noa' NOT NULL,
	"tone" "receptionist_tone" DEFAULT 'professional' NOT NULL,
	"greeting_template" text,
	"greeting_template_es" text,
	"personality_preset" "personality_preset" DEFAULT 'professional' NOT NULL,
	"greeting_style" text,
	"formality_level" integer DEFAULT 3 NOT NULL,
	"conciseness_level" integer DEFAULT 3 NOT NULL,
	"warmth_level" integer DEFAULT 3 NOT NULL,
	"use_emoji" boolean DEFAULT false NOT NULL,
	"speaks_as_business" boolean DEFAULT false NOT NULL,
	"proactively_suggest_times" boolean DEFAULT true NOT NULL,
	"confirms_before_booking" boolean DEFAULT true NOT NULL,
	"notify_owner_every_appointment" boolean DEFAULT true NOT NULL,
	"cancellation_policy_strictness" "cancellation_strictness" DEFAULT 'standard' NOT NULL,
	"refund_handling_mode" varchar(50),
	"discount_handling_mode" varchar(50),
	"deposit_handling_mode" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revoked_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_jti" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"revoked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revoked_tokens_token_jti_unique" UNIQUE("token_jti")
);
--> statement-breakpoint
CREATE TABLE "sent_reminder_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"duration_minutes" integer NOT NULL,
	"price_cents" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"service_ids" uuid[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"plan_tier" "plan_tier" DEFAULT 'starter' NOT NULL,
	"billing_period" "billing_period" DEFAULT 'monthly' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"metric" varchar(50) NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(200),
	"business_type" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"status" "whatsapp_connection_status" DEFAULT 'disconnected' NOT NULL,
	"phone_number" varchar(20),
	"session_data" text,
	"last_connected_at" timestamp with time zone,
	"last_disconnected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/Mexico_City' NOT NULL,
	"country" varchar(2) DEFAULT 'MX' NOT NULL,
	"default_language" "language" DEFAULT 'es' NOT NULL,
	"onboarding_step" "onboarding_step" DEFAULT 'not_started' NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"composio_account_id" varchar(255),
	"composio_calendar_id" varchar(255),
	"composio_connected_at" timestamp with time zone,
	"max_reminders_per_appointment" integer DEFAULT 2 NOT NULL,
	"max_outbound_without_reply" integer DEFAULT 3 NOT NULL,
	"outbound_limits_config" jsonb DEFAULT '{}'::jsonb,
	"reminder_schedule" jsonb DEFAULT '[{"offsetHours":24,"type":"reminder"},{"offsetHours":2,"type":"confirmation_prompt"}]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_memory" ADD CONSTRAINT "agent_memory_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_member_id_staff_members_id_fk" FOREIGN KEY ("staff_member_id") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_source_conversation_id_conversations_id_fk" FOREIGN KEY ("source_conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_assets" ADD CONSTRAINT "audio_assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_staff_member_id_staff_members_id_fk" FOREIGN KEY ("staff_member_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_summaries" ADD CONSTRAINT "conversation_summaries_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base_items" ADD CONSTRAINT "knowledge_base_items_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messaging_consent" ADD CONSTRAINT "messaging_consent_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messaging_consent" ADD CONSTRAINT "messaging_consent_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_message_log" ADD CONSTRAINT "outbound_message_log_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbound_queue" ADD CONSTRAINT "outbound_queue_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_usage" ADD CONSTRAINT "provider_usage_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receptionist_profiles" ADD CONSTRAINT "receptionist_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sent_reminder_log" ADD CONSTRAINT "sent_reminder_log_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_workspace_date_idx" ON "appointments" USING btree ("workspace_id","start_at");--> statement-breakpoint
CREATE INDEX "appointments_workspace_status_idx" ON "appointments" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "appointments_confirmation_status_idx" ON "appointments" USING btree ("workspace_id","confirmation_status");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_workspace_customer_unique" ON "conversations" USING btree ("workspace_id","customer_id","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_phone_unique" ON "customers" USING btree ("workspace_id","phone_number");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_workspace_idx" ON "messages" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "messaging_consent_workspace_customer_idx" ON "messaging_consent" USING btree ("workspace_id","customer_id");--> statement-breakpoint
CREATE INDEX "messaging_consent_phone_idx" ON "messaging_consent" USING btree ("phone_number");--> statement-breakpoint
CREATE UNIQUE INDEX "outbound_message_log_workspace_customer_idx" ON "outbound_message_log" USING btree ("workspace_id","customer_id");--> statement-breakpoint
CREATE INDEX "idx_revoked_tokens_jti" ON "revoked_tokens" USING btree ("token_jti");--> statement-breakpoint
CREATE INDEX "idx_revoked_tokens_revoked_at" ON "revoked_tokens" USING btree ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sent_reminder_log_appointment_type_idx" ON "sent_reminder_log" USING btree ("appointment_id","reminder_type");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_email_unique" ON "waitlist_entries" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_idx" ON "workspace_members" USING btree ("workspace_id","user_id");