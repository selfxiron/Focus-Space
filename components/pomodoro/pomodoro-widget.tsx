"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Pause, Play, Timer, X } from "lucide-react";

import { useTimer } from "@/components/tracker/timer-provider";
import { useUserSettings } from "@/components/settings/settings-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { completePomodoroWorkAction } from "@/lib/actions/pomodoro";
import type { SubjectRow } from "@/lib/data/subjects";
import { notifySessionLogged } from "@/lib/tracker/session-events";
import { cn, formatElapsedSeconds } from "@/lib/utils";

type PomodoroPhase = "idle" | "work" | "break";

export function PomodoroWidget({ subjects: initialSubjects }: { subjects: SubjectRow[] }) {
  const router = useRouter();
  const { activeTimer } = useTimer();
  const userSettings = useUserSettings();
  const [expanded, setExpanded] = useState(false);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [subjectId, setSubjectId] = useState("");
  const [workMinutes, setWorkMinutes] = useState(userSettings.pomodoroWorkMinutes);
  const [breakMinutes, setBreakMinutes] = useState(userSettings.pomodoroBreakMinutes);
  const [phase, setPhase] = useState<PomodoroPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);

  const workStartRef = useRef<Date | null>(null);
  const completingRef = useRef(false);
  const pauseStartedRef = useRef<number | null>(null);
  const pausedTotalMsRef = useRef(0);

  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  useEffect(() => {
    if (subjectId && subjects.some((s) => s.id === subjectId)) {
      return;
    }
    if (subjects[0]) {
      setSubjectId(subjects[0].id);
    } else {
      setSubjectId("");
    }
  }, [subjects, subjectId]);

  useEffect(() => {
    if (phase !== "idle") return;
    setWorkMinutes(userSettings.pomodoroWorkMinutes);
    setBreakMinutes(userSettings.pomodoroBreakMinutes);
  }, [
    userSettings.pomodoroWorkMinutes,
    userSettings.pomodoroBreakMinutes,
    phase,
  ]);

  const completeWork = useCallback(
    async (natural: boolean) => {
      const startedAt = workStartRef.current;
      if (!startedAt || !subjectId || completingRef.current) return;

      const pausedMs =
        pausedTotalMsRef.current +
        (pauseStartedRef.current ? Date.now() - pauseStartedRef.current : 0);
      const focusedSeconds = Math.max(
        0,
        Math.floor((Date.now() - startedAt.getTime() - pausedMs) / 1000)
      );

      if (focusedSeconds < 1) {
        return;
      }

      completingRef.current = true;
      setLogging(true);
      setError(null);

      const endedAt = new Date(
        startedAt.getTime() + focusedSeconds * 1000
      ).toISOString();

      try {
        await completePomodoroWorkAction({
          subjectId,
          workMinutes,
          breakMinutes,
          startedAt: startedAt.toISOString(),
          endedAt,
          recordPomodoroSession: natural,
        });
        notifySessionLogged();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to log session");
      } finally {
        workStartRef.current = null;
        setLogging(false);
        completingRef.current = false;
      }
    },
    [subjectId, workMinutes, breakMinutes, router]
  );

  useEffect(() => {
    if (phase === "idle" || paused) return;

    const id = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    if (secondsLeft !== 0 || phase === "idle") return;

    if (phase === "work") {
      if (breakMinutes > 0) {
        setPhase("break");
        setSecondsLeft(breakMinutes * 60);
      } else {
        setPhase("idle");
      }
      void completeWork(true);
      return;
    }

    setPhase("idle");
  }, [secondsLeft, phase, breakMinutes, completeWork]);

  function handleStart() {
    if (activeTimer) {
      setError("Stop the live timer before starting Pomodoro");
      return;
    }

    if (!subjectId) {
      setError(
        subjects.length === 0
          ? "Add a subject on the Subjects page first"
          : "Select a subject"
      );
      return;
    }

    setError(null);
    setPaused(false);
    completingRef.current = false;
    pausedTotalMsRef.current = 0;
    pauseStartedRef.current = null;
    workStartRef.current = new Date();
    setPhase("work");
    setSecondsLeft(workMinutes * 60);
  }

  function handlePauseToggle() {
    if (paused) {
      if (pauseStartedRef.current) {
        pausedTotalMsRef.current += Date.now() - pauseStartedRef.current;
        pauseStartedRef.current = null;
      }
      setPaused(false);
    } else {
      pauseStartedRef.current = Date.now();
      setPaused(true);
    }
  }

  function handleStop() {
    if (phase === "work" && workStartRef.current) {
      void completeWork(false);
    }

    setPhase("idle");
    setPaused(false);
    setSecondsLeft(0);

    if (!completingRef.current) {
      workStartRef.current = null;
    }

    setError(null);
  }

  const phaseLabel =
    phase === "work" ? "Focus" : phase === "break" ? "Break" : "Pomodoro";

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground fs-glow-brand transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
        aria-label="Open Pomodoro timer"
      >
        <Timer className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-[min(100vw-3rem,320px)] fs-panel rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-elevated)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold">{phaseLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (phase !== "idle") {
              handleStop();
            }
            setExpanded(false);
          }}
          aria-label="Close Pomodoro"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {phase === "idle" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pomodoro-subject" className="fs-label">Subject</Label>
            <NativeSelect
              id="pomodoro-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={subjects.length === 0}
              className="disabled:opacity-60"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pomodoro-work" className="fs-label">Work (min)</Label>
              <Input
                id="pomodoro-work"
                type="number"
                min={1}
                max={120}
                value={workMinutes}
                onChange={(e) =>
                  setWorkMinutes(
                    Number(e.target.value) || userSettings.pomodoroWorkMinutes
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pomodoro-break" className="fs-label">Break (min)</Label>
              <Input
                id="pomodoro-break"
                type="number"
                min={0}
                max={60}
                value={breakMinutes}
                onChange={(e) =>
                  setBreakMinutes(Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <Button
            className="w-full gap-2"
            onClick={handleStart}
            disabled={subjects.length === 0}
          >
            <Play className="h-4 w-4" />
            Start focus
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "space-y-4 rounded-[var(--radius-card)] border px-4 py-6 text-center",
            phase === "work"
              ? "border-brand/20 bg-elevated"
              : "border-border bg-secondary/50"
          )}
        >
          <p
            className={cn(
              "text-4xl font-semibold tabular-nums tracking-tight",
              phase === "break" && "text-muted-foreground"
            )}
          >
            {formatElapsedSeconds(Math.max(0, secondsLeft))}
          </p>
          <p className="text-sm text-muted-foreground">
            {phase === "work"
              ? "Focused time is logged to Session log when you finish or stop"
              : "Take a short break"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handlePauseToggle}
              disabled={logging}
            >
              {paused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleStop}
              disabled={logging}
            >
              Stop
            </Button>
          </div>
          {phase === "break" && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Coffee className="h-3.5 w-3.5" />
              Break time
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {logging && (
        <p className="mt-3 text-sm text-muted-foreground">Logging session…</p>
      )}
    </div>
  );
}
