-- Final cleanup: drop remaining orphaned columns
-- Migration 0013

-- 1. audit_logs: drop orphaned "source" column (renamed to "channel_provider" in 0012 but original still exists)
ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "source";
--> statement-breakpoint

-- 2. workspaces: drop orphaned zernio_* columns (replaced by composio_* columns)
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "zernio_account_id";
--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "zernio_access_token";
--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "zernio_connected_at";
