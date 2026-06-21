-- Focus Space initial schema + Row Level Security
-- Run in Supabase SQL Editor after linking DATABASE_URL

CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE todo_status AS ENUM ('backlog', 'in_progress', 'completed');
CREATE TYPE goal_period AS ENUM ('weekly', 'monthly');

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#14B8A6',
  icon TEXT NOT NULL DEFAULT 'folder',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  priority todo_priority NOT NULL DEFAULT 'medium',
  status todo_status NOT NULL DEFAULT 'backlog',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  target_hours INTEGER NOT NULL,
  period goal_period NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  work_minutes INTEGER NOT NULL,
  break_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_select" ON subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subjects_insert" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subjects_update" ON subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "subjects_delete" ON subjects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "time_entries_select" ON time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "time_entries_insert" ON time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "time_entries_update" ON time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "time_entries_delete" ON time_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "todos_select" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "todos_insert" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "todos_update" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "todos_delete" ON todos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "goals_select" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete" ON goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notes_select" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "pomodoro_select" ON pomodoro_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pomodoro_insert" ON pomodoro_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pomodoro_update" ON pomodoro_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pomodoro_delete" ON pomodoro_sessions FOR DELETE USING (auth.uid() = user_id);
