import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import { elapsedSecondsInPeriod } from "@/lib/time/duration";
import type { GoalPeriod } from "@/lib/goals/constants";
import { getPeriodStart } from "@/lib/time/period";
import { getActiveTimeEntry } from "@/lib/data/time-entries";

export type GoalRow = {
  id: string;
  userId: string;
  subjectId: string;
  targetHours: number;
  period: GoalPeriod;
  createdAt: Date;
};

export type GoalWithProgress = GoalRow & {
  subjectName: string;
  subjectColor: string;
  subjectIcon: string;
  actualHours: number;
  progressPercent: number;
};

type SubjectJoin = {
  name: string;
  color: string;
  icon: string;
};

type GoalDbRow = {
  id: string;
  user_id: string;
  subject_id: string;
  target_hours: number;
  period: GoalPeriod;
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

async function getSecondsBySubjectSince(
  userId: string,
  since: Date,
  activeEntry: Awaited<ReturnType<typeof getActiveTimeEntry>>
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select("subject_id, duration_minutes, start_time, end_time")
    .eq("user_id", userId)
    .gte("end_time", since.toISOString());

  if (error) {
    throw toDbError(error);
  }

  const totals = new Map<string, number>();

  for (const row of data ?? []) {
    const seconds = elapsedSecondsInPeriod(
      since,
      new Date(row.start_time),
      new Date(row.end_time!)
    );
    totals.set(row.subject_id, (totals.get(row.subject_id) ?? 0) + seconds);
  }

  if (activeEntry) {
    const now = new Date();
    const seconds = elapsedSecondsInPeriod(
      since,
      new Date(activeEntry.startTime),
      now
    );
    totals.set(
      activeEntry.subjectId,
      (totals.get(activeEntry.subjectId) ?? 0) + seconds
    );
  }

  return totals;
}

export async function listGoalsWithProgress(
  userId: string
): Promise<GoalWithProgress[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select(
      `
      id,
      user_id,
      subject_id,
      target_hours,
      period,
      created_at,
      subjects (
        name,
        color,
        icon
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw toDbError(error);
  }

  const now = new Date();
  const weeklySince = getPeriodStart("weekly", now);
  const monthlySince = getPeriodStart("monthly", now);

  const activeEntry = await getActiveTimeEntry(userId);

  const [weeklySeconds, monthlySeconds] = await Promise.all([
    getSecondsBySubjectSince(userId, weeklySince, activeEntry),
    getSecondsBySubjectSince(userId, monthlySince, activeEntry),
  ]);

  return (data as unknown as GoalDbRow[]).map((row) => {
    const subject = resolveSubject(row.subjects);
    const secondsMap =
      row.period === "weekly" ? weeklySeconds : monthlySeconds;
    const seconds = secondsMap.get(row.subject_id) ?? 0;
    const actualHours = seconds / 3600;
    const progressPercent =
      row.target_hours > 0
        ? Math.min(100, Math.round((actualHours / row.target_hours) * 100))
        : 0;

    return {
      id: row.id,
      userId: row.user_id,
      subjectId: row.subject_id,
      targetHours: row.target_hours,
      period: row.period,
      createdAt: new Date(row.created_at),
      subjectName: subject?.name ?? "Unknown",
      subjectColor: subject?.color ?? "#14B8A6",
      subjectIcon: subject?.icon ?? "folder",
      actualHours,
      progressPercent,
    };
  });
}

export async function getGoalById(userId: string, goalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
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
    targetHours: data.target_hours,
    period: data.period as GoalPeriod,
    createdAt: new Date(data.created_at),
  };
}
