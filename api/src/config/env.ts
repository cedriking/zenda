export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://zenda:zenda_dev@localhost:5432/zenda'
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production'
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production'
export const API_PORT = process.env.API_PORT ?? '3001'
