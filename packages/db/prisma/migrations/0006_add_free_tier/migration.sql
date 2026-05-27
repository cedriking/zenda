-- Add 'free' to plan_tier enum
ALTER TYPE "plan_tier" ADD VALUE IF NOT EXISTS 'free' BEFORE 'local_solo';

-- Update default plan to 'free' for new subscriptions
ALTER TABLE "subscriptions" ALTER COLUMN "plan_tier" SET DEFAULT 'free';
