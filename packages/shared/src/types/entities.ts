import type {
  ActorType,
  AppointmentStatus,
  BillingPeriod,
  BusinessCategory,
  CancellationStrictness,
  ConsentSource,
  ConversationMode,
  EscalationReason,
  Language,
  MessageContentType,
  MessagePurpose,
  MessageStatus,
  MessagingConsentStatus,
  NotificationType,
  OnboardingStep,
  PersonalityPreset,
  PlanTier,
  ReceptionistTone,
  ReminderType,
  SenderType,
  SetupType,
  SubscriptionStatus,
  WhatsAppConnectionStatus,
} from "./enums.js";

// --- Auth & Users ---

export interface User {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  passwordHash: string;
  updatedAt: Date;
}

export interface Workspace {
  country: string;
  createdAt: Date;
  defaultLanguage: Language;
  id: string;
  name: string;
  onboardingCompletedAt: Date | null;
  onboardingStep: OnboardingStep;
  slug: string;
  timezone: string;
  updatedAt: Date;
}

export interface WorkspaceMember {
  createdAt: Date;
  id: string;
  role: "owner";
  userId: string;
  workspaceId: string;
}

// --- Billing ---

export interface Plan {
  activeContactsLimit: number;
  calendarsStaffLimit: number;
  id: string;
  locationsLimit: number;
  monthlyPriceCents: number;
  name: string;
  retentionDays: number;
  setupType: SetupType;
  tier: PlanTier;
}

export interface Subscription {
  billingPeriod: BillingPeriod;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  id: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: Date;
  workspaceId: string;
}

export interface UsageRecord {
  createdAt: Date;
  id: string;
  metric: string;
  periodEnd: Date;
  periodStart: Date;
  value: number;
  workspaceId: string;
}

// --- WhatsApp ---

export interface WhatsAppConnection {
  createdAt: Date;
  id: string;
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  phoneNumber: string | null;
  sessionData: string | null; // encrypted
  status: WhatsAppConnectionStatus;
  updatedAt: Date;
  workspaceId: string;
}

// --- Business Profile ---

export interface BusinessProfile {
  approvedCancellationText: string | null;
  approvedDiscountText: string | null;
  approvedRefundText: string | null;
  cancellationPolicy: string | null;
  cancellationWindowHours: number;
  category: BusinessCategory;
  createdAt: Date;
  depositAmountCents: number | null;
  depositRequired: boolean;
  description: string | null;
  emergencyEscalationInstructions: string | null;
  id: string;
  location: string | null;
  name: string;
  priceDisplayPreference: "show" | "hide" | "on_request";
  refundPolicy: string | null;
  reschedulingWindowHours: number;
  sensitiveTopics: string[];
  updatedAt: Date;
  workspaceId: string;
}

export interface ReceptionistProfile {
  cancellationPolicyStrictness: CancellationStrictness;
  concisenessLevel: number; // 1-5
  confirmsBeforeBooking: boolean;
  createdAt: Date;
  depositHandlingMode: string | null;
  discountHandlingMode: string | null;
  formalityLevel: number; // 1-5
  greetingStyle: string | null;
  greetingTemplate: string | null;
  id: string;
  name: string;
  notifyOwnerEveryAppointment: boolean;
  personalityPreset: PersonalityPreset;
  proactivelySuggestTimes: boolean;
  refundHandlingMode: string | null;
  speaksAsBusiness: boolean; // false = first person, true = "we"
  tone: ReceptionistTone;
  updatedAt: Date;
  useEmoji: boolean;
  warmthLevel: number; // 1-5
  workspaceId: string;
}

export interface EscalationRule {
  action: "escalate" | "clarify_first";
  reason: EscalationReason;
}

// --- Services & Staff ---

export interface Service {
  active: boolean;
  createdAt: Date;
  description: string | null;
  durationMinutes: number;
  id: string;
  name: string;
  priceCents: number | null;
  updatedAt: Date;
  workspaceId: string;
}

export interface StaffMember {
  active: boolean;
  createdAt: Date;
  id: string;
  name: string;
  serviceIds: string[];
  updatedAt: Date;
  workspaceId: string;
}

export interface AvailabilityRule {
  available: boolean;
  createdAt: Date;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  endTime: string; // HH:mm
  id: string;
  staffMemberId: string | null;
  startTime: string; // HH:mm
  updatedAt: Date;
  workspaceId: string;
}

// --- Appointments ---

export interface Appointment {
  cancelledAt: Date | null;
  completedAt: Date | null;
  confirmationStatus: "pending" | "confirmed" | "expired";
  createdAt: Date;
  createdBy: "ai" | "owner" | "system";
  customerId: string;
  endAt: Date;
  id: string;
  notes: string | null;
  reminderStatus: "none" | "scheduled" | "sent" | "confirmed";
  serviceId: string;
  sourceConversationId: string | null;
  staffMemberId: string | null;
  startAt: Date;
  status: AppointmentStatus;
  timezone: string;
  updatedAt: Date;
  workspaceId: string;
}

// --- Customers ---

export interface Customer {
  createdAt: Date;
  id: string;
  language: Language;
  name: string | null;
  notes: string | null;
  phoneNumber: string;
  updatedAt: Date;
  workspaceId: string;
}

// --- Conversations & Messages ---

export interface Conversation {
  assignedToOwner: Date | null;
  channel: "whatsapp";
  createdAt: Date;
  customerId: string;
  id: string;
  language: Language;
  lastMessageAt: Date;
  mode: ConversationMode;
  needsAttentionReason: string | null;
  summary: string | null;
  updatedAt: Date;
  workspaceId: string;
}

