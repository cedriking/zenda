export const en = {
  // App
  app: {
    name: 'Zenda',
    tagline: 'Your professional AI receptionist for WhatsApp',
  },
  // Auth
  auth: {
    login: 'Log in',
    signup: 'Create account',
    logout: 'Log out',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    businessName: 'Business name',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccount: 'Create your account',
    loginToAccount: 'Log in to your account',
  },
  // Dashboard
  dashboard: {
    title: 'Dashboard',
    todayAppointments: "Today's Appointments",
    needsAttention: 'Needs Attention',
    recentActivity: 'Recent Activity',
    activeConversations: 'Active Conversations',
    upcomingReminders: 'Upcoming Reminders',
    noAppointments: 'No appointments today',
    noConversations: 'No active conversations',
    newLeads: 'New leads',
    bookedThisWeek: 'Booked this week',
    responseTime: 'Response time',
    missedPrevented: 'Missed messages prevented',
  },
  // WhatsApp
  whatsapp: {
    connected: 'WhatsApp Connected',
    disconnected: 'WhatsApp Disconnected',
    connecting: 'Connecting...',
    scanQr: 'Scan QR Code',
    scanQrInstruction: 'Open WhatsApp on your phone > Settings > Linked Devices > Link a device',
    reconnect: 'Reconnect',
    connectionLost: 'WhatsApp connection lost',
    receptionistPaused: 'Receptionist paused — messages will not be auto-handled',
  },
  // Receptionist
  receptionist: {
    online: 'Receptionist Online',
    offline: 'Receptionist Offline',
    pause: 'Pause',
    resume: 'Resume',
    status: 'Receptionist Status',
    settings: 'Receptionist Settings',
    name: 'Receptionist Name',
    tone: 'Tone',
  },
  // Conversations
  conversations: {
    title: 'Conversations',
    all: 'All',
    needsAttention: 'Needs Attention',
    humanTakeover: 'Human Takeover',
    takeOver: 'Take Over',
    returnToAuto: 'Return to Auto',
    autoMode: 'Auto',
    paused: 'Paused',
    type: 'Type a message...',
    send: 'Send',
    noConversations: 'No conversations yet',
  },
  // Appointments
  appointments: {
    title: 'Appointments',
    calendar: 'Calendar',
    list: 'List',
    new: 'New Appointment',
    confirm: 'Confirm',
    reschedule: 'Reschedule',
    cancel: 'Cancel',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    service: 'Service',
    customer: 'Customer',
    staff: 'Staff',
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
    noShow: 'No Show',
  },
  // Settings
  settings: {
    title: 'Settings',
    businessProfile: 'Business Profile',
    services: 'Services',
    staff: 'Staff',
    availability: 'Availability',
    receptionist: 'Receptionist',
    knowledgeBase: 'Knowledge Base',
    notifications: 'Notifications',
    billing: 'Billing',
    addService: 'Add Service',
    addStaff: 'Add Staff',
    save: 'Save',
    cancel: 'Cancel',
  },
  // Plan
  plan: {
    starter: 'Starter',
    pro: 'Pro',
    business: 'Business',
    monthly: 'Monthly',
    annual: 'Annual',
    currentPlan: 'Current Plan',
    upgrade: 'Upgrade',
    manage: 'Manage Subscription',
  },
  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    confirm: 'Are you sure?',
  },
} as const

// DeepString replaces all string literals with `string` so translations can vary
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>
}

export type TranslationStrings = DeepString<typeof en>
