import { z } from 'zod'
import type { BusinessCategory, ReceptionistTone } from '../types/enums.js'

export const updateBusinessProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  category: z.enum([
    'beauty',
    'wellness',
    'health',
    'coaching',
    'fitness',
    'other',
  ] as [BusinessCategory, ...BusinessCategory[]]).optional(),
  description: z.string().max(500).optional(),
  location: z.string().max(300).optional(),
  cancellationPolicy: z.string().max(1000).optional(),
  refundPolicy: z.string().max(1000).optional(),
  priceDisplayPreference: z.enum(['show', 'hide', 'on_request']).optional(),
})

export const updateReceptionistProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  tone: z.enum([
    'professional',
    'warm',
    'friendly',
    'elegant',
    'casual',
  ] as [ReceptionistTone, ...ReceptionistTone[]]).optional(),
  greetingTemplate: z.string().max(500).optional(),
})

export const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0).optional(),
})

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  priceCents: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export const createStaffMemberSchema = z.object({
  name: z.string().min(1).max(100),
  serviceIds: z.array(z.uuid()).optional().default([]),
})

export const updateStaffMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  serviceIds: z.array(z.uuid()).optional(),
  active: z.boolean().optional(),
})

export const createAvailabilityRuleSchema = z.object({
  staffMemberId: z.uuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  available: z.boolean().optional().default(true),
})

export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>
export type UpdateReceptionistProfileInput = z.infer<typeof updateReceptionistProfileSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type CreateStaffMemberInput = z.infer<typeof createStaffMemberSchema>
export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>
export type CreateAvailabilityRuleInput = z.infer<typeof createAvailabilityRuleSchema>
