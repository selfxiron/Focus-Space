"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { TimeEntryWithSubject } from "@/lib/data/time-entries";
import { formatElapsedSeconds } from "@/lib/utils";

type ActiveTimer = TimeEntryWithSubject | null;

export const OPTIMISTIC_TIMER_ID = "optimistic";

export type ActiveTimerSubject = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

interface TimerContextValue {
  activeTimer: ActiveTimer;
  elapsedSeconds: number;
  elapsedLabel: string;
  beginActiveTimer: (subject: ActiveTimerSubject) => void;
  confirmActiveTimer: (entry: ActiveTimer) => void;
  clearActiveTimer: () => void;
  refresh: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({
  children,
  initialActiveTimer,
}: {
  children: React.ReactNode;
  initialActiveTimer: ActiveTimer;
}) {
  const router = useRouter();
  const [activeTimer, setActiveTimer] = useState(initialActiveTimer);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isOptimisticRef = useRef(false);
  /** Client start time for elapsed display — survives server confirm + refresh */
  const displayStartMsRef = useRef<number | null>(
    initialActiveTimer?.startTime
      ? new Date(initialActiveTimer.startTime).getTime()
      : null
  );

  useEffect(() => {
    if (isOptimisticRef.current) {
      return;
    }
    setActiveTimer(initialActiveTimer);

    if (!initialActiveTimer?.startTime) {
      displayStartMsRef.current = null;
      return;
    }

    const serverMs = new Date(initialActiveTimer.startTime).getTime();
    if (displayStartMsRef.current === null) {
      displayStartMsRef.current = serverMs;
    } else {
      // Keep the earlier instant so elapsed time never jumps backward after refresh
      displayStartMsRef.current = Math.min(displayStartMsRef.current, serverMs);
    }
  }, [initialActiveTimer]);

  useEffect(() => {
    const startMs = displayStartMsRef.current;

    if (!activeTimer?.startTime || startMs === null) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () =>
      setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  const beginActiveTimer = useCallback((subject: ActiveTimerSubject) => {
    const now = new Date();
    isOptimisticRef.current = true;
    displayStartMsRef.current = now.getTime();
    setActiveTimer({
      id: OPTIMISTIC_TIMER_ID,
      userId: "",
      subjectId: subject.id,
      startTime: now,
      endTime: null,
      durationMinutes: null,
      note: null,
      createdAt: now,
      subjectName: subject.name,
      subjectColor: subject.color,
      subjectIcon: subject.icon,
    });
  }, []);

  const confirmActiveTimer = useCallback((entry: ActiveTimer) => {
    isOptimisticRef.current = false;
    setActiveTimer(entry);
  }, []);

  const clearActiveTimer = useCallback(() => {
    isOptimisticRef.current = false;
    displayStartMsRef.current = null;
    setActiveTimer(null);
    setElapsedSeconds(0);
  }, []);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({
      activeTimer,
      elapsedSeconds,
      elapsedLabel: formatElapsedSeconds(elapsedSeconds),
      beginActiveTimer,
      confirmActiveTimer,
      clearActiveTimer,
      refresh,
    }),
    [
      activeTimer,
      elapsedSeconds,
      beginActiveTimer,
      confirmActiveTimer,
      clearActiveTimer,
      refresh,
    ]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
}
