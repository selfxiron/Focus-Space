import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";

export type TimeEntryWithSubject = {
  id: string;
  userId: string;
  subjectId: string;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  note: string | null;
  createdAt: Date;
  subjectName: string;
  subjectColor: string;
  subjectIcon: string;
};

type SubjectJoin = {
  name: string;
  color: string;
  icon: string;
};

type TimeEntryDbRow = {
  id: string;
  user_id: string;
  subject_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
  subjects: SubjectJoin | SubjectJoin[] | null;
};

function resolveSubject(
  subjects: SubjectJoin | SubjectJoin[] | null | undefined
): SubjectJoin | null {
  if (!subjects) return null;
  if (Array.isArray(subjects)) return subjects[0] ?? null;
  return subjects;
}

function mapTimeEntry(row: TimeEntryDbRow): TimeEntryWithSubject {
  const subject = resolveSubject(row.subjects);
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : null,
    durationMinutes: row.duration_minutes,
    note: row.note,
    createdAt: new Date(row.created_at),
    subjectName: subject?.name ?? "Unknown",
    subjectColor: subject?.color ?? "#14B8A6",
    subjectIcon: subject?.icon ?? "folder",
  };
}

const entrySelect = `
  id,
  user_id,
  subject_id,
  start_time,
  end_time,
  duration_minutes,
  note,
  created_at,
  subjects (
    name,
    color,
    icon
  )
`;

export async function getActiveTimeEntry(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select(entrySelect)
    .eq("user_id", userId)
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw toDbError(error);
  }

  if (!data) {
    return null;
  }

  return mapTimeEntry(data as unknown as TimeEntryDbRow);
}

export async function listRecentTimeEntries(
  userId: string,
  limit = 50
): Promise<TimeEntryWithSubject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select(entrySelect)
    .eq("user_id", userId)
    .order("start_time", { ascending: false })
    .limit(limit);

  if (error) {
    throw toDbError(error);
  }

  return (data as unknown as TimeEntryDbRow[]).map(mapTimeEntry);
}

export async function getTimeEntryById(userId: string, entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("id", entryId)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.user_id !== userId) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    subjectId: data.subject_id,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : null,
    durationMinutes: data.duration_minutes,
    note: data.note,
    createdAt: new Date(data.created_at),
  };
}
