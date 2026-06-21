"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Play, Square, Timer } from "lucide-react";

import {
  OPTIMISTIC_TIMER_ID,
  useTimer,
} from "@/components/tracker/timer-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  startTimerAction,
  stopTimerAction,
} from "@/lib/actions/time-entries";
import type { SubjectRow } from "@/lib/data/subjects";
import { getSubjectIcon } from "@/lib/subjects/constants";
import { notifySessionLogged } from "@/lib/tracker/session-events";
import { cn } from "@/lib/utils";

interface LiveTimerProps {
  subjects: SubjectRow[];
}

export function LiveTimer({ subjects }: LiveTimerProps) {
  const router = useRouter();
  const {
    activeTimer,
    elapsedLabel,
    beginActiveTimer,
    confirmActiveTimer,
    clearActiveTimer,
  } = useTimer();
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    subjects[0]?.id ?? ""
  );
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingStartRef = useRef<Promise<string> | null>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const SelectedIcon = selectedSubject
    ? getSubjectIcon(selectedSubject.icon)
    : null;

  useEffect(() => {
    if (
      selectedSubjectId &&
      subjects.some((s) => s.id === selectedSubjectId)
    ) {
      return;
    }
    setSelectedSubjectId(subjects[0]?.id ?? "");
  }, [subjects, selectedSubjectId]);

  function handleStart() {
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject || starting || pendingStartRef.current) return;

    setError(null);
    setStarting(true);
    beginActiveTimer({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
    });

    pendingStartRef.current = startTimerAction(subject.id)
      .then((data) => {
        confirmActiveTimer({
          id: data.id,
          userId: data.user_id,
          subjectId: data.subject_id,
          startTime: new Date(data.start_time),
          endTime: data.end_time ? new Date(data.end_time) : null,
          durationMinutes: data.duration_minutes,
          note: data.note,
          createdAt: new Date(data.created_at),
          subjectName: subject.name,
          subjectColor: subject.color,
          subjectIcon: subject.icon,
        });
        router.refresh();
        return data.id;
      })
      .catch((err) => {
        clearActiveTimer();
        setError(
          err instanceof Error ? err.message : "Failed to start timer"
        );
        throw err;
      });

    pendingStartRef.current.finally(() => {
      pendingStartRef.current = null;
      setStarting(false);
    });
  }

  async function handleStop() {
    if (!activeTimer || stopping) return;

    setStopping(true);
    setError(null);

    let entryId = activeTimer.id;

    try {
      if (entryId === OPTIMISTIC_TIMER_ID) {
        const pending = pendingStartRef.current;
        if (!pending) {
          throw new Error("Timer is still starting. Try again in a moment.");
        }
        entryId = await pending;
      }

      await stopTimerAction(entryId);
      clearActiveTimer();
      notifySessionLogged();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop timer");
      router.refresh();
    } finally {
      setStopping(false);
    }
  }

  const ActiveIcon = activeTimer
    ? getSubjectIcon(activeTimer.subjectIcon)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Track time for a subject. One active session at a time.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {activeTimer ? (
          <div
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-brand/20 bg-elevated px-6 py-10 text-center"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(118,228,167,0.08),transparent_60%)]"
              aria-hidden
            />
            {ActiveIcon && (
              <div
                className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary"
              >
                <span
                  className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                  style={{ backgroundColor: activeTimer.subjectColor }}
                  aria-hidden
                />
                <ActiveIcon
                  className="relative h-8 w-8"
                  style={{ color: activeTimer.subjectColor }}
                />
              </div>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse"
                aria-hidden
              />
              {activeTimer.subjectName}
            </span>
            <p className="fs-metric-lg mt-6 text-foreground tabular-nums">
              {elapsedLabel}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Session in progress
            </p>
            <Button
              className="mt-8 w-full gap-2"
              size="pill"
              variant="outline"
              onClick={handleStop}
              disabled={stopping}
            >
              <Square className="h-4 w-4" />
              {stopping ? "Saving…" : "Stop session"}
            </Button>
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No subjects yet"
            description="Add a subject before starting a timer."
            action={
              <Button size="sm" asChild>
                <Link href="/subjects">Go to Subjects</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="fs-label">Choose subject</p>
                <span className="text-xs text-muted-foreground">
                  {subjects.length} available
                </span>
              </div>
              <div
                className="grid gap-2 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Subject"
              >
                {subjects.map((subject) => {
                  const Icon = getSubjectIcon(subject.icon);
                  const selected = selectedSubjectId === subject.id;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                        selected
                          ? "border-brand/40 bg-brand/5 ring-1 ring-brand/25"
                          : "border-border bg-elevated hover:border-border hover:bg-accent"
                      )}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary transition-colors group-hover:border-border"
                        style={{
                          backgroundColor: selected
                            ? `color-mix(in srgb, ${subject.color} 14%, var(--secondary))`
                            : undefined,
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: subject.color }}
                        />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {subject.name}
                      </span>
                      {selected && (
                        <Check
                          className="h-4 w-4 shrink-0 text-brand"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-elevated p-3 space-y-3">
              {selectedSubject && SelectedIcon && (
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-secondary"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${selectedSubject.color} 12%, var(--secondary))`,
                    }}
                  >
                    <SelectedIcon
                      className="h-4 w-4"
                      style={{ color: selectedSubject.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Session
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">
                      {selectedSubject.name}
                    </p>
                  </div>
                </div>
              )}
              <Button
                className="w-full gap-2"
                size="pill"
                onClick={handleStart}
                disabled={!selectedSubjectId || starting}
              >
                <Play className="h-4 w-4" />
                {starting ? "Starting…" : "Start timer"}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
