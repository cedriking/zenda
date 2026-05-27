-- Prevent double-booking: exclusion constraint on active appointments
-- Only applies to non-terminal statuses (not cancelled, completed, or no_show)
-- Uses btree_gist extension for range overlap detection

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Partial exclusion constraint: for active appointments with a staff member,
-- no two appointments for the same workspace + staff can overlap in time.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'prevent_double_booking') THEN
    ALTER TABLE appointments
      ADD CONSTRAINT prevent_double_booking
      EXCLUDE USING gist (
        workspace_id WITH =,
        staff_member_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      ) WHERE (
        staff_member_id IS NOT NULL
        AND status NOT IN ('cancelled', 'completed', 'no_show')
      );
  END IF;
END $$;

-- Index to support the overlap query used in the application-level check
CREATE INDEX IF NOT EXISTS idx_appointments_overlap_check
  ON appointments (workspace_id, staff_member_id, start_at, end_at)
  WHERE status NOT IN ('cancelled', 'completed', 'no_show');
