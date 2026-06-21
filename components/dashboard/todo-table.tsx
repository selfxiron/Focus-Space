import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TASKS = [
  {
    title: "Chapter 4 review",
    subject: "Study",
    status: "in_progress" as const,
    priority: "high",
  },
  {
    title: "Lab report draft",
    subject: "Coursework",
    status: "in_progress" as const,
    priority: "medium",
  },
  {
    title: "Update project README",
    subject: "Projects",
    status: "completed" as const,
    priority: "high",
  },
  {
    title: "Practice problems set 3",
    subject: "Study",
    status: "completed" as const,
    priority: "medium",
  },
];

const statusVariant = {
  in_progress: "progress" as const,
  completed: "success" as const,
  backlog: "secondary" as const,
};

const statusLabel = {
  in_progress: "In Progress",
  completed: "Completed",
  backlog: "Backlog",
};

export function TodoTable() {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle>Tasks & Sessions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Active todos and recent completions
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-[14px] border border-border/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Task
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Subject
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((task) => (
                <tr
                  key={task.title}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{task.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.subject}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {task.priority}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
