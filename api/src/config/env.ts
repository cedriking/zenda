import { env } from 'elysia/env'

export const { DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, API_PORT } = env({
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgres://zenda:zenda_dev@localhost:5432/zenda',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  API_PORT: process.env.API_PORT ?? '3001',
})
