import { z } from 'zod'

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Invalid email address'),
  password: passwordSchema,
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  language: z.enum(['en', 'es']).default('en'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
