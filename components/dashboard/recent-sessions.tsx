import { Timer } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardSession } from "@/lib/data/dashboard";

export function RecentSessions({
  sessions,
}: {
  sessions: DashboardSession[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily protocol</CardTitle>
        <p className="text-xs text-muted-foreground">Recent study sessions</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sessions.length === 0 ? (
          <EmptyState
            icon={Timer}
            title="No sessions yet"
            description="Start the live timer or run a Pomodoro focus block."
          />
        ) : (
          sessions.map((session, i) => (
            <div
              key={i}
              className="group flex items-center justify-between gap-3 rounded-[var(--radius-button)] border border-border bg-elevated px-3 py-3 transition-colors hover:border-border hover:bg-accent"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="fs-icon-box h-9 w-9 shrink-0"
                  style={{
                    borderColor: `color-mix(in srgb, ${session.color} 30%, transparent)`,
                    background: `color-mix(in srgb, ${session.color} 10%, var(--secondary))`,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: session.color }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{session.subject}</p>
                  <p className="text-xs text-muted-foreground">{session.ago}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-bold tabular-nums text-brand">
                {session.duration}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
