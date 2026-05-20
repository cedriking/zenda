-- Add channel and channel_provider columns to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS channel VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS channel_provider VARCHAR(50);
