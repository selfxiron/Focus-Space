import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSubjectHours } from "@/lib/data/dashboard";
import { getSubjectIcon } from "@/lib/subjects/constants";

const BG_CYCLE = [
  "bg-pastel-mint",
  "bg-pastel-lavender",
  "bg-pastel-peach",
  "bg-pastel-sky",
] as const;

export function SubjectCards({
  subjects,
}: {
  subjects: DashboardSubjectHours[];
}) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No subjects yet. Add subjects to start tracking.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {subjects.map((subject, index) => {
        const Icon = getSubjectIcon(subject.icon);
        return (
          <Card
            key={subject.id}
            className="border-border/60 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${BG_CYCLE[index % BG_CYCLE.length]}`}
              >
                <Icon className="h-6 w-6" style={{ color: subject.color }} />
              </div>
              <div>
                <p className="text-sm font-medium">{subject.name}</p>
                <p className="text-lg font-semibold">{subject.hours}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
