"use client";

import Link from "next/link";
import { Timer } from "lucide-react";

import { useTimer } from "@/components/tracker/timer-provider";
import { Badge } from "@/components/ui/badge";

export function ActiveTimerBadge() {
  const { activeTimer, elapsedLabel } = useTimer();

  if (!activeTimer) {
    return (
      <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-muted-foreground">
        <Timer className="h-3 w-3" />
        No timer
      </Badge>
    );
  }

  return (
    <Link href="/tracker">
      <Badge variant="live" className="gap-1.5 px-3 py-1.5 hover:opacity-90">
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-dark opacity-40"
            aria-hidden
          />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-dark" />
        </span>
        {activeTimer.subjectName} · {elapsedLabel}
      </Badge>
    </Link>
  );
}
