import { BookOpen, Calculator, FolderKanban } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const SUBJECTS = [
  {
    name: "Study",
    hours: "18.5h",
    icon: BookOpen,
    bg: "bg-pastel-mint",
    color: "#14B8A6",
  },
  {
    name: "Coursework",
    hours: "14.2h",
    icon: Calculator,
    bg: "bg-pastel-lavender",
    color: "#8B5CF6",
  },
  {
    name: "Projects",
    hours: "9.8h",
    icon: FolderKanban,
    bg: "bg-pastel-peach",
    color: "#F59E0B",
  },
];

export function SubjectCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {SUBJECTS.map((subject) => {
        const Icon = subject.icon;
        return (
          <Card
            key={subject.name}
            className="border-border/60 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${subject.bg}`}
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
