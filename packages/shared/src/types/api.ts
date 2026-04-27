import type {
  AppointmentStatus,
  ConversationMode,
  WhatsAppConnectionStatus,
  PlanTier,
  BillingPeriod,
  MessageContentType,
  MessageStatus,
  SenderType,
  NotificationType,
  Language,
} from './enums.js'

// --- Auth DTOs ---

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
  }
  workspace: {
    id: string
    name: string
    slug: string
    planTier: PlanTier
    onboardingStep: string
  }
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  businessName: string
}

export type SignupResponse = LoginResponse

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

// --- Workspace DTOs ---

export interface UpdateWorkspaceRequest {
  name?: string
  timezone?: string
  country?: string
  defaultLanguage?: Language
}

// --- Appointment DTOs ---

export interface CreateAppointmentRequest {
  customerId: string
  serviceId: string
  staffMemberId?: string
  startAt: string
  timezone: string
  sourceConversationId?: string
  createdBy?: 'ai' | 'owner'
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus
  notes?: string
}

export interface RescheduleAppointmentRequest {
  newStartAt: string
  staffMemberId?: string
}

// --- Conversation DTOs ---

export interface UpdateConversationModeRequest {
  mode: ConversationMode
}

export interface SendMessageRequest {
  body: string
  contentType?: MessageContentType
}

// --- Business DTOs ---

export interface UpdateBusinessProfileRequest {
  name?: string
  category?: string
  description?: string
  location?: string
  cancellationPolicy?: string
  refundPolicy?: string
  priceDisplayPreference?: 'show' | 'hide' | 'on_request'
}

export interface UpdateReceptionistProfileRequest {
  name?: string
  tone?: string
  greetingTemplate?: string
}

// --- Service DTOs ---

export interface CreateServiceRequest {
  name: string
  description?: string
  durationMinutes: number
  priceCents?: number
}

export interface UpdateServiceRequest {
  name?: string
  description?: string
  durationMinutes?: number
  priceCents?: number
  active?: boolean
}

// --- Staff DTOs ---

export interface CreateStaffMemberRequest {
  name: string
  serviceIds?: string[]
}

export interface UpdateStaffMemberRequest {
  name?: string
  serviceIds?: string[]
  active?: boolean
}

// --- Availability DTOs ---

export interface CreateAvailabilityRuleRequest {
  staffMemberId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  available: boolean
}

export interface UpdateAvailabilityRuleRequest {
  startTime?: string
  endTime?: string
  available?: boolean
}

// --- Billing DTOs ---

export interface CreateCheckoutRequest {
  planTier: PlanTier
  billingPeriod: BillingPeriod
}

export interface CreateCheckoutResponse {
  checkoutUrl: string
  sessionId: string
}

// --- Usage DTOs ---

export interface UsageResponse {
  conversations: { used: number; limit: number; percentage: number }
  appointments: { used: number; limit: number; percentage: number }
  voiceMinutes: { used: number; limit: number; percentage: number }
  staff: { used: number; limit: number }
  periodStart: string
  periodEnd: string
}

// --- WebSocket Events ---

export interface WSMessageEvent {
  type: 'whatsapp.message'
  data: {
    phoneNumber: string
    body: string
    contentType: MessageContentType
    mediaUrl?: string
    timestamp: string
    externalMessageId?: string
  }
}

export interface WSStatusEvent {
  type: 'whatsapp.status'
  data: {
    status: WhatsAppConnectionStatus
    phoneNumber?: string
  }
}

export interface WSResponseEvent {
  type: 'response.send'
  data: {
    conversationId: string
    message: {
      id: string
      body: string
      senderType: SenderType
      contentType: MessageContentType
      status: MessageStatus
      createdAt: string
    }
    phoneNumber: string
  }
}

export interface WSNotificationEvent {
  type: 'notification'
  data: {
    id: string
    type: NotificationType
    title: string
    body: string
    createdAt: string
  }
}

export interface WSConversationUpdateEvent {
  type: 'conversation.update'
  data: {
    id: string
    mode: ConversationMode
    lastMessageAt: string
    needsAttentionReason: string | null
  }
}

export interface WSAppointmentUpdateEvent {
  type: 'appointment.update'
  data: {
    id: string
    status: AppointmentStatus
    startAt: string
    endAt: string
    customerId: string
    serviceId: string
  }
}

export type WSEvent =
  | WSMessageEvent
  | WSStatusEvent
  | WSResponseEvent
  | WSNotificationEvent
  | WSConversationUpdateEvent
  | WSAppointmentUpdateEvent

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
