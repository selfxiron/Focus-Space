"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById, listSubjects } from "@/lib/data/subjects";
import { createClient } from "@/lib/supabase/server";
import { SUBJECT_COLORS, SUBJECT_ICON_OPTIONS } from "@/lib/subjects/constants";
import { toDbError } from "@/lib/db/schema-error";

function revalidateSubjects() {
  revalidatePath("/");
  revalidatePath("/tracker");
  revalidatePath("/subjects");
  revalidatePath("/todos");
}

export async function getSubjectsAction() {
  const user = await requireUser();
  return listSubjects(user.id);
}

export async function createSubjectAction(input: {
  name: string;
  color: string;
  icon: string;
}) {
  const user = await requireUser();
  const name = input.name.trim();

  if (!name) {
    throw new Error("Name is required");
  }

  const color = SUBJECT_COLORS.includes(
    input.color as (typeof SUBJECT_COLORS)[number]
  )
    ? input.color
    : SUBJECT_COLORS[0];

  const icon = SUBJECT_ICON_OPTIONS.includes(input.icon)
    ? input.icon
    : "folder";

  const existing = await listSubjects(user.id);
  const maxOrder = existing.reduce(
    (max, s) => Math.max(max, s.sortOrder),
    -1
  );

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      user_id: user.id,
      name,
      color,
      icon,
      sort_order: maxOrder + 1,
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateSubjects();
  return data;
}

export async function updateSubjectAction(
  subjectId: string,
  input: { name: string; color: string; icon: string }
) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error("Name is required");
  }

  const color = SUBJECT_COLORS.includes(
    input.color as (typeof SUBJECT_COLORS)[number]
  )
    ? input.color
    : subject.color;

  const icon = SUBJECT_ICON_OPTIONS.includes(input.icon)
    ? input.icon
    : subject.icon;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .update({ name, color, icon })
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateSubjects();
  return data;
}

export async function deleteSubjectAction(subjectId: string) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    throw toDbError(error);
  }

  if (!data?.length) {
    throw new Error("Subject could not be deleted");
  }

  revalidateSubjects();
}
