"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById } from "@/lib/data/subjects";
import { getNoteById } from "@/lib/data/notes";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";

function revalidateNotes() {
  revalidatePath("/");
  revalidatePath("/notes");
}

export async function createNoteAction(input?: {
  title?: string;
  subjectId?: string | null;
}) {
  const user = await requireUser();
  const title = input?.title?.trim() || "Untitled";

  const subjectId: string | null = input?.subjectId ?? null;
  if (subjectId) {
    const subject = await getSubjectById(user.id, subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title,
      content: "",
      subject_id: subjectId,
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateNotes();
  return data;
}

export async function updateNoteAction(
  noteId: string,
  input: {
    title?: string;
    content?: string;
    subjectId?: string | null;
  }
) {
  const user = await requireUser();
  const note = await getNoteById(user.id, noteId);

  if (!note) {
    throw new Error("Note not found");
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

  if (input.content !== undefined) {
    updates.content = input.content;
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateNotes();
  return data;
}

export async function deleteNoteAction(noteId: string) {
  const user = await requireUser();
  const note = await getNoteById(user.id, noteId);

  if (!note) {
    throw new Error("Note not found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    throw toDbError(error);
  }

  if (!data?.length) {
    throw new Error("Note could not be deleted");
  }

  revalidateNotes();
}
