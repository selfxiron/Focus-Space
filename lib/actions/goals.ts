"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById } from "@/lib/data/subjects";
import { getGoalById } from "@/lib/data/goals";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import { GOAL_PERIODS, type GoalPeriod } from "@/lib/goals/constants";

function revalidateGoals() {
  revalidatePath("/");
  revalidatePath("/subjects");
}

export async function createGoalAction(input: {
  subjectId: string;
  targetHours: number;
  period?: GoalPeriod;
}) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, input.subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const targetHours = Math.round(input.targetHours);
  if (targetHours < 1 || targetHours > 168) {
    throw new Error("Target must be between 1 and 168 hours");
  }

  const period = GOAL_PERIODS.includes(input.period ?? "weekly")
    ? (input.period ?? "weekly")
    : "weekly";

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("subject_id", input.subjectId)
    .eq("period", period)
    .maybeSingle();

  if (existing) {
    throw new Error("A goal for this subject and period already exists");
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: user.id,
      subject_id: input.subjectId,
      target_hours: targetHours,
      period,
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateGoals();
  return data;
}

export async function updateGoalAction(
  goalId: string,
  input: { targetHours?: number; period?: GoalPeriod }
) {
  const user = await requireUser();
  const goal = await getGoalById(user.id, goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  const updates: Record<string, unknown> = {};

  if (input.targetHours !== undefined) {
    const targetHours = Math.round(input.targetHours);
    if (targetHours < 1 || targetHours > 168) {
      throw new Error("Target must be between 1 and 168 hours");
    }
    updates.target_hours = targetHours;
  }

  if (input.period !== undefined) {
    updates.period = GOAL_PERIODS.includes(input.period)
      ? input.period
      : goal.period;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateGoals();
  return data;
}

export async function deleteGoalAction(goalId: string) {
  const user = await requireUser();
  const goal = await getGoalById(user.id, goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    throw toDbError(error);
  }

  if (!data?.length) {
    throw new Error("Goal could not be deleted");
  }

  revalidateGoals();
}
