// Appointment statuses (state machine states)
export type AppointmentStatus =
  | 'requested'
  | 'pending_confirmation'
  | 'confirmed'
  | 'reminder_sent'
  | 'client_confirmed'
  | 'reschedule_requested'
  | 'rescheduled'
  | 'cancel_requested'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'needs_attention'

// Conversation modes
export type ConversationMode =
  | 'auto'
  | 'needs_attention'
  | 'human_takeover'
  | 'paused'
  | 'queued_offline'
  | 'closed'

// WhatsApp connection states
export type WhatsAppConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'qr_required'
  | 'disconnected'
  | 'session_expired'
  | 'error'
  | 'rate_limited'
  | 'maintenance'

// Subscription states (mapped from Stripe)
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'paused'

// Plan tiers
export type PlanTier = 'starter' | 'pro' | 'business'

// Billing period
export type BillingPeriod = 'monthly' | 'annual'

// Message sender types
export type SenderType = 'customer' | 'ai' | 'owner' | 'system'

// Message content types
export type MessageContentType = 'text' | 'audio' | 'image' | 'file' | 'system'

// Message delivery statuses
export type MessageStatus = 'received' | 'queued' | 'sent' | 'failed'

// Receptionist tone
export type ReceptionistTone = 'professional' | 'warm' | 'friendly' | 'elegant' | 'casual'

// Business categories
export type BusinessCategory =
  | 'beauty'
  | 'wellness'
  | 'health'
  | 'coaching'
  | 'fitness'
  | 'other'

// Supported languages
export type Language = 'en' | 'es'

// Escalation reasons
export type EscalationReason =
  | 'customer_requested_human'
  | 'unknown_question'
  | 'discount_request'
  | 'price_dispute'
  | 'refund_request'
  | 'angry_customer'
  | 'medical_legal_financial'
  | 'sensitive_info'
  | 'custom_exception'
  | 'unlisted_service'
  | 'outside_rules'
  | 'unclear_audio'
  | 'emergency'
  | 'low_confidence'
  | 'technology_question'

// Notification types
export type NotificationType =
  | 'appointment_booked'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'needs_attention'
  | 'discount_requested'
  | 'ai_unsure'
  | 'whatsapp_disconnected'
  | 'whatsapp_reconnected'
  | 'usage_warning'
  | 'usage_limit'
  | 'payment_failed'
  | 'subscription_updated'

// Audit log actor types
export type ActorType = 'ai' | 'owner' | 'system' | 'customer'

// AI task types for provider routing
export type AITaskType =
  | 'intent_detection'
  | 'language_detection'
  | 'classification'
  | 'tool_planning'
  | 'response_generation'
  | 'summarization'
  | 'memory_extraction'
  | 'transcription'

// AI providers
export type AIProvider = 'zai' | 'openai' | 'ollama'

// Onboarding steps
export type OnboardingStep =
  | 'not_started'
  | 'whatsapp_connected'
  | 'business_info'
  | 'services'
  | 'availability'
  | 'policies'
  | 'receptionist_config'
  | 'plan_selection'
  | 'ready'
