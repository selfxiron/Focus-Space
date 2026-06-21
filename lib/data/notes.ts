import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";

export type NoteRow = {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NoteWithSubject = NoteRow & {
  subjectName: string | null;
  subjectColor: string | null;
  subjectIcon: string | null;
};

type SubjectJoin = {
  name: string;
  color: string;
  icon: string;
};

type NoteDbRow = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  subjects: SubjectJoin | SubjectJoin[] | null;
};

function resolveSubject(
  subjects: SubjectJoin | SubjectJoin[] | null | undefined
): SubjectJoin | null {
  if (!subjects) return null;
  if (Array.isArray(subjects)) return subjects[0] ?? null;
  return subjects;
}

function mapNote(row: NoteDbRow): NoteWithSubject {
  const subject = resolveSubject(row.subjects);
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    title: row.title,
    content: row.content,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    subjectName: subject?.name ?? null,
    subjectColor: subject?.color ?? null,
    subjectIcon: subject?.icon ?? null,
  };
}

const noteSelect = `
  id,
  user_id,
  subject_id,
  title,
  content,
  created_at,
  updated_at,
  subjects (
    name,
    color,
    icon
  )
`;

export async function listNotes(userId: string): Promise<NoteWithSubject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select(noteSelect)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw toDbError(error);
  }

  return (data as unknown as NoteDbRow[]).map(mapNote);
}

export async function getNoteById(userId: string, noteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
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
    title: data.title,
    content: data.content,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
