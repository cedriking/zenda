-- Add reminder schedule config to workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS reminder_schedule JSONB DEFAULT '[{"offsetHours": 24, "type": "reminder"}, {"offsetHours": 2, "type": "confirmation_prompt"}]';
