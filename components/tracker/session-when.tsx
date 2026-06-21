"use client";

import { useEffect, useState } from "react";

import type { TimeEntryWithSubject } from "@/lib/data/time-entries";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";

/** Renders session timestamps after mount to avoid SSR/client locale/time drift. */
export function SessionWhen({ entry }: { entry: TimeEntryWithSubject }) {
  const [when, setWhen] = useState<string | null>(null);

  useEffect(() => {
    const isActive = !entry.endTime;
    setWhen(
      isActive
        ? `Started ${formatTimeAgo(new Date(entry.startTime))}`
        : formatDateTime(new Date(entry.endTime!))
    );
  }, [entry.startTime, entry.endTime]);

  return (
    <span className="text-muted-foreground" suppressHydrationWarning>
      {when ?? "—"}
    </span>
  );
}
