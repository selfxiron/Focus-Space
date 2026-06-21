"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById } from "@/lib/data/subjects";
import { getActiveTimeEntry } from "@/lib/data/time-entries";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import { elapsedBetween, durationMinutesBetween } from "@/lib/time/duration";

function revalidatePomodoro() {
  revalidatePath("/");
  revalidatePath("/tracker");
  revalidatePath("/subjects");
}

export async function completePomodoroWorkAction(input: {
  subjectId: string;
  workMinutes: number;
  breakMinutes: number;
  startedAt: string;
  /** Actual completion time — used for accurate session duration in the log. */
  endedAt: string;
  /** When true, also records a row in pomodoro_sessions. */
  recordPomodoroSession?: boolean;
}) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, input.subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const active = await getActiveTimeEntry(user.id);
  if (active) {
    throw new Error("Stop the live timer before completing a Pomodoro");
  }

  const workMinutes = Math.round(input.workMinutes);
  const breakMinutes = Math.round(input.breakMinutes);

  if (workMinutes < 1 || workMinutes > 120) {
    throw new Error("Work duration must be between 1 and 120 minutes");
  }

  if (breakMinutes < 0 || breakMinutes > 60) {
    throw new Error("Break duration must be between 0 and 60 minutes");
  }

  const startTime = new Date(input.startedAt);
  const endTime = new Date(input.endedAt);

  if (Number.isNaN(startTime.getTime())) {
    throw new Error("Invalid start time");
  }

  if (Number.isNaN(endTime.getTime())) {
    throw new Error("Invalid end time");
  }

  if (endTime <= startTime) {
    throw new Error("Invalid session duration");
  }

  const { seconds } = elapsedBetween(startTime, endTime);

  if (seconds < 60) {
    throw new Error("Session too short to log");
  }

  const durationMinutes = durationMinutesBetween(startTime, endTime);

  const supabase = await createClient();

  const { data: entry, error: entryError } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      subject_id: input.subjectId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      note: `Pomodoro (${workMinutes}m work)`,
    })
    .select()
    .single();

  if (entryError) {
    throw toDbError(entryError);
  }

  if (input.recordPomodoroSession) {
    const { error: pomodoroError } = await supabase
      .from("pomodoro_sessions")
      .insert({
        user_id: user.id,
        subject_id: input.subjectId,
        work_minutes: workMinutes,
        break_minutes: breakMinutes,
        completed_at: endTime.toISOString(),
      });

    if (pomodoroError) {
      await supabase.from("time_entries").delete().eq("id", entry.id);
      throw toDbError(pomodoroError);
    }
  }

  revalidatePomodoro();
  return entry;
}
