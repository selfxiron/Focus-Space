"use client";

import Link from "next/link";
import { Timer } from "lucide-react";

import { useTimer } from "@/components/tracker/timer-provider";
import { Badge } from "@/components/ui/badge";

export function ActiveTimerBadge() {
  const { activeTimer, elapsedLabel } = useTimer();

  if (!activeTimer) {
    return (
      <Badge variant="info" className="gap-1.5 px-3 py-1.5">
        <Timer className="h-3 w-3" />
        No active timer
      </Badge>
    );
  }

  return (
    <Link href="/tracker">
      <Badge
        variant="success"
        className="gap-1.5 px-3 py-1.5 transition-opacity hover:opacity-90"
      >
        <Timer className="h-3 w-3" />
        {activeTimer.subjectName} · {elapsedLabel}
      </Badge>
    </Link>
  );
}
