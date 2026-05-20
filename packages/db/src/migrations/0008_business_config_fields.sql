-- Add new business profile config fields

-- Staff assignment mode enum
CREATE TYPE staff_assignment_mode AS ENUM ('auto_assign', 'customer_chooses', 'manual_only');

-- New columns
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS minimum_notice_hours INTEGER NOT NULL DEFAULT 2;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS maximum_booking_window_days INTEGER NOT NULL DEFAULT 30;
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS staff_assignment_mode staff_assignment_mode NOT NULL DEFAULT 'auto_assign';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS escalation_behavior JSONB DEFAULT '{"autoPauseAi": true, "notificationChannel": "dashboard", "responseSlaMinutes": 30}';
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS owner_notification_preferences JSONB DEFAULT '{"appointmentBooked": true, "appointmentCancelled": true, "escalationCreated": true, "optOut": true}';
