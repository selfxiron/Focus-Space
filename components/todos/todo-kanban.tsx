"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteTodoAction, updateTodoStatusAction } from "@/lib/actions/todos";
import type { TodoWithSubject } from "@/lib/data/todos";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TODO_STATUSES,
  type TodoStatus,
} from "@/lib/todos/constants";
import { TodoDueDate } from "@/components/todos/todo-due-date";

const statusVariant = {
  backlog: "secondary" as const,
  in_progress: "progress" as const,
  completed: "success" as const,
};

const priorityVariant = {
  low: "info" as const,
  medium: "warning" as const,
  high: "default" as const,
};

interface TodoKanbanProps {
  todos: TodoWithSubject[];
  onEdit: (todo: TodoWithSubject) => void;
  onRefresh: () => void;
}

export function TodoKanban({ todos, onEdit, onRefresh }: TodoKanbanProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatusChange(todoId: string, status: TodoStatus) {
    setBusyId(todoId);
    try {
      await updateTodoStatusAction(todoId, status);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(todoId: string) {
    setBusyId(todoId);
    try {
      await deleteTodoAction(todoId);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {TODO_STATUSES.map((status) => {
        const columnTodos = todos.filter((t) => t.status === status);
        return (
          <div
            key={status}
            className="rounded-[16px] border border-border/60 bg-secondary/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
              <Badge variant={statusVariant[status]}>
                {columnTodos.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {columnTodos.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              ) : (
                columnTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="rounded-[12px] border border-border/60 bg-card p-3 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">
                        {todo.title}
                      </p>
                      <div className="flex shrink-0 gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(todo)}
                          aria-label="Edit task"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(todo.id)}
                            disabled={busyId === todo.id}
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant={priorityVariant[todo.priority]}>
                        {PRIORITY_LABELS[todo.priority]}
                      </Badge>
                      {todo.subjectName && (
                        <Badge variant="outline" className="gap-1">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: todo.subjectColor ?? "#14B8A6",
                            }}
                          />
                          {todo.subjectName}
                        </Badge>
                      )}
                    </div>
                    {todo.dueDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Due <TodoDueDate date={todo.dueDate} />
                      </p>
                    )}
                    {status !== "completed" && (
                      <div className="mt-3 flex gap-2">
                        {status === "backlog" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleStatusChange(todo.id, "in_progress")
                            }
                          >
                            Start
                          </Button>
                        )}
                        {status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleStatusChange(todo.id, "completed")
                            }
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
