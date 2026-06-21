"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Square } from "lucide-react";

import {
  OPTIMISTIC_TIMER_ID,
  useTimer,
} from "@/components/tracker/timer-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  startTimerAction,
  stopTimerAction,
} from "@/lib/actions/time-entries";
import type { SubjectRow } from "@/lib/data/subjects";
import { getSubjectIcon } from "@/lib/subjects/constants";
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
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingStartRef = useRef<Promise<string> | null>(null);

  function handleStart() {
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) return;

    setError(null);
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
      router.refresh();
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

      clearActiveTimer();
      await stopTimerAction(entryId);
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
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Timer</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track time for a subject. One active session at a time.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeTimer ? (
          <div className="rounded-[16px] bg-pastel-mint/50 px-6 py-8 text-center">
            {ActiveIcon && (
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-card shadow-sm">
                <ActiveIcon
                  className="h-6 w-6"
                  style={{ color: activeTimer.subjectColor }}
                />
              </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">
              {activeTimer.subjectName}
            </p>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
              {elapsedLabel}
            </p>
            <Button
              className="mt-6 gap-2"
              variant="destructive"
              onClick={handleStop}
              disabled={stopping}
            >
              <Square className="h-4 w-4" />
              {stopping ? "Saving…" : "Stop"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timer-subject">Subject</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {subjects.map((subject) => {
                  const Icon = getSubjectIcon(subject.icon);
                  const selected = selectedSubjectId === subject.id;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left text-sm transition-colors",
                        selected
                          ? "border-brand-dark bg-brand-muted"
                          : "border-border/60 bg-card hover:bg-secondary/60"
                      )}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: subject.color }}
                      />
                      <span className="font-medium">{subject.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleStart}
              disabled={!selectedSubjectId}
            >
              <Play className="h-4 w-4" />
              Start timer
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
