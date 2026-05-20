function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const DATABASE_URL = requireEnv('DATABASE_URL')
export const JWT_SECRET = requireEnv('JWT_SECRET')
export const JWT_REFRESH_SECRET = requireEnv('JWT_REFRESH_SECRET')
export const API_PORT = process.env.API_PORT ?? '3001'
export const ZAI_API_KEY = process.env.ZAI_API_KEY ?? ''
export const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? 'https://api.z.ai/api/coding/paas/v4'
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ''
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''
export const ADMIN_SECRET = process.env.ADMIN_SECRET ?? ''
export const CORS_ORIGINS = process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3000'
export const UPDATE_BASE_URL = process.env.UPDATE_BASE_URL ?? 'https://zenda.bot/updates'
export const NODE_ENV = process.env.NODE_ENV ?? 'development'

// Zernio Integration
export const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY ?? ''
export const ZERNIO_WEBHOOK_SECRET = process.env.ZERNIO_WEBHOOK_SECRET ?? ''
export const ZERNIO_WEBHOOK_URL = process.env.ZERNIO_WEBHOOK_URL ?? ''
export const ZERNIO_API_BASE_URL = process.env.ZERNIO_API_BASE_URL ?? 'https://zernio.com/api'

// Composio Integration
export const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? ''
export const COMPOSIO_BASE_URL = process.env.COMPOSIO_BASE_URL ?? 'https://api.composio.dev'
