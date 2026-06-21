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
import {
  createSubjectAction,
  updateSubjectAction,
} from "@/lib/actions/subjects";
import type { SubjectRow } from "@/lib/data/subjects";
import {
  getSubjectIcon,
  SUBJECT_COLORS,
  SUBJECT_ICON_OPTIONS,
} from "@/lib/subjects/constants";
import { cn } from "@/lib/utils";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: SubjectRow;
  onSuccess: () => void;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: SubjectFormDialogProps) {
  const isEdit = !!subject;
  const [name, setName] = useState(subject?.name ?? "");
  const [color, setColor] = useState(subject?.color ?? SUBJECT_COLORS[0]);
  const [icon, setIcon] = useState(subject?.icon ?? "folder");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(subject?.name ?? "");
      setColor(subject?.color ?? SUBJECT_COLORS[0]);
      setIcon(subject?.icon ?? "folder");
      setError(null);
    }
  }, [open, subject]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && subject) {
        await updateSubjectAction(subject.id, { name, color, icon });
      } else {
        await createSubjectAction({ name, color, icon });
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
          <DialogTitle>
            {isEdit ? "Edit subject" : "New subject"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Name</Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_ICON_OPTIONS.map((key) => {
                const Icon = getSubjectIcon(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-[10px] border transition-colors",
                      icon === key
                        ? "border-brand-dark bg-brand-muted"
                        : "border-border/60 hover:bg-secondary/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create subject"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
