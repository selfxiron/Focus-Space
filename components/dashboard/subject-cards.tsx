import { FolderKanban } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardSubjectHours } from "@/lib/data/dashboard";
import { getSubjectIcon } from "@/lib/subjects/constants";
import { cn } from "@/lib/utils";

export function SubjectCards({
  subjects,
}: {
  subjects: DashboardSubjectHours[];
}) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No subjects yet"
        description="Add subjects to organize study time and goals."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {subjects.map((subject) => {
        const Icon = getSubjectIcon(subject.icon);
        return (
          <Card
            key={subject.id}
            className="transition-all duration-200 hover:border-border hover:shadow-[var(--shadow-soft)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 shadow-sm"
                )}
                style={{
                  backgroundColor: `color-mix(in srgb, ${subject.color} 12%, var(--card))`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: subject.color }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {subject.name}
                </p>
                <p className="text-xl font-semibold tracking-tight tabular-nums">
                  {subject.hours}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
