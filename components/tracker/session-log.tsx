"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteTimeEntryAction } from "@/lib/actions/time-entries";
import type { TimeEntryWithSubject } from "@/lib/data/time-entries";
import { formatSessionDuration } from "@/lib/time/duration";
import { SESSION_LOGGED_EVENT } from "@/lib/tracker/session-events";
import { SessionWhen } from "@/components/tracker/session-when";

interface SessionLogProps {
  entries: TimeEntryWithSubject[];
}

function filterPendingDeletes(
  entries: TimeEntryWithSubject[],
  pendingDeletes: Set<string>
) {
  return entries.filter((entry) => !pendingDeletes.has(entry.id));
}

export function SessionLog({ entries }: SessionLogProps) {
  const router = useRouter();
  const pendingDeletesRef = useRef<Set<string>>(new Set());
  const [localEntries, setLocalEntries] = useState(() =>
    filterPendingDeletes(entries, pendingDeletesRef.current)
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pending = pendingDeletesRef.current;
    setLocalEntries(filterPendingDeletes(entries, pending));

    // Server no longer has the row — clear pending flag after confirmed delete
    for (const id of pending) {
      if (!entries.some((entry) => entry.id === id)) {
        pending.delete(id);
      }
    }
  }, [entries]);

  useEffect(() => {
    function onSessionLogged() {
      router.refresh();
    }

    window.addEventListener(SESSION_LOGGED_EVENT, onSessionLogged);
    return () =>
      window.removeEventListener(SESSION_LOGGED_EVENT, onSessionLogged);
  }, [router]);

  async function handleDelete(entryId: string) {
    setError(null);
    pendingDeletesRef.current.add(entryId);
    setLocalEntries((prev) => prev.filter((entry) => entry.id !== entryId));

    try {
      await deleteTimeEntryAction(entryId);
      router.refresh();
    } catch (err) {
      pendingDeletesRef.current.delete(entryId);
      setLocalEntries(
        filterPendingDeletes(entries, pendingDeletesRef.current)
      );
      setError(
        err instanceof Error ? err.message : "Failed to delete session"
      );
    }
  }

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Session log</CardTitle>
        <p className="text-sm text-muted-foreground">
          Recent tracked sessions
        </p>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {localEntries.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No sessions yet"
            description="Start the timer, use Pomodoro, or add a manual entry above."
          />
        ) : (
          <div className="overflow-hidden rounded-[14px] border border-border/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    When
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Note
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {localEntries.map((entry) => {
                  const duration = formatSessionDuration(
                    new Date(entry.startTime),
                    entry.endTime ? new Date(entry.endTime) : null,
                    entry.durationMinutes
                  );

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border/40 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.subjectColor }}
                          />
                          <span className="font-medium">
                            {entry.subjectName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-brand-dark font-medium">
                        {duration}
                      </td>
                      <td className="px-4 py-3">
                        <SessionWhen entry={entry} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {entry.note ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {!entry.endTime ? null : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(entry.id)}
                            aria-label="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
