export const DEFAULT_TIMEZONE = "UTC";
export const DEFAULT_POMODORO_WORK_MINUTES = 25;
export const DEFAULT_POMODORO_BREAK_MINUTES = 5;

/** Curated IANA zones for the settings picker (not exhaustive). */
export const TIMEZONE_OPTIONS = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export type UserSettingsValues = {
  timezone: string;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
};

export const DEFAULT_USER_SETTINGS: UserSettingsValues = {
  timezone: DEFAULT_TIMEZONE,
  pomodoroWorkMinutes: DEFAULT_POMODORO_WORK_MINUTES,
  pomodoroBreakMinutes: DEFAULT_POMODORO_BREAK_MINUTES,
};
