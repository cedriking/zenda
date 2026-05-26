import type {
  AppointmentStatus,
  BillingPeriod,
  ConversationMode,
  Language,
  MessageContentType,
  MessageStatus,
  NotificationType,
  PlanTier,
  SenderType,
  WhatsAppConnectionStatus,
} from "./enums.js";

// --- Auth DTOs ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    planTier: PlanTier;
    onboardingStep: string;
  };
}

export interface SignupRequest {
  businessName: string;
  email: string;
  name: string;
  password: string;
}

export type SignupResponse = LoginResponse;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// --- Workspace DTOs ---

export interface UpdateWorkspaceRequest {
  country?: string;
  defaultLanguage?: Language;
  name?: string;
  timezone?: string;
}

// --- Appointment DTOs ---

export interface CreateAppointmentRequest {
  createdBy?: "ai" | "owner";
  customerId: string;
  serviceId: string;
  sourceConversationId?: string;
  staffMemberId?: string;
  startAt: string;
  timezone: string;
}

export interface UpdateAppointmentStatusRequest {
  notes?: string;
  status: AppointmentStatus;
}

export interface RescheduleAppointmentRequest {
  newStartAt: string;
  staffMemberId?: string;
}

// --- Conversation DTOs ---

export interface UpdateConversationModeRequest {
  mode: ConversationMode;
}

export interface SendMessageRequest {
  body: string;
  contentType?: MessageContentType;
}

// --- Business DTOs ---

export interface UpdateBusinessProfileRequest {
  cancellationPolicy?: string;
  category?: string;
  description?: string;
  location?: string;
  name?: string;
  priceDisplayPreference?: "show" | "hide" | "on_request";
  refundPolicy?: string;
}

export interface UpdateReceptionistProfileRequest {
  greetingTemplate?: string;
  name?: string;
  tone?: string;
}

// --- Service DTOs ---

export interface CreateServiceRequest {
  description?: string;
  durationMinutes: number;
  name: string;
  priceCents?: number;
}

export interface UpdateServiceRequest {
  active?: boolean;
  description?: string;
  durationMinutes?: number;
  name?: string;
  priceCents?: number;
}

// --- Staff DTOs ---

export interface CreateStaffMemberRequest {
  name: string;
  serviceIds?: string[];
}

export interface UpdateStaffMemberRequest {
  active?: boolean;
  name?: string;
  serviceIds?: string[];
}

// --- Availability DTOs ---

export interface CreateAvailabilityRuleRequest {
  available: boolean;
  dayOfWeek: number;
  endTime: string;
  staffMemberId?: string;
  startTime: string;
}

export interface UpdateAvailabilityRuleRequest {
  available?: boolean;
  endTime?: string;
  startTime?: string;
}

// --- Billing DTOs ---

export interface CreateCheckoutRequest {
  billingPeriod: BillingPeriod;
  planTier: PlanTier;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

// --- Usage DTOs ---

export interface UsageResponse {
  appointments: { used: number; limit: number; percentage: number };
  conversations: { used: number; limit: number; percentage: number };
  periodEnd: string;
  periodStart: string;
  staff: { used: number; limit: number };
  voiceMinutes: { used: number; limit: number; percentage: number };
}

// --- WebSocket Events ---

export interface WSMessageEvent {
  data: {
    phoneNumber: string;
    body: string;
    contentType: MessageContentType;
    mediaUrl?: string;
    timestamp: string;
    externalMessageId?: string;
  };
  type: "whatsapp.message";
}

export interface WSStatusEvent {
  data: {
    status: WhatsAppConnectionStatus;
    phoneNumber?: string;
  };
  type: "whatsapp.status";
}

export interface WSResponseEvent {
  data: {
    conversationId: string;
    message: {
      id: string;
      body: string;
      senderType: SenderType;
      contentType: MessageContentType;
      status: MessageStatus;
      createdAt: string;
    };
    phoneNumber: string;
  };
  type: "response.send";
}

export interface WSNotificationEvent {
  data: {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    createdAt: string;
  };
  type: "notification";
}

export interface WSConversationUpdateEvent {
  data: {
    id: string;
    mode: ConversationMode;
    lastMessageAt: string;
    needsAttentionReason: string | null;
  };
  type: "conversation.update";
}

export interface WSAppointmentUpdateEvent {
  data: {
    id: string;
    status: AppointmentStatus;
    startAt: string;
    endAt: string;
    customerId: string;
    serviceId: string;
  };
  type: "appointment.update";
}

export type WSEvent =
  | WSMessageEvent
  | WSStatusEvent
  | WSResponseEvent
  | WSNotificationEvent
  | WSConversationUpdateEvent
  | WSAppointmentUpdateEvent;

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  page: number;
  pageSize: number;
  total: number;
}
