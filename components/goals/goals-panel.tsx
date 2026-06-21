"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Target } from "lucide-react";

import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteGoalAction } from "@/lib/actions/goals";
import type { SubjectRow } from "@/lib/data/subjects";
import type { GoalWithProgress } from "@/lib/data/goals";
import { PERIOD_LABELS } from "@/lib/goals/constants";
import { getSubjectIcon } from "@/lib/subjects/constants";
import { formatHours } from "@/lib/utils";

interface GoalsPanelProps {
  goals: GoalWithProgress[];
  subjects: SubjectRow[];
}

export function GoalsPanel({ goals, subjects }: GoalsPanelProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<GoalWithProgress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(goal: GoalWithProgress) {
    if (
      !confirm(
        `Delete ${PERIOD_LABELS[goal.period]} goal for ${goal.subjectName}?`
      )
    ) {
      return;
    }

    setDeletingId(goal.id);
    try {
      await deleteGoalAction(goal.id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Study goals</h2>
          <p className="text-sm text-muted-foreground">
            Weekly and monthly targets per subject
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Set a weekly or monthly hour target for a subject."
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  Add goal
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = getSubjectIcon(goal.subjectIcon);
            return (
              <Card
                key={goal.id}
                className="transition-shadow hover:shadow-[var(--shadow-soft)]"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 shadow-sm"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${goal.subjectColor} 12%, var(--card))`,
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: goal.subjectColor }}
                        />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm truncate">
                          {goal.subjectName}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {PERIOD_LABELS[goal.period]} goal
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditing(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(goal)}
                        disabled={deletingId === goal.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <GoalProgressRing
                    percent={goal.progressPercent}
                    color="var(--brand)"
                  />
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatHours(goal.actualHours)}h
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of {goal.targetHours}h target
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <GoalFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        subjects={subjects}
        onSuccess={() => router.refresh()}
      />

      {editing && (
        <GoalFormDialog
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          subjects={subjects}
          goal={editing}
          onSuccess={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
