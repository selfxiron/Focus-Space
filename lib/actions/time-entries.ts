"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { getSubjectById } from "@/lib/data/subjects";
import {
  getActiveTimeEntry,
  getTimeEntryById,
} from "@/lib/data/time-entries";
import { createClient } from "@/lib/supabase/server";
import { toDbError } from "@/lib/db/schema-error";
import { durationMinutesBetween } from "@/lib/time/duration";

function revalidateTracking() {
  revalidatePath("/");
  revalidatePath("/tracker");
  revalidatePath("/subjects");
}

export async function startTimerAction(subjectId: string) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const active = await getActiveTimeEntry(user.id);
  if (active) {
    throw new Error(
      "A timer is already running. Stop it before starting another."
    );
  }

  const supabase = await createClient();

  // Re-check after async work to reduce double-start races
  const { data: stillActive } = await supabase
    .from("time_entries")
    .select("id")
    .eq("user_id", user.id)
    .is("end_time", null)
    .limit(1)
    .maybeSingle();

  if (stillActive) {
    throw new Error(
      "A timer is already running. Stop it before starting another."
    );
  }

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      subject_id: subjectId,
      start_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateTracking();
  return data;
}

export async function stopTimerAction(entryId: string) {
  const user = await requireUser();
  const entry = await getTimeEntryById(user.id, entryId);

  if (!entry) {
    throw new Error("Session not found");
  }

  if (entry.endTime) {
    throw new Error("Session already ended");
  }

  const endTime = new Date();
  const durationMinutes = durationMinutesBetween(entry.startTime, endTime);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .update({
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
    })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .is("end_time", null)
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  if (!data) {
    throw new Error("Session could not be stopped");
  }

  revalidateTracking();
  return data;
}

export async function createManualEntryAction(input: {
  subjectId: string;
  startTime: string;
  endTime: string;
  note?: string;
}) {
  const user = await requireUser();
  const subject = await getSubjectById(user.id, input.subjectId);

  if (!subject) {
    throw new Error("Subject not found");
  }

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error("Invalid date");
  }

  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  const durationMinutes = durationMinutesBetween(startTime, endTime);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      subject_id: input.subjectId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      note: input.note?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    throw toDbError(error);
  }

  revalidateTracking();
  return data;
}

export async function deleteTimeEntryAction(entryId: string) {
  const user = await requireUser();
  const entry = await getTimeEntryById(user.id, entryId);

  if (!entry) {
    throw new Error("Session not found");
  }

  if (!entry.endTime) {
    throw new Error("Stop the active timer before deleting it");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    throw toDbError(error);
  }

  if (!data?.length) {
    throw new Error("Session could not be deleted");
  }

  revalidateTracking();
}
