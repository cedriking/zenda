import type {
  AppointmentStatus,
  ConversationMode,
  WhatsAppConnectionStatus,
  SubscriptionStatus,
  PlanTier,
  SetupType,
  BillingPeriod,
  SenderType,
  MessageContentType,
  MessageStatus,
  ReceptionistTone,
  BusinessCategory,
  Language,
  EscalationReason,
  NotificationType,
  ActorType,
  OnboardingStep,
  MessagingConsentStatus,
  ConsentSource,
  MessagePurpose,
  WhatsAppChannelType,
  PersonalityPreset,
  CancellationStrictness,
  ReminderType,
} from './enums.js'

// --- Auth & Users ---

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  slug: string
  timezone: string
  country: string
  defaultLanguage: Language
  onboardingStep: OnboardingStep
  onboardingCompletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'owner'
  createdAt: Date
}

// --- Billing ---

export interface Plan {
  id: string
  tier: PlanTier
  name: string
  monthlyPriceCents: number
  activeContactsLimit: number
  calendarsStaffLimit: number
  locationsLimit: number
  setupType: SetupType
  retentionDays: number
}

export interface Subscription {
  id: string
  workspaceId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  planTier: PlanTier
  billingPeriod: BillingPeriod
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UsageRecord {
  id: string
  workspaceId: string
  metric: string
  value: number
  periodStart: Date
  periodEnd: Date
  createdAt: Date
}

// --- WhatsApp ---

export interface WhatsAppConnection {
  id: string
  workspaceId: string
  status: WhatsAppConnectionStatus
  phoneNumber: string | null
  sessionData: string | null // encrypted
  lastConnectedAt: Date | null
  lastDisconnectedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// --- Business Profile ---

export interface BusinessProfile {
  id: string
  workspaceId: string
  name: string
  category: BusinessCategory
  description: string | null
  location: string | null
  cancellationPolicy: string | null
  refundPolicy: string | null
  priceDisplayPreference: 'show' | 'hide' | 'on_request'
  cancellationWindowHours: number
  reschedulingWindowHours: number
  depositRequired: boolean
  depositAmountCents: number | null
  approvedCancellationText: string | null
  approvedRefundText: string | null
  approvedDiscountText: string | null
  emergencyEscalationInstructions: string | null
  sensitiveTopics: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ReceptionistProfile {
  id: string
  workspaceId: string
  name: string
  tone: ReceptionistTone
  greetingTemplate: string | null
  escalationRules: EscalationRule[]
  personalityPreset: PersonalityPreset
  greetingStyle: string | null
  formalityLevel: number       // 1-5
  concisenessLevel: number     // 1-5
  warmthLevel: number          // 1-5
  useEmoji: boolean
  speaksAsBusiness: boolean    // false = first person, true = "we"
  proactivelySuggestTimes: boolean
  confirmsBeforeBooking: boolean
  notifyOwnerEveryAppointment: boolean
  cancellationPolicyStrictness: CancellationStrictness
  refundHandlingMode: string | null
  discountHandlingMode: string | null
  depositHandlingMode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface EscalationRule {
  reason: EscalationReason
  action: 'escalate' | 'clarify_first'
}

// --- Services & Staff ---

export interface Service {
  id: string
  workspaceId: string
  name: string
  description: string | null
  durationMinutes: number
  priceCents: number | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface StaffMember {
  id: string
  workspaceId: string
  name: string
  serviceIds: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AvailabilityRule {
  id: string
  workspaceId: string
  staffMemberId: string | null
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // HH:mm
  endTime: string // HH:mm
  available: boolean
  createdAt: Date
  updatedAt: Date
}

// --- Appointments ---

export interface Appointment {
  id: string
  workspaceId: string
  customerId: string
  staffMemberId: string | null
  serviceId: string
  status: AppointmentStatus
  startAt: Date
  endAt: Date
  timezone: string
  sourceConversationId: string | null
  createdBy: 'ai' | 'owner' | 'system'
  confirmationStatus: 'pending' | 'confirmed' | 'expired'
  reminderStatus: 'none' | 'scheduled' | 'sent' | 'confirmed'
  notes: string | null
  createdAt: Date
  updatedAt: Date
  cancelledAt: Date | null
  completedAt: Date | null
}

// --- Customers ---

export interface Customer {
  id: string
  workspaceId: string
  phoneNumber: string
  name: string | null
  language: Language
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// --- Conversations & Messages ---

export interface Conversation {
  id: string
  workspaceId: string
  customerId: string
  channel: 'whatsapp'
  mode: ConversationMode
  lastMessageAt: Date
  language: Language
  assignedToOwner: boolean
  needsAttentionReason: string | null
  summary: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  workspaceId: string
  externalMessageId: string | null
  senderType: SenderType
  contentType: MessageContentType
  body: string
  language: Language | null
  aiProvider: string | null
  aiModel: string | null
  toolCalls: unknown[] | null
  status: MessageStatus
  createdAt: Date
  sentAt: Date | null
}

export interface ConversationSummary {
  id: string
  conversationId: string
  summary: string
  keyTopics: string[]
  extractedPreferences: Record<string, string>
  createdAt: Date
}

// --- AI & Memory ---

export interface AgentMemory {
  id: string
  workspaceId: string
  customerId: string | null
  key: string
  value: string
  source: 'ai_extraction' | 'owner_note' | 'system'
  createdAt: Date
  updatedAt: Date
}

export interface KnowledgeBaseItem {
  id: string
  workspaceId: string
  category: string
  question: string
  answer: string
  language: Language
  createdAt: Date
  updatedAt: Date
}

// --- Reminders & Escalations ---

export interface Reminder {
  id: string
  appointmentId: string
  scheduledAt: Date
  sentAt: Date | null
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  createdAt: Date
}

export interface Escalation {
  id: string
  conversationId: string
  workspaceId: string
  reason: EscalationReason
  status: 'open' | 'resolved'
  createdAt: Date
  resolvedAt: Date | null
}

// --- Notifications ---

export interface Notification {
  id: string
  workspaceId: string
  userId: string
  type: NotificationType
  title: string
  body: string
  readAt: Date | null
  createdAt: Date
}

// --- Audit ---

export interface AuditLog {
  id: string
  workspaceId: string
  actorType: ActorType
  actorId: string | null
  action: string
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

// --- Provider Usage ---

export interface ProviderUsage {
  id: string
  workspaceId: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  costCents: number
  createdAt: Date
}

// --- Audio ---

export interface AudioAsset {
  id: string
  messageId: string | null
  workspaceId: string
  storageKey: string
  durationSeconds: number | null
  transcript: string | null
  language: Language | null
  confidence: number | null
  createdAt: Date
}

// --- Messaging & Consent (§8, §9, §10) ---

export interface MessagingConsent {
  id: string
  workspaceId: string
  customerId: string
  phoneNumber: string
  status: MessagingConsentStatus
  source: ConsentSource
  allowedPurposes: MessagePurpose[]
  capturedAt: Date
  lastInboundMessageAt: Date | null
  lastOutboundMessageAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OutboundMessageLog {
  id: string
  workspaceId: string
  customerId: string
  conversationId: string | null
  outboundSinceLastInbound: number
  lastInboundAt: Date | null
  lastOutboundAt: Date | null
  purposeOfLastOutbound: MessagePurpose | null
  createdAt: Date
  updatedAt: Date
}

export interface SentReminderLog {
  id: string
  appointmentId: string
  reminderType: ReminderType
  sentAt: Date
  createdAt: Date
}

// --- Sending Policy Engine (§10) ---

export interface SendDecision {
  allowed: boolean
  reason?: string
  details?: {
    consentStatus: MessagingConsentStatus
    outboundCount: number
    maxOutbound: number
    purposeAllowed: boolean
    duplicateBlocked: boolean
    appointmentValid: boolean
  }
}

export interface AppointmentAuditEvent {
  id: string
  workspaceId: string
  appointmentId: string
  actorType: ActorType
  actorId: string | null
  action: string
  channel: string
  channelProvider: string
  metadata: Record<string, unknown> | null
  createdAt: Date
}

// --- Outbound limits (§9) ---

export const OUTBOUND_LIMITS = {
  MAX_OUTBOUND_WITHOUT_REPLY: 3,
  MAX_REMINDERS_PER_APPOINTMENT: 2,
  MAX_FOLLOW_UPS: 1,
  FOLLOW_UP_DELAY_MS: 30 * 60 * 1000, // 30 minutes
  REMINDER_24H_BEFORE_MS: 24 * 60 * 60 * 1000,
  REMINDER_2H_BEFORE_MS: 2 * 60 * 60 * 1000,
} as const
