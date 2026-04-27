import { relations } from 'drizzle-orm'
import { users } from './schema/users.js'
import { workspaces, workspaceMembers } from './schema/workspaces.js'
import { subscriptions, plans, usageRecords } from './schema/subscriptions.js'
import { whatsappConnections } from './schema/whatsapp-connections.js'
import { businessProfiles, receptionistProfiles } from './schema/business-profiles.js'
import { services, staffMembers, availabilityRules } from './schema/services.js'
import { appointments } from './schema/appointments.js'
import { customers } from './schema/customers.js'
import { conversations, messages, conversationSummaries } from './schema/conversations.js'
import { agentMemory, knowledgeBaseItems } from './schema/memory.js'
import { reminders } from './schema/reminders.js'
import { escalations } from './schema/escalations.js'
import { notifications } from './schema/notifications.js'
import { auditLogs } from './schema/audit-logs.js'
import { providerUsage } from './schema/provider-usage.js'
import { audioAssets } from './schema/audio-assets.js'

export const userRelations = relations(users, ({ many }) => ({
  workspaceMemberships: many(workspaceMembers),
  notifications: many(notifications),
}))

export const workspaceMemberRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}))

export const workspaceRelations = relations(workspaces, ({ many, one }) => ({
  members: many(workspaceMembers),
  subscription: one(subscriptions, { fields: [workspaces.id], references: [subscriptions.workspaceId] }),
  whatsappConnection: one(whatsappConnections, { fields: [workspaces.id], references: [whatsappConnections.workspaceId] }),
  businessProfile: one(businessProfiles, { fields: [workspaces.id], references: [businessProfiles.workspaceId] }),
  receptionistProfile: one(receptionistProfiles, { fields: [workspaces.id], references: [receptionistProfiles.workspaceId] }),
  services: many(services),
  staffMembers: many(staffMembers),
  availabilityRules: many(availabilityRules),
  appointments: many(appointments),
  customers: many(customers),
  conversations: many(conversations),
  usageRecords: many(usageRecords),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  providerUsage: many(providerUsage),
}))

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, { fields: [subscriptions.workspaceId], references: [workspaces.id] }),
}))

export const whatsappConnectionRelations = relations(whatsappConnections, ({ one }) => ({
  workspace: one(workspaces, { fields: [whatsappConnections.workspaceId], references: [workspaces.id] }),
}))

export const businessProfileRelations = relations(businessProfiles, ({ one }) => ({
  workspace: one(workspaces, { fields: [businessProfiles.workspaceId], references: [workspaces.id] }),
}))

export const receptionistProfileRelations = relations(receptionistProfiles, ({ one }) => ({
  workspace: one(workspaces, { fields: [receptionistProfiles.workspaceId], references: [workspaces.id] }),
}))

export const serviceRelations = relations(services, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [services.workspaceId], references: [workspaces.id] }),
  appointments: many(appointments),
}))

export const staffMemberRelations = relations(staffMembers, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [staffMembers.workspaceId], references: [workspaces.id] }),
  appointments: many(appointments),
  availabilityRules: many(availabilityRules),
}))

export const availabilityRuleRelations = relations(availabilityRules, ({ one }) => ({
  workspace: one(workspaces, { fields: [availabilityRules.workspaceId], references: [workspaces.id] }),
  staffMember: one(staffMembers, { fields: [availabilityRules.staffMemberId], references: [staffMembers.id] }),
}))

export const appointmentRelations = relations(appointments, ({ one }) => ({
  workspace: one(workspaces, { fields: [appointments.workspaceId], references: [workspaces.id] }),
  customer: one(customers, { fields: [appointments.customerId], references: [customers.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
  staffMember: one(staffMembers, { fields: [appointments.staffMemberId], references: [staffMembers.id] }),
  sourceConversation: one(conversations, { fields: [appointments.sourceConversationId], references: [conversations.id] }),
}))

export const customerRelations = relations(customers, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [customers.workspaceId], references: [workspaces.id] }),
  conversations: many(conversations),
  appointments: many(appointments),
  memory: many(agentMemory),
}))

export const conversationRelations = relations(conversations, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [conversations.workspaceId], references: [workspaces.id] }),
  customer: one(customers, { fields: [conversations.customerId], references: [customers.id] }),
  messages: many(messages),
  summaries: many(conversationSummaries),
  escalations: many(escalations),
}))

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  workspace: one(workspaces, { fields: [messages.workspaceId], references: [workspaces.id] }),
}))

export const conversationSummaryRelations = relations(conversationSummaries, ({ one }) => ({
  conversation: one(conversations, { fields: [conversationSummaries.conversationId], references: [conversations.id] }),
}))

export const agentMemoryRelations = relations(agentMemory, ({ one }) => ({
  workspace: one(workspaces, { fields: [agentMemory.workspaceId], references: [workspaces.id] }),
  customer: one(customers, { fields: [agentMemory.customerId], references: [customers.id] }),
}))

export const knowledgeBaseItemRelations = relations(knowledgeBaseItems, ({ one }) => ({
  workspace: one(workspaces, { fields: [knowledgeBaseItems.workspaceId], references: [workspaces.id] }),
}))

export const reminderRelations = relations(reminders, ({ one }) => ({
  appointment: one(appointments, { fields: [reminders.appointmentId], references: [appointments.id] }),
}))

export const escalationRelations = relations(escalations, ({ one }) => ({
  conversation: one(conversations, { fields: [escalations.conversationId], references: [conversations.id] }),
  workspace: one(workspaces, { fields: [escalations.workspaceId], references: [workspaces.id] }),
}))

export const notificationRelations = relations(notifications, ({ one }) => ({
  workspace: one(workspaces, { fields: [notifications.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}))

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, { fields: [auditLogs.workspaceId], references: [workspaces.id] }),
}))

export const providerUsageRelations = relations(providerUsage, ({ one }) => ({
  workspace: one(workspaces, { fields: [providerUsage.workspaceId], references: [workspaces.id] }),
}))

export const audioAssetRelations = relations(audioAssets, ({ one }) => ({
  message: one(messages, { fields: [audioAssets.messageId], references: [messages.id] }),
  workspace: one(workspaces, { fields: [audioAssets.workspaceId], references: [workspaces.id] }),
}))
