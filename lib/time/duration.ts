/** Elapsed time between two timestamps (floor, non-negative). */
export function elapsedBetween(start: Date, end: Date) {
  const seconds = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000)
  );
  const minutes = Math.floor(seconds / 60);

  return { seconds, minutes };
}

/** Seconds elapsed between start/end, counting only time on or after `since`. */
export function elapsedSecondsInPeriod(since: Date, start: Date, end: Date) {
  const effectiveStart =
    start.getTime() < since.getTime() ? since : start;
  if (end.getTime() <= effectiveStart.getTime()) {
    return 0;
  }
  return elapsedBetween(effectiveStart, end).seconds;
}

export function durationMinutesBetween(start: Date, end: Date): number {
  return elapsedBetween(start, end).minutes;
}

/** Human-readable session length (e.g. 15s, 1m 30s, 2h 5m). */
export function formatDurationSeconds(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    if (m === 0 && s === 0) return `${h}h`;
    if (s === 0) return `${h}h ${m}m`;
    return `${h}h ${m}m ${s}s`;
  }

  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function formatSessionDuration(
  startTime: Date,
  endTime: Date | null,
  durationMinutes?: number | null
): string {
  if (endTime) {
    return formatDurationSeconds(elapsedBetween(startTime, endTime).seconds);
  }

  if (durationMinutes != null && durationMinutes > 0) {
    return formatDurationSeconds(durationMinutes * 60);
  }

  return "Running…";
}
