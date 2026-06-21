import { listGoalsWithProgress } from "@/lib/data/goals";
import { listSubjects } from "@/lib/data/subjects";
import {
  getActiveTimeEntry,
  listCompletedEntriesSince,
  listRecentTimeEntries,
  listStudyEndTimesSince,
  type CompletedEntrySlice,
} from "@/lib/data/time-entries";
import { listTodos } from "@/lib/data/todos";
import { getUserSettings } from "@/lib/data/user-settings";
import {
  elapsedBetween,
  elapsedSecondsInPeriod,
  formatDurationSeconds,
} from "@/lib/time/duration";
import { getPeriodStart } from "@/lib/time/period";
import {
  addDaysYmd,
  getYmdInTimeZone,
  zonedMidnightUtc,
} from "@/lib/time/timezone";
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
  weeklyFocus: {
    percent: number;
    actualHours: number;
    targetHours: number;
  };
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function hoursPerDayFromSlices(
  entries: CompletedEntrySlice[],
  days: number,
  now = new Date(),
  timeZone?: string
): DashboardChartDay[] {
  const result: DashboardChartDay[] = [];
  const todayYmd = timeZone
    ? getYmdInTimeZone(now, timeZone)
    : {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      };

  for (let i = days - 1; i >= 0; i--) {
    const ymd = addDaysYmd(todayYmd, -i);

    let dayStart: Date;
    let dayEnd: Date;

    if (timeZone) {
      dayStart = zonedMidnightUtc(ymd.year, ymd.month, ymd.day, timeZone);
      const nextYmd = addDaysYmd(ymd, 1);
      dayEnd = zonedMidnightUtc(
        nextYmd.year,
        nextYmd.month,
        nextYmd.day,
        timeZone
      );
    } else {
      dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
    }

    let seconds = 0;
    for (const entry of entries) {
      if (entry.endTime <= dayStart || entry.startTime >= dayEnd) continue;
      const effectiveStart =
        entry.startTime.getTime() < dayStart.getTime()
          ? dayStart
          : entry.startTime;
      const effectiveEnd =
        entry.endTime.getTime() > dayEnd.getTime() ? dayEnd : entry.endTime;
      seconds += elapsedBetween(effectiveStart, effectiveEnd).seconds;
    }

    const labelOpts = timeZone ? { timeZone } : undefined;

    result.push({
      day: dayStart.toLocaleDateString(undefined, {
        weekday: "short",
        ...labelOpts,
      }),
      label: dayStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...labelOpts,
      }),
      hours: Math.round((seconds / 3600) * 10) / 10,
    });
  }

  return result;
}

function studyStreakFromEndTimes(endTimes: Date[], timeZone?: string): number {
  const daysWithStudy = new Set<string>();

  for (const endTime of endTimes) {
    const ymd = timeZone
      ? getYmdInTimeZone(endTime, timeZone)
      : {
          year: endTime.getFullYear(),
          month: endTime.getMonth() + 1,
          day: endTime.getDate(),
        };
    daysWithStudy.add(`${ymd.year}-${ymd.month}-${ymd.day}`);
  }

  const now = new Date();
  const todayYmd = timeZone
    ? getYmdInTimeZone(now, timeZone)
    : {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      };

  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const ymd = addDaysYmd(todayYmd, -i);
    const key = `${ymd.year}-${ymd.month}-${ymd.day}`;
    if (daysWithStudy.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

const STATS_LOOKBACK_DAYS = 90;
const STREAK_LOOKBACK_DAYS = 365;
const DASHBOARD_TODO_LIMIT = 8;

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const statsSince = new Date(now);
  statsSince.setDate(statsSince.getDate() - STATS_LOOKBACK_DAYS);
  const streakSince = new Date(now);
  streakSince.setDate(streakSince.getDate() - STREAK_LOOKBACK_DAYS);

  const [settings, activeTimer] = await Promise.all([
    getUserSettings(userId),
    getActiveTimeEntry(userId),
  ]);

  const weekStart = getPeriodStart("weekly", now, settings.timezone);

  const [statsEntries, streakEndTimes, recentEntries, todos, subjects, goals] =
    await Promise.all([
      listCompletedEntriesSince(userId, statsSince),
      listStudyEndTimesSince(userId, streakSince),
      listRecentTimeEntries(userId, 4),
      listTodos(userId, DASHBOARD_TODO_LIMIT),
      listSubjects(userId),
      listGoalsWithProgress(userId, {
        timezone: settings.timezone,
        activeEntry: activeTimer,
      }),
    ]);

  let totalSeconds = 0;
  let weekSeconds = 0;

  for (const entry of statsEntries) {
    totalSeconds += elapsedBetween(entry.startTime, entry.endTime).seconds;
    weekSeconds += elapsedSecondsInPeriod(
      weekStart,
      entry.startTime,
      entry.endTime
    );
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
  const streak = studyStreakFromEndTimes(streakEndTimes, settings.timezone);

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

  const recentSessions: DashboardSession[] = recentEntries
    .filter((e) => e.endTime)
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
  for (const entry of statsEntries) {
    const seconds = elapsedBetween(entry.startTime, entry.endTime).seconds;
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

  return {
    stats,
    recentSessions,
    subjectHours,
    chart7d: hoursPerDayFromSlices(statsEntries, 7, now, settings.timezone),
    chart14d: hoursPerDayFromSlices(statsEntries, 14, now, settings.timezone),
    todos,
    weeklyFocus: {
      percent: goalPercent,
      actualHours: goalActualHours,
      targetHours: goalTargetHours,
    },
  };
}
