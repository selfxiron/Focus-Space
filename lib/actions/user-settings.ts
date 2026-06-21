"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getUserSettings } from "@/lib/data/user-settings";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import type { UserSettingsValues } from "@/lib/settings/constants";
import { isValidTimeZone } from "@/lib/time/timezone";

function revalidateSettings() {
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/subjects");
}

export async function getUserSettingsAction(): Promise<UserSettingsValues> {
  const user = await requireUser();
  return getUserSettings(user.id);
}

export async function updateUserSettingsAction(input: {
  timezone?: string;
  pomodoroWorkMinutes?: number;
  pomodoroBreakMinutes?: number;
}) {
  const user = await requireUser();
  const current = await getUserSettings(user.id);

  const timezone =
    input.timezone !== undefined
      ? input.timezone.trim()
      : current.timezone;

  if (!isValidTimeZone(timezone)) {
    throw new Error("Invalid timezone");
  }

  const pomodoroWorkMinutes =
    input.pomodoroWorkMinutes !== undefined
      ? Math.round(input.pomodoroWorkMinutes)
      : current.pomodoroWorkMinutes;

  const pomodoroBreakMinutes =
    input.pomodoroBreakMinutes !== undefined
      ? Math.round(input.pomodoroBreakMinutes)
      : current.pomodoroBreakMinutes;

  if (pomodoroWorkMinutes < 1 || pomodoroWorkMinutes > 120) {
    throw new Error("Work duration must be between 1 and 120 minutes");
  }

  if (pomodoroBreakMinutes < 0 || pomodoroBreakMinutes > 60) {
    throw new Error("Break duration must be between 0 and 60 minutes");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        timezone,
        pomodoro_work_minutes: pomodoroWorkMinutes,
        pomodoro_break_minutes: pomodoroBreakMinutes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateSettings();

  return {
    timezone: data.timezone,
    pomodoroWorkMinutes: data.pomodoro_work_minutes,
    pomodoroBreakMinutes: data.pomodoro_break_minutes,
  };
}

export async function exportUserDataAction() {
  const user = await requireUser();
  const supabase = await createClient();

  const [
    subjects,
    timeEntries,
    todos,
    goals,
    notes,
    pomodoroSessions,
    settings,
  ] = await Promise.all([
    supabase.from("subjects").select("*").eq("user_id", user.id),
    supabase.from("time_entries").select("*").eq("user_id", user.id),
    supabase.from("todos").select("*").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("notes").select("*").eq("user_id", user.id),
    supabase.from("pomodoro_sessions").select("*").eq("user_id", user.id),
    getUserSettings(user.id),
  ]);

  const tables = [
    subjects,
    timeEntries,
    todos,
    goals,
    notes,
    pomodoroSessions,
  ];

  for (const result of tables) {
    if (result.error) {
      throw toDbError(result.error);
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    email: user.email,
    settings,
    subjects: subjects.data ?? [],
    timeEntries: timeEntries.data ?? [],
    todos: todos.data ?? [],
    goals: goals.data ?? [],
    notes: notes.data ?? [],
    pomodoroSessions: pomodoroSessions.data ?? [],
  };
}
