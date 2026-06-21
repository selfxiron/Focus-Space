"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { useTimer } from "@/components/tracker/timer-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSubjectAction } from "@/lib/actions/subjects";
import type { SubjectRow } from "@/lib/data/subjects";
import { getSubjectIcon } from "@/lib/subjects/constants";

interface SubjectListProps {
  subjects: SubjectRow[];
}

export function SubjectList({ subjects }: SubjectListProps) {
  const router = useRouter();
  const { activeTimer, clearActiveTimer } = useTimer();
  const [localSubjects, setLocalSubjects] = useState(subjects);
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSubjects(subjects.filter((s) => !removedIds.has(s.id)));
  }, [subjects, removedIds]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    const subject = deleteTarget;
    setDeleting(true);
    setError(null);

    try {
      await deleteSubjectAction(subject.id);

      if (activeTimer?.subjectId === subject.id) {
        clearActiveTimer();
      }

      setRemovedIds((prev) => new Set(prev).add(subject.id));
      setLocalSubjects((prev) => prev.filter((s) => s.id !== subject.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {localSubjects.length} subject
          {localSubjects.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add subject
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.icon);
          return (
            <Card
              key={subject.id}
              className="border-border/60 shadow-[var(--shadow-card)]"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-secondary/80"
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: subject.color }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject.icon} · {subject.color}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditing(subject)}
                    aria-label={`Edit ${subject.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setError(null);
                      setDeleteTarget(subject);
                    }}
                    aria-label={`Delete ${subject.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete subject?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" and its sessions, goals, and Pomodoro history will be removed. Todos and notes will be unlinked.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SubjectFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => router.refresh()}
      />

      {editing && (
        <SubjectFormDialog
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          subject={editing}
          onSuccess={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
