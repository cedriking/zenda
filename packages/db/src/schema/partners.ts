import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const partners = pgTable(
  "partners",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    website: varchar("website", { length: 500 }),
    referralCode: varchar("referral_code", { length: 20 }).notNull(),
    howRefer: text("how_refer"),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("partners_email_unique").on(table.email),
    uniqueIndex("partners_referral_code_unique").on(table.referralCode),
  ],
);
