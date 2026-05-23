import type { PlanTier, SetupType } from '../types/enums.js'

interface PlanConfig {
  name: string
  tier: PlanTier
  monthlyPriceCents: number
  activeContactsLimit: number
  calendarsStaffLimit: number
  locationsLimit: number
  setupType: SetupType
  retentionDays: number
  description: string
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  local_solo: {
    name: 'Solo',
    tier: 'local_solo',
    monthlyPriceCents: 2900,
    activeContactsLimit: 75,
    calendarsStaffLimit: 1,
    locationsLimit: 1,
    setupType: 'self_serve',
    retentionDays: 30,
    description: 'Solo — For very small appointment businesses',
  },
  local_starter: {
    name: 'Starter',
    tier: 'local_starter',
    monthlyPriceCents: 4900,
    activeContactsLimit: 200,
    calendarsStaffLimit: 2,
    locationsLimit: 1,
    setupType: 'self_serve',
    retentionDays: 60,
    description: 'Starter — For small businesses that want automated appointment conversations',
  },
  local_pro: {
    name: 'Pro',
    tier: 'local_pro',
    monthlyPriceCents: 8900,
    activeContactsLimit: 600,
    calendarsStaffLimit: 5,
    locationsLimit: 2,
    setupType: 'priority',
    retentionDays: 90,
    description: 'Pro — For businesses that depend on WhatsApp for scheduling',
  },
  local_business: {
    name: 'Business',
    tier: 'local_business',
    monthlyPriceCents: 14900,
    activeContactsLimit: 1200,
    calendarsStaffLimit: 10,
    locationsLimit: 3,
    setupType: 'assisted',
    retentionDays: 180,
    description: 'Business — For high-touch businesses with heavier scheduling needs',
  },
}

export const RECEPTIONIST_NAMES = [
  'Alex', 'Sami', 'Noa', 'Ari', 'Luca',
  'Nico', 'Kai', 'Eli', 'Mika', 'Cleo',
] as const

export const USAGE_WARNING_THRESHOLDS = {
  warn: 0.8,
  limit: 1.0,
} as const
