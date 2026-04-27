import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index.js'

const connectionString = process.env.DATABASE_URL ?? 'postgres://zenda:zenda_dev@localhost:5432/zenda'

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
