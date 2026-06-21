import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import type { TodoPriority, TodoStatus } from "@/lib/todos/constants";

export type TodoRow = {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  priority: TodoPriority;
  status: TodoStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoWithSubject = TodoRow & {
  subjectName: string | null;
  subjectColor: string | null;
  subjectIcon: string | null;
};

type SubjectJoin = {
  name: string;
  color: string;
  icon: string;
};

type TodoDbRow = {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: string | null;
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

function mapTodo(row: TodoDbRow): TodoWithSubject {
  const subject = resolveSubject(row.subjects);
  return {
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    title: row.title,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ? new Date(row.due_date) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    subjectName: subject?.name ?? null,
    subjectColor: subject?.color ?? null,
    subjectIcon: subject?.icon ?? null,
  };
}

const todoSelect = `
  id,
  user_id,
  subject_id,
  title,
  priority,
  status,
  due_date,
  created_at,
  updated_at,
  subjects (
    name,
    color,
    icon
  )
`;

export const listTodos = cache(
  async (userId: string, limit?: number): Promise<TodoWithSubject[]> => {
  const supabase = await createClient();
  let query = supabase
    .from("todos")
    .select(todoSelect)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw toDbError(error);
  }

  return (data as unknown as TodoDbRow[]).map(mapTodo);
  }
);

export async function getTodoById(userId: string, todoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", todoId)
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
    priority: data.priority as TodoPriority,
    status: data.status as TodoStatus,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