export interface Message {
  aiModel: string | null;
  aiProvider: string | null;
  body: string;
  contentType: MessageContentType;
  conversationId: string;
  createdAt: Date;
  externalMessageId: string | null;
  id: string;
  language: Language | null;
  senderType: SenderType;
  sentAt: Date | null;
  status: MessageStatus;
  toolCalls: unknown[] | null;
  workspaceId: string;
}

export interface ConversationSummary {
  conversationId: string;
  createdAt: Date;
  extractedPreferences: Record<string, string>;
  id: string;
  keyTopics: string[];
  summary: string;
}

// --- AI & Memory ---

export interface AgentMemory {
  createdAt: Date;
  customerId: string | null;
  id: string;
  key: string;
  source: "ai_extraction" | "owner_note" | "system";
  updatedAt: Date;
  value: string;
  workspaceId: string;
}

export interface KnowledgeBaseItem {
  answer: string;
  category: string;
  createdAt: Date;
  id: string;
  language: Language;
  question: string;
  updatedAt: Date;
  workspaceId: string;
}

// --- Reminders & Escalations ---

export interface Reminder {
  appointmentId: string;
  createdAt: Date;
  id: string;
  scheduledAt: Date;
  sentAt: Date | null;
  status: "pending" | "sent" | "delivered" | "failed";
}

export interface Escalation {
  conversationId: string;
  createdAt: Date;
  id: string;
  reason: EscalationReason;
  resolvedAt: Date | null;
  status: "open" | "resolved";
  workspaceId: string;
}

// --- Notifications ---

export interface Notification {
  body: string;
  createdAt: Date;
  id: string;
  readAt: Date | null;
  title: string;
  type: NotificationType;
  userId: string;
  workspaceId: string;
}

// --- Audit ---

export interface AuditLog {
  action: string;
  actorId: string | null;
  actorType: ActorType;
  createdAt: Date;
  entityId: string | null;
  entityType: string;
  id: string;
  metadata: Record<string, unknown> | null;
  workspaceId: string;
}

// --- Provider Usage ---

export interface ProviderUsage {
  costCents: number;
  createdAt: Date;
  id: string;
  inputTokens: number;
  model: string;
  outputTokens: number;
  provider: string;
  workspaceId: string;
}

// --- Audio ---

export interface AudioAsset {
  confidence: number | null;
  createdAt: Date;
  durationSeconds: number | null;
  id: string;
  language: Language | null;
  messageId: string | null;
  storageKey: string;
  transcript: string | null;
  workspaceId: string;
}

// --- Messaging & Consent (§8, §9, §10) ---

export interface MessagingConsent {
  allowedPurposes: MessagePurpose[];
  capturedAt: Date;
  createdAt: Date;
  customerId: string;
  id: string;
  lastInboundMessageAt: Date | null;
  lastOutboundMessageAt: Date | null;
  notes: string | null;
  phoneNumber: string;
  source: ConsentSource;
  status: MessagingConsentStatus;
  updatedAt: Date;
  workspaceId: string;
}

export interface OutboundMessageLog {
  conversationId: string | null;
  createdAt: Date;
  customerId: string;
  id: string;
  lastInboundAt: Date | null;
  lastOutboundAt: Date | null;
  outboundSinceLastInbound: number;
  purposeOfLastOutbound: MessagePurpose | null;
  updatedAt: Date;
  workspaceId: string;
}

export interface SentReminderLog {
  appointmentId: string;
  createdAt: Date;
  id: string;
  reminderType: ReminderType;
  sentAt: Date;
}

// --- Sending Policy Engine (§10) ---

export interface SendDecision {
  allowed: boolean;
  details?: {
    consentStatus: MessagingConsentStatus;
    outboundCount: number;
    maxOutbound: number;
    purposeAllowed: boolean;
    duplicateBlocked: boolean;
    appointmentValid: boolean;
  };
  reason?: string;
}

export interface AppointmentAuditEvent {
  action: string;
  actorId: string | null;
  actorType: ActorType;
  appointmentId: string;
  channel: string;
  channelProvider: string;
  createdAt: Date;
  id: string;
  metadata: Record<string, unknown> | null;
  workspaceId: string;
}

// --- Message Sender Interface (ZEN-11) ---

/**
 * Abstract interface for sending messages/events to a workspace.
 * Decouples the conversation engine from any specific channel transport.
 * Implementations: WebSocket (current), SMS, email, push, etc.
 */
export interface MessageSender {
  /**
   * Check whether a workspace is currently reachable.
   */
  isConnected(workspaceId: string): boolean;
  /**
   * Send an event payload to a connected workspace.
   * @returns true if delivered, false if workspace not connected
   */
  send(workspaceId: string, data: unknown): boolean;
}

// --- Outbound limits (§9) ---

export const OUTBOUND_LIMITS = {
  MAX_OUTBOUND_WITHOUT_REPLY: 3,
  MAX_REMINDERS_PER_APPOINTMENT: 2,
  MAX_FOLLOW_UPS: 1,
  FOLLOW_UP_DELAY_MS: 30 * 60 * 1000, // 30 minutes
  REMINDER_24H_BEFORE_MS: 24 * 60 * 60 * 1000,
  REMINDER_2H_BEFORE_MS: 2 * 60 * 60 * 1000,
} as const;
