"use client";

import Link from "next/link";
import { Timer } from "lucide-react";

import { useTimer } from "@/components/tracker/timer-provider";
import { Badge } from "@/components/ui/badge";

export function ActiveTimerBadge() {
  const { activeTimer, elapsedLabel } = useTimer();

  if (!activeTimer) {
    return (
      <Badge variant="outline" className="gap-1.5 px-2 py-1.5 text-muted-foreground sm:px-3">
        <Timer className="h-3 w-3" />
        <span className="hidden sm:inline">No timer</span>
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
        <span className="hidden max-w-[5rem] truncate sm:inline sm:max-w-[8rem]">
          {activeTimer.subjectName}
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="tabular-nums">{elapsedLabel}</span>
      </Badge>
    </Link>
  );
}
