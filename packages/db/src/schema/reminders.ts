import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { appointments } from "./appointments.js";

export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
]);

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: reminderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
