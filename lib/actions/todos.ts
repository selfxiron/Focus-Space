"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById } from "@/lib/data/subjects";
import { getTodoById } from "@/lib/data/todos";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import {
  TODO_PRIORITIES,
  TODO_STATUSES,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/todos/constants";

function revalidateTodos() {
  revalidatePath("/");
  revalidatePath("/todos");
}

export async function createTodoAction(input: {
  title: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  subjectId?: string | null;
  dueDate?: string | null;
}) {
  const user = await requireUser();
  const title = input.title.trim();

  if (!title) {
    throw new Error("Title is required");
  }

  const priority = TODO_PRIORITIES.includes(input.priority ?? "medium")
    ? (input.priority ?? "medium")
    : "medium";

  const status = TODO_STATUSES.includes(input.status ?? "backlog")
    ? (input.status ?? "backlog")
    : "backlog";

  const subjectId = input.subjectId ?? null;
  if (subjectId) {
    const subject = await getSubjectById(user.id, subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title,
      priority,
      status,
      subject_id: subjectId,
      due_date: input.dueDate ?? null,
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateTodos();
  return data;
}

export async function updateTodoAction(
  todoId: string,
  input: {
    title?: string;
    priority?: TodoPriority;
    status?: TodoStatus;
    subjectId?: string | null;
    dueDate?: string | null;
  }
) {
  const user = await requireUser();
  const todo = await getTodoById(user.id, todoId);

  if (!todo) {
    throw new Error("Task not found");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) {
      throw new Error("Title is required");
    }
    updates.title = title;
  }

  if (input.priority !== undefined) {
    updates.priority = TODO_PRIORITIES.includes(input.priority)
      ? input.priority
      : todo.priority;
  }

  if (input.status !== undefined) {
    updates.status = TODO_STATUSES.includes(input.status)
      ? input.status
      : todo.status;
  }

  if (input.subjectId !== undefined) {
    if (input.subjectId) {
      const subject = await getSubjectById(user.id, input.subjectId);
      if (!subject) {
        throw new Error("Subject not found");
      }
      updates.subject_id = input.subjectId;
    } else {
      updates.subject_id = null;
    }
  }

  if (input.dueDate !== undefined) {
    updates.due_date = input.dueDate;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .update(updates)
    .eq("id", todoId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateTodos();
  return data;
}

export async function updateTodoStatusAction(todoId: string, status: TodoStatus) {
  return updateTodoAction(todoId, { status });
}

export async function deleteTodoAction(todoId: string) {
  const user = await requireUser();
  const todo = await getTodoById(user.id, todoId);

  if (!todo) {
    throw new Error("Task not found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    throw toDbError(error);
  }

  if (!data?.length) {
    throw new Error("Task could not be deleted");
  }

  revalidateTodos();
}
