import {
  addDaysYmd,
  getWeekdayInTimeZone,
  getYmdInTimeZone,
  zonedMidnightUtc,
} from "@/lib/time/timezone";

/** Monday-based week start at local or IANA timezone midnight. */
export function getWeekStart(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const ymd = getYmdInTimeZone(date, timeZone);
  const weekday = getWeekdayInTimeZone(date, timeZone);
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const mondayYmd = addDaysYmd(ymd, mondayOffset);

  return zonedMidnightUtc(
    mondayYmd.year,
    mondayYmd.month,
    mondayYmd.day,
    timeZone
  );
}

export function getMonthStart(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const ymd = getYmdInTimeZone(date, timeZone);
  return zonedMidnightUtc(ymd.year, ymd.month, 1, timeZone);
}

export function getPeriodStart(
  period: "weekly" | "monthly",
  date = new Date(),
  timeZone?: string
) {
  return period === "weekly"
    ? getWeekStart(date, timeZone)
    : getMonthStart(date, timeZone);
}
