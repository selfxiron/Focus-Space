import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SESSIONS = [
  {
    subject: "Study",
    duration: "1h 25m",
    ago: "2 hours ago",
    color: "#14B8A6",
  },
  {
    subject: "Coursework",
    duration: "45m",
    ago: "5 hours ago",
    color: "#8B5CF6",
  },
  {
    subject: "Projects",
    duration: "2h 10m",
    ago: "Yesterday",
    color: "#F59E0B",
  },
  {
    subject: "Study",
    duration: "55m",
    ago: "Yesterday",
    color: "#14B8A6",
  },
];

export function RecentSessions() {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Recent Study Sessions</CardTitle>
        <p className="text-sm text-muted-foreground">Latest tracked time</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {SESSIONS.map((session, i) => (
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
        ))}
      </CardContent>
    </Card>
  );
}
