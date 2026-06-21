"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteSubjectAction } from "@/lib/actions/subjects";
import type { SubjectRow } from "@/lib/data/subjects";
import { getSubjectIcon } from "@/lib/subjects/constants";
import { useRouter } from "next/navigation";

interface SubjectListProps {
  subjects: SubjectRow[];
}

export function SubjectList({ subjects }: SubjectListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(subject: SubjectRow) {
    if (!confirm(`Delete "${subject.name}"? Related sessions will also be removed.`)) {
      return;
    }
    setDeletingId(subject.id);
    try {
      await deleteSubjectAction(subject.id);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {subjects.length} subject{subjects.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add subject
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
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
                  <p className="font-medium truncate">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject.icon} · {subject.color}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditing(subject)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(subject)}
                    disabled={deletingId === subject.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
