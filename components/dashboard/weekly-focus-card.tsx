import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "@/lib/utils";

interface WeeklyFocusCardProps {
  percent: number;
  actualHours: number;
  targetHours: number;
}

export function WeeklyFocusCard({
  percent,
  actualHours,
  targetHours,
}: WeeklyFocusCardProps) {
  const hasGoal = targetHours > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Weekly focus goal</CardTitle>
        <p className="text-xs text-muted-foreground">
          Combined weekly targets
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center pb-6">
        {hasGoal ? (
          <>
            <GoalProgressRing
              percent={percent}
              color="var(--brand)"
              size={140}
              glow
              className="mb-4"
            />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatHours(actualHours)}h
              </span>
              {" "}of {targetHours}h goal
            </p>
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Set weekly goals on the Subjects page to track focus progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
