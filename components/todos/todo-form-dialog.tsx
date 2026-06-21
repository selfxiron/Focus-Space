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
  const [subjectId, setSubjectId] = useState(todo?.subjectId ?? "");
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
      setSubjectId(todo?.subjectId ?? "");
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
      subjectId: subjectId || null,
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
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className="fs-field"
              >
                {TODO_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="todo-status">Status</Label>
              <select
                id="todo-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                className="fs-field"
              >
                {TODO_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="todo-subject">Subject (optional)</Label>
            <select
              id="todo-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="fs-field"
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
