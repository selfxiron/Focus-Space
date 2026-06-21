import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TodoWithSubject } from "@/lib/data/todos";
import { STATUS_LABELS } from "@/lib/todos/constants";

const statusVariant = {
  in_progress: "progress" as const,
  completed: "success" as const,
  backlog: "secondary" as const,
};

export function DashboardTodoTable({ todos }: { todos: TodoWithSubject[] }) {
  const rows = todos.slice(0, 6);

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks & Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Active todos and recent completions
          </p>
        </div>
        <Link
          href="/todos"
          className="text-sm font-medium text-brand-dark hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet.{" "}
            <Link href="/todos" className="text-brand-dark hover:underline">
              Add a task
            </Link>
          </p>
        ) : (
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
                {rows.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.subjectName ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {task.priority}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[task.status]}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
