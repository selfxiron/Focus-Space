import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { isDuplicateKeyError, toDbError } from "@/lib/db/schema-error";
import {
  DEFAULT_USER_SETTINGS,
  type UserSettingsValues,
} from "@/lib/settings/constants";

type UserSettingsRow = {
  user_id: string;
  timezone: string;
  pomodoro_work_minutes: number;
  pomodoro_break_minutes: number;
  updated_at: string;
};

const SETTINGS_SELECT =
  "user_id, timezone, pomodoro_work_minutes, pomodoro_break_minutes, updated_at";

function mapSettings(row: UserSettingsRow): UserSettingsValues {
  return {
    timezone: row.timezone,
    pomodoroWorkMinutes: row.pomodoro_work_minutes,
    pomodoroBreakMinutes: row.pomodoro_break_minutes,
  };
}

export const getUserSettings = cache(
  async (userId: string): Promise<UserSettingsValues> => {
    const supabase = await createClient();

    async function fetchRow() {
      const { data, error } = await supabase
        .from("user_settings")
        .select(SETTINGS_SELECT)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw toDbError(error);
      }

      return data as UserSettingsRow | null;
    }

    const existing = await fetchRow();
    if (existing) {
      return mapSettings(existing);
    }

    const { error: insertError } = await supabase.from("user_settings").insert({
      user_id: userId,
      timezone: DEFAULT_USER_SETTINGS.timezone,
      pomodoro_work_minutes: DEFAULT_USER_SETTINGS.pomodoroWorkMinutes,
      pomodoro_break_minutes: DEFAULT_USER_SETTINGS.pomodoroBreakMinutes,
    });

    if (insertError && !isDuplicateKeyError(insertError)) {
      throw toDbError(insertError);
    }

    const row = await fetchRow();
    if (!row) {
      throw new Error("Failed to load user settings");
    }

    return mapSettings(row);
  }
);
