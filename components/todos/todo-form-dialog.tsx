"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SELECT_NONE } from "@/components/ui/select";
import { createTodoAction, updateTodoAction } from "@/lib/actions/todos";
import type { SubjectRow } from "@/lib/data/subjects";
import type { TodoWithSubject } from "@/lib/data/todos";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TODO_PRIORITIES,
  TODO_STATUSES,
  type TodoPriority,
  type TodoStatus,
} from "@/lib/todos/constants";

interface TodoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: SubjectRow[];
  todo?: TodoWithSubject;
  onSuccess: () => void;
}

export function TodoFormDialog({
  open,
  onOpenChange,
  subjects,
  todo,
  onSuccess,
}: TodoFormDialogProps) {
  const isEdit = !!todo;
  const [title, setTitle] = useState(todo?.title ?? "");
  const [priority, setPriority] = useState<TodoPriority>(
    todo?.priority ?? "medium"
  );
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? "backlog");
  const [subjectId, setSubjectId] = useState(
    todo?.subjectId ?? SELECT_NONE
  );
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? toLocalInput(todo.dueDate) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(todo?.title ?? "");
      setPriority(todo?.priority ?? "medium");
      setStatus(todo?.status ?? "backlog");
      setSubjectId(todo?.subjectId ?? SELECT_NONE);
      setDueDate(todo?.dueDate ? toLocalInput(todo.dueDate) : "");
      setError(null);
    }
  }, [open, todo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      priority,
      status,
      subjectId:
        subjectId === SELECT_NONE ? null : subjectId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (isEdit && todo) {
        await updateTodoAction(todo.id, payload);
      } else {
        await createTodoAction(payload);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const priorityOptions = TODO_PRIORITIES.map((p) => ({
    value: p,
    label: PRIORITY_LABELS[p],
  }));
  const statusOptions = TODO_STATUSES.map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));
  const subjectOptions = [
    { value: SELECT_NONE, label: "None" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="todo-title">Title</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="todo-priority">Priority</Label>
              <FilterSelect
                id="todo-priority"
                value={priority}
                onValueChange={(v) => setPriority(v as TodoPriority)}
                options={priorityOptions}
                fullWidth
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-status">Status</Label>
              <FilterSelect
                id="todo-status"
                value={status}
                onValueChange={(v) => setStatus(v as TodoStatus)}
                options={statusOptions}
                fullWidth
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-subject">Subject (optional)</Label>
            <FilterSelect
              id="todo-subject"
              value={subjectId}
              onValueChange={setSubjectId}
              options={subjectOptions}
              fullWidth
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-due">Due date (optional)</Label>
            <Input
              id="todo-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
