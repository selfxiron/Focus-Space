-- Query performance indexes for common read patterns
-- Safe to re-run

CREATE INDEX IF NOT EXISTS time_entries_user_end_time_idx
  ON time_entries (user_id, end_time DESC)
  WHERE end_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS time_entries_user_active_idx
  ON time_entries (user_id)
  WHERE end_time IS NULL;

CREATE INDEX IF NOT EXISTS todos_user_updated_idx
  ON todos (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS notes_user_updated_idx
  ON notes (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS subjects_user_sort_idx
  ON subjects (user_id, sort_order);

NOTIFY pgrst, 'reload schema';
