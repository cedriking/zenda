-- Rename all snake_case enum types to PascalCase to match Prisma schema names
-- Prisma 7 uses the exact enum name from schema.prisma as the PG type name

ALTER TYPE "actor_type" RENAME TO "ActorType";
ALTER TYPE "agent_health_status" RENAME TO "AgentHealthStatus";
ALTER TYPE "appointment_reminder_status" RENAME TO "AppointmentReminderStatus";
ALTER TYPE "appointment_status" RENAME TO "AppointmentStatus";
ALTER TYPE "billing_period" RENAME TO "BillingPeriod";
ALTER TYPE "business_category" RENAME TO "BusinessCategory";
ALTER TYPE "cancellation_strictness" RENAME TO "CancellationStrictness";
ALTER TYPE "confirmation_status" RENAME TO "ConfirmationStatus";
ALTER TYPE "consent_source" RENAME TO "ConsentSource";
ALTER TYPE "conversation_mode" RENAME TO "ConversationMode";
ALTER TYPE "created_by" RENAME TO "CreatedBy";
ALTER TYPE "escalation_reason" RENAME TO "EscalationReason";
ALTER TYPE "escalation_status" RENAME TO "EscalationStatus";
ALTER TYPE "integration_provider" RENAME TO "IntegrationProvider";
ALTER TYPE "integration_status" RENAME TO "IntegrationStatus";
ALTER TYPE "integration_type" RENAME TO "IntegrationType";
ALTER TYPE "language" RENAME TO "Language";
ALTER TYPE "memory_source" RENAME TO "MemorySource";
ALTER TYPE "message_content_type" RENAME TO "MessageContentType";
ALTER TYPE "message_purpose" RENAME TO "MessagePurpose";
ALTER TYPE "message_status" RENAME TO "MessageStatus";
ALTER TYPE "messaging_consent_status" RENAME TO "MessagingConsentStatus";
ALTER TYPE "notification_type" RENAME TO "NotificationType";
ALTER TYPE "onboarding_step" RENAME TO "OnboardingStep";
ALTER TYPE "personality_preset" RENAME TO "PersonalityPreset";
ALTER TYPE "plan_tier" RENAME TO "PlanTier";
ALTER TYPE "price_display" RENAME TO "PriceDisplay";
ALTER TYPE "queue_priority" RENAME TO "QueuePriority";
ALTER TYPE "queue_status" RENAME TO "QueueStatus";
ALTER TYPE "receptionist_tone" RENAME TO "ReceptionistTone";
ALTER TYPE "reminder_type" RENAME TO "ReminderType";
ALTER TYPE "sender_type" RENAME TO "SenderType";
ALTER TYPE "staff_assignment_mode" RENAME TO "StaffAssignmentMode";
ALTER TYPE "subscription_status" RENAME TO "SubscriptionStatus";
ALTER TYPE "whatsapp_connection_status" RENAME TO "WhatsappConnectionStatus";
