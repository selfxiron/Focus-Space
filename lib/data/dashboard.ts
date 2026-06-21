import { listGoalsWithProgress } from "@/lib/data/goals";
import { listSubjects } from "@/lib/data/subjects";
import {
  getActiveTimeEntry,
  listRecentTimeEntries,
  type TimeEntryWithSubject,
} from "@/lib/data/time-entries";
import { listTodos } from "@/lib/data/todos";
import {
  elapsedBetween,
  elapsedSecondsInPeriod,
  formatDurationSeconds,
} from "@/lib/time/duration";
import { getPeriodStart } from "@/lib/time/period";
import { formatHours } from "@/lib/utils";

export type DashboardStat = {
  label: string;
  value: string;
  subtitle?: string;
  pastel: "peach" | "mint" | "lavender" | "sky";
};

export type DashboardSession = {
  subject: string;
  duration: string;
  ago: string;
  color: string;
};

export type DashboardSubjectHours = {
  id: string;
  name: string;
  hours: string;
  color: string;
  icon: string;
};

export type DashboardChartDay = {
  day: string;
  hours: number;
  label: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  recentSessions: DashboardSession[];
  subjectHours: DashboardSubjectHours[];
  chart7d: DashboardChartDay[];
  chart14d: DashboardChartDay[];
  todos: Awaited<ReturnType<typeof listTodos>>;
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function hoursPerDay(
  entries: TimeEntryWithSubject[],
  days: number,
  now = new Date()
): DashboardChartDay[] {
  const result: DashboardChartDay[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    let seconds = 0;
    for (const entry of entries) {
      if (!entry.endTime) continue;
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      if (end <= dayStart || start >= dayEnd) continue;
      const effectiveStart =
        start.getTime() < dayStart.getTime() ? dayStart : start;
      const effectiveEnd =
        end.getTime() > dayEnd.getTime() ? dayEnd : end;
      seconds += elapsedBetween(effectiveStart, effectiveEnd).seconds;
    }

    result.push({
      day: dayStart.toLocaleDateString(undefined, { weekday: "short" }),
      label: dayStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      hours: Math.round((seconds / 3600) * 10) / 10,
    });
  }

  return result;
}

function studyStreakDays(entries: TimeEntryWithSubject[]): number {
  const daysWithStudy = new Set<string>();

  for (const entry of entries) {
    if (!entry.endTime) continue;
    const d = new Date(entry.endTime);
    daysWithStudy.add(
      `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    );
  }

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (daysWithStudy.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [entries, todos, goals, subjects, activeTimer] = await Promise.all([
    listRecentTimeEntries(userId, 200),
    listTodos(userId),
    listGoalsWithProgress(userId),
    listSubjects(userId),
    getActiveTimeEntry(userId),
  ]);

  const now = new Date();
  const weekStart = getPeriodStart("weekly", now);

  let totalSeconds = 0;
  let weekSeconds = 0;

  for (const entry of entries) {
    if (entry.endTime) {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      totalSeconds += elapsedBetween(start, end).seconds;
      weekSeconds += elapsedSecondsInPeriod(weekStart, start, end);
    }
  }

  if (activeTimer) {
    const start = new Date(activeTimer.startTime);
    weekSeconds += elapsedSecondsInPeriod(weekStart, start, now);
    totalSeconds += elapsedBetween(start, now).seconds;
  }

  const weeklyGoals = goals.filter((g) => g.period === "weekly");
  const goalTargetHours = weeklyGoals.reduce((s, g) => s + g.targetHours, 0);
  const goalActualHours = weeklyGoals.reduce((s, g) => s + g.actualHours, 0);
  const goalPercent =
    goalTargetHours > 0
      ? Math.min(100, Math.round((goalActualHours / goalTargetHours) * 100))
      : 0;

  const completedTodos = todos.filter((t) => t.status === "completed").length;
  const openTodos = todos.filter((t) => t.status !== "completed").length;
  const streak = studyStreakDays(entries);

  const stats: DashboardStat[] = [
    {
      label: "Total Study Hours",
      value: `${formatHours(totalSeconds / 3600)}h`,
      subtitle: `${formatHours(weekSeconds / 3600)}h this week`,
      pastel: "peach",
    },
    {
      label: "Weekly Goals",
      value: weeklyGoals.length ? `${goalPercent}%` : "—",
      subtitle: weeklyGoals.length
        ? `${formatHours(goalActualHours)}h of ${goalTargetHours}h target`
        : "Set goals on Subjects",
      pastel: "mint",
    },
    {
      label: "Tasks Done",
      value: String(completedTodos),
      subtitle: `${openTodos} remaining`,
      pastel: "lavender",
    },
    {
      label: "Current Streak",
      value: streak ? `${streak} day${streak === 1 ? "" : "s"}` : "0 days",
      subtitle: "Days with tracked study",
      pastel: "sky",
    },
  ];

  const recentSessions: DashboardSession[] = entries
    .filter((e) => e.endTime)
    .slice(0, 4)
    .map((entry) => ({
      subject: entry.subjectName,
      duration: formatDurationSeconds(
        elapsedBetween(
          new Date(entry.startTime),
          new Date(entry.endTime!)
        ).seconds
      ),
      ago: formatTimeAgo(new Date(entry.endTime!)),
      color: entry.subjectColor,
    }));

  const subjectSeconds = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.endTime) continue;
    const seconds = elapsedBetween(
      new Date(entry.startTime),
      new Date(entry.endTime)
    ).seconds;
    subjectSeconds.set(
      entry.subjectId,
      (subjectSeconds.get(entry.subjectId) ?? 0) + seconds
    );
  }

  const subjectHours: DashboardSubjectHours[] = subjects.map((subject) => {
    const seconds = subjectSeconds.get(subject.id) ?? 0;
    return {
      id: subject.id,
      name: subject.name,
      hours: `${formatHours(seconds / 3600)}h`,
      color: subject.color,
      icon: subject.icon,
    };
  });

  const completedEntries = entries.filter((e) => e.endTime);

  return {
    stats,
    recentSessions,
    subjectHours,
    chart7d: hoursPerDay(completedEntries, 7, now),
    chart14d: hoursPerDay(completedEntries, 14, now),
    todos,
  };
}
