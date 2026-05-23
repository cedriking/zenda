-- Performance indexes for Phase 3
-- Run these against the database for optimal query performance

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_created ON conversations (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_workspace_mode ON conversations (workspace_id, mode);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_workspace_created ON messages (workspace_id, created_at DESC);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_workspace_date ON appointments (workspace_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_workspace_status ON appointments (workspace_id, status);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_workspace_phone ON customers (workspace_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_workspace_name ON customers (workspace_id, name);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- Usage records
CREATE INDEX IF NOT EXISTS idx_usage_workspace_period ON usage_records (workspace_id, period_start, period_end);

-- Agent memory
CREATE INDEX IF NOT EXISTS idx_agent_memory_workspace_customer ON agent_memory (workspace_id, customer_id);

-- Knowledge base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_workspace ON knowledge_base_items (workspace_id);

-- Reminders
CREATE INDEX IF NOT EXISTS idx_reminders_status_scheduled ON reminders (status, scheduled_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_workspace ON notifications (workspace_id);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_created ON audit_logs (workspace_id, created_at DESC);

-- Provider usage
CREATE INDEX IF NOT EXISTS idx_provider_usage_workspace_created ON provider_usage (workspace_id, created_at DESC);
