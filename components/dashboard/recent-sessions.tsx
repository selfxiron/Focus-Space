import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSession } from "@/lib/data/dashboard";

export function RecentSessions({
  sessions,
}: {
  sessions: DashboardSession[];
}) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Recent Study Sessions</CardTitle>
        <p className="text-sm text-muted-foreground">Latest tracked time</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sessions yet. Start the timer or use Pomodoro.
          </p>
        ) : (
          sessions.map((session, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[14px] bg-secondary/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: session.color }}
                />
                <div>
                  <p className="text-sm font-medium">{session.subject}</p>
                  <p className="text-xs text-muted-foreground">{session.ago}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-brand-dark">
                {session.duration}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
