-- Add queue priority enum and column
CREATE TYPE queue_priority AS ENUM ('emergency', 'reminder', 'notification', 'low');

ALTER TABLE outbound_queue ADD COLUMN priority queue_priority NOT NULL DEFAULT 'notification';

-- Add system_settings table for persistent kill switch and other runtime config
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed kill switch default
INSERT INTO system_settings (key, value) VALUES ('outbound_kill_switch', 'running')
  ON CONFLICT (key) DO NOTHING;
