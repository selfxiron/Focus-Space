import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SUBJECTS } from "@/lib/db/schema";
import { toDbError } from "@/lib/db/schema-error";

export type SubjectRow = {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: Date;
};

type SubjectDbRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

function mapSubject(row: SubjectDbRow): SubjectRow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
  };
}

export async function ensureDefaultSubjects(userId: string) {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw toDbError(countError);
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const { error } = await supabase.from("subjects").insert(
    DEFAULT_SUBJECTS.map((subject) => ({
      user_id: userId,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      sort_order: subject.sortOrder,
    }))
  );

  if (error) {
    throw toDbError(error);
  }
}

export async function listSubjects(userId: string) {
  await ensureDefaultSubjects(userId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order");

  if (error) {
    throw toDbError(error);
  }

  return (data as SubjectDbRow[]).map(mapSubject);
}

export async function getSubjectById(userId: string, subjectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as SubjectDbRow;
  if (row.user_id !== userId) {
    return null;
  }

  return mapSubject(row);
}
