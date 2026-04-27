import type { PlanTier } from '../types/enums.js'

interface PlanConfig {
  name: string
  tier: PlanTier
  monthlyPriceCents: number
  annualPriceCents: number
  conversationsLimit: number
  appointmentsLimit: number
  voiceMinutesLimit: number
  staffLimit: number
  retentionDays: number
  description: string
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    name: 'Starter',
    tier: 'starter',
    monthlyPriceCents: 2900, // $29/month
    annualPriceCents: 28800, // $24/month = $288/year
    conversationsLimit: 300,
    appointmentsLimit: 150,
    voiceMinutesLimit: 120,
    staffLimit: 1,
    retentionDays: 30,
    description: 'Solo Receptionist — Perfect for independent professionals',
  },
  pro: {
    name: 'Pro',
    tier: 'pro',
    monthlyPriceCents: 6900, // $69/month
    annualPriceCents: 70800, // $59/month = $708/year
    conversationsLimit: 1000,
    appointmentsLimit: 500,
    voiceMinutesLimit: 300,
    staffLimit: 5,
    retentionDays: 90,
    description: 'Team Receptionist — For small teams and growing businesses',
  },
  business: {
    name: 'Business',
    tier: 'business',
    monthlyPriceCents: 14900, // $149/month
    annualPriceCents: 142800, // $119/month = $1,428/year
    conversationsLimit: 3000,
    appointmentsLimit: 1500,
    voiceMinutesLimit: 800,
    staffLimit: 15,
    retentionDays: 180,
    description: 'Advanced Receptionist — For busy teams with higher volume',
  },
}

export const FOUNDING_PLANS: Record<PlanTier, { monthlyPriceCents: number; annualPriceCents: number }> = {
  starter: { monthlyPriceCents: 1900, annualPriceCents: 19000 },
  pro: { monthlyPriceCents: 4900, annualPriceCents: 49000 },
  business: { monthlyPriceCents: 9900, annualPriceCents: 99000 },
}

export const RECEPTIONIST_NAMES = [
  'Alex', 'Sami', 'Noa', 'Ari', 'Luca',
  'Nico', 'Kai', 'Eli', 'Mika', 'Cleo',
] as const

export const USAGE_WARNING_THRESHOLDS = {
  warn: 0.8,
  critical: 0.95,
  limit: 1.0,
  gracePeriodDays: 7,
} as const
