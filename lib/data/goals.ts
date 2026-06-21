import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import { elapsedSecondsInPeriod } from "@/lib/time/duration";
import type { GoalPeriod } from "@/lib/goals/constants";
import { getPeriodStart } from "@/lib/time/period";
import { getActiveTimeEntry, type TimeEntryWithSubject } from "@/lib/data/time-entries";
import { getUserSettings } from "@/lib/data/user-settings";

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

async function getSecondsBySubjectForPeriods(
  userId: string,
  weeklySince: Date,
  monthlySince: Date,
  activeEntry: Awaited<ReturnType<typeof getActiveTimeEntry>>
): Promise<{ weekly: Map<string, number>; monthly: Map<string, number> }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .select("subject_id, start_time, end_time")
    .eq("user_id", userId)
    .not("end_time", "is", null)
    .gte("end_time", monthlySince.toISOString());

  if (error) {
    throw toDbError(error);
  }

  const weekly = new Map<string, number>();
  const monthly = new Map<string, number>();

  for (const row of data ?? []) {
    const start = new Date(row.start_time);
    const end = new Date(row.end_time!);
    const monthlySeconds = elapsedSecondsInPeriod(monthlySince, start, end);
    if (monthlySeconds > 0) {
      monthly.set(
        row.subject_id,
        (monthly.get(row.subject_id) ?? 0) + monthlySeconds
      );
    }
    const weeklySeconds = elapsedSecondsInPeriod(weeklySince, start, end);
    if (weeklySeconds > 0) {
      weekly.set(
        row.subject_id,
        (weekly.get(row.subject_id) ?? 0) + weeklySeconds
      );
    }
  }

  if (activeEntry) {
    const now = new Date();
    const monthlySeconds = elapsedSecondsInPeriod(
      monthlySince,
      new Date(activeEntry.startTime),
      now
    );
    if (monthlySeconds > 0) {
      monthly.set(
        activeEntry.subjectId,
        (monthly.get(activeEntry.subjectId) ?? 0) + monthlySeconds
      );
    }
    const weeklySeconds = elapsedSecondsInPeriod(
      weeklySince,
      new Date(activeEntry.startTime),
      now
    );
    if (weeklySeconds > 0) {
      weekly.set(
        activeEntry.subjectId,
        (weekly.get(activeEntry.subjectId) ?? 0) + weeklySeconds
      );
    }
  }

  return { weekly, monthly };
}

export type GoalsProgressOptions = {
  timezone?: string;
  activeEntry?: TimeEntryWithSubject | null;
};

export async function listGoalsWithProgress(
  userId: string,
  options?: GoalsProgressOptions
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

  const timezone =
    options?.timezone ?? (await getUserSettings(userId)).timezone;
  const now = new Date();
  const weeklySince = getPeriodStart("weekly", now, timezone);
  const monthlySince = getPeriodStart("monthly", now, timezone);

  const activeEntry =
    options?.activeEntry !== undefined
      ? options.activeEntry
      : await getActiveTimeEntry(userId);

  const { weekly: weeklySeconds, monthly: monthlySeconds } =
    await getSecondsBySubjectForPeriods(
      userId,
      weeklySince,
      monthlySince,
      activeEntry
    );

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
