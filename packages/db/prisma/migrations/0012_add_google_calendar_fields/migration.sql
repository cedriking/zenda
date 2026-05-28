-- Add external calendar event ID to appointments for Google Calendar sync
ALTER TABLE appointments ADD COLUMN external_calendar_event_id VARCHAR(255);

-- Add 'google' to integration_provider enum
ALTER TYPE "IntegrationProvider" ADD VALUE 'google';
