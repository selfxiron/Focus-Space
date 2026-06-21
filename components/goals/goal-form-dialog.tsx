"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoalAction, updateGoalAction } from "@/lib/actions/goals";
import type { SubjectRow } from "@/lib/data/subjects";
import type { GoalWithProgress } from "@/lib/data/goals";
import {
  GOAL_PERIODS,
  PERIOD_LABELS,
  type GoalPeriod,
} from "@/lib/goals/constants";

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectRow[];
  goal?: GoalWithProgress;
  onSuccess: () => void;
}

export function GoalFormDialog({
  open,
  onOpenChange,
  subjects,
  goal,
  onSuccess,
}: GoalFormDialogProps) {
  const isEdit = !!goal;
  const [subjectId, setSubjectId] = useState(
    goal?.subjectId ?? subjects[0]?.id ?? ""
  );
  const [targetHours, setTargetHours] = useState(
    goal?.targetHours?.toString() ?? "5"
  );
  const [period, setPeriod] = useState<GoalPeriod>(goal?.period ?? "weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubjectId(goal?.subjectId ?? subjects[0]?.id ?? "");
      setTargetHours(goal?.targetHours?.toString() ?? "5");
      setPeriod(goal?.period ?? "weekly");
      setError(null);
    }
  }, [open, goal, subjects]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const hours = Number(targetHours);
    if (!Number.isFinite(hours)) {
      setError("Enter a valid number of hours");
      setLoading(false);
      return;
    }

    try {
      if (isEdit && goal) {
        await updateGoalAction(goal.id, { targetHours: hours, period });
      } else {
        await createGoalAction({
          subjectId,
          targetHours: hours,
          period,
        });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="goal-subject">Subject</Label>
              <select
                id="goal-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="fs-field"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-hours">Target hours</Label>
              <Input
                id="goal-hours"
                type="number"
                min={1}
                max={168}
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-period">Period</Label>
              <select
                id="goal-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
                className="fs-field"
              >
                {GOAL_PERIODS.map((p) => (
                  <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || (!isEdit && !subjectId)}
          >
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
