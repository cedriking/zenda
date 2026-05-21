-- Add priority column to outbound_queue if not present (queue_priority type created in 0005)
ALTER TABLE outbound_queue ADD COLUMN IF NOT EXISTS priority "queue_priority" NOT NULL DEFAULT 'notification';
--> statement-breakpoint

-- Add system_settings table for persistent kill switch and other runtime config
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
--> statement-breakpoint

-- Seed kill switch default
INSERT INTO system_settings (key, value) VALUES ('outbound_kill_switch', 'running')
  ON CONFLICT (key) DO NOTHING;
