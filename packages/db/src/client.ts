import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

const connectionString = process.env.DATABASE_URL ?? 'postgres://zenda:zenda_dev@localhost:5432/zenda'

const isProduction = process.env.NODE_ENV === 'production'

const client = postgres(connectionString, {
  ssl: isProduction ? { rejectUnauthorized: true } : (process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined),
  connect_timeout: 10,
  max: 20,
  idle_timeout: 30,
})
export const db = drizzle(client, { schema })
