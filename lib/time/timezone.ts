const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type Ymd = { year: number; month: number; day: number };

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
) {
  const value = parts.find((part) => part.type === type)?.value;
  return value ? Number(value) : 0;
}

export function getYmdInTimeZone(date: Date, timeZone: string): Ymd {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return {
    year: getPart(parts, "year"),
    month: getPart(parts, "month"),
    day: getPart(parts, "day"),
  };
}

export function getWeekdayInTimeZone(date: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  return WEEKDAY_INDEX[weekday] ?? 0;
}

function getHourInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  return getPart(parts, "hour");
}

/** UTC instant for midnight on a calendar day in the given IANA timezone. */
export function zonedMidnightUtc(
  year: number,
  month: number,
  day: number,
  timeZone: string
): Date {
  let utcMs = Date.UTC(year, month - 1, day, 12, 0, 0, 0);

  for (let attempt = 0; attempt < 72; attempt++) {
    const probe = new Date(utcMs);
    const ymd = getYmdInTimeZone(probe, timeZone);
    const hour = getHourInTimeZone(probe, timeZone);

    if (ymd.year === year && ymd.month === month && ymd.day === day && hour === 0) {
      return probe;
    }

    if (
      ymd.year > year ||
      (ymd.year === year && ymd.month > month) ||
      (ymd.year === year && ymd.month === month && ymd.day > day)
    ) {
      utcMs -= 3600000;
    } else if (hour > 0) {
      utcMs -= hour * 3600000;
    } else {
      utcMs += 3600000;
    }
  }

  return new Date(utcMs);
}

export function addDaysYmd(ymd: Ymd, days: number): Ymd {
  const utc = Date.UTC(ymd.year, ymd.month - 1, ymd.day + days);
  const d = new Date(utc);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
