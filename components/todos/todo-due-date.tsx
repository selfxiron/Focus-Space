"use client";

import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/utils";

export function TodoDueDate({ date }: { date: Date }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatDateTime(date));
  }, [date]);

  return (
    <span suppressHydrationWarning className="text-muted-foreground">
      {label ?? "—"}
    </span>
  );
}
