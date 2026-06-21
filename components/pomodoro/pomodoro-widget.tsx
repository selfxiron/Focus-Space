"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Coffee, Pause, Play, Timer, X } from "lucide-react";

import { AnimatedClock } from "@/components/motion/animated-clock";
import { CountdownRing } from "@/components/motion/countdown-ring";
import { easeOut, springSnappy } from "@/components/motion/motion-config";
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

  function handleClose() {
    if (phase !== "idle") {
      handleStop();
    }
    setExpanded(false);
  }

  const phaseLabel =
    phase === "work" ? "Focus" : phase === "break" ? "Break" : "Pomodoro";

  const phaseTotalSeconds =
    phase === "work" ? workMinutes * 60 : phase === "break" ? breakMinutes * 60 : 0;
  const ringProgress =
    phaseTotalSeconds > 0
      ? ((phaseTotalSeconds - Math.max(0, secondsLeft)) / phaseTotalSeconds) * 100
      : 0;

  const countdownLabel = formatElapsedSeconds(Math.max(0, secondsLeft));
  const isRunning = phase !== "idle";

  return (
    <AnimatePresence mode="wait">
      {!expanded ? (
        <motion.button
          key="pomodoro-fab"
          type="button"
          onClick={() => setExpanded(true)}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={springSnappy}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-primary-foreground fs-glow-brand"
          aria-label="Open Pomodoro timer"
        >
          {isRunning && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-brand/60"
              animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
              aria-hidden
            />
          )}
          <Timer className="relative h-6 w-6" />
        </motion.button>
      ) : (
        <motion.div
          key="pomodoro-panel"
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={springSnappy}
          className="fixed bottom-6 right-6 z-40 w-[min(100vw-3rem,320px)] fs-panel rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-elevated)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-brand" />
              <motion.span
                key={phaseLabel}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: easeOut }}
                className="text-sm font-semibold"
              >
                {phaseLabel}
              </motion.span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
              aria-label="Close Pomodoro"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="space-y-4"
              >
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
              </motion.div>
            ) : (
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: easeOut }}
                className={cn(
                  "space-y-4 rounded-[var(--radius-card)] border px-4 py-5 text-center",
                  phase === "work"
                    ? "border-brand/20 bg-elevated"
                    : "border-border bg-secondary/50"
                )}
              >
                <CountdownRing
                  progress={ringProgress}
                  size={156}
                  strokeWidth={5}
                  glow={phase === "work" && !paused}
                >
                  <AnimatedClock
                    value={countdownLabel}
                    className={cn(
                      "text-3xl font-semibold",
                      phase === "break" && "text-muted-foreground"
                    )}
                    pulse={!paused}
                  />
                  {paused && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Paused
                    </motion.p>
                  )}
                </CountdownRing>
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
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
          {logging && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-muted-foreground"
            >
              Logging session…
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
