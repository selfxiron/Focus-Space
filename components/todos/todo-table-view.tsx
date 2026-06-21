"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/ui/filter-select";
import { deleteTodoAction, updateTodoAction } from "@/lib/actions/todos";
import type { TodoWithSubject } from "@/lib/data/todos";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TODO_STATUSES,
  type TodoStatus,
} from "@/lib/todos/constants";
import { TodoDueDate } from "@/components/todos/todo-due-date";

interface TodoTableViewProps {
  todos: TodoWithSubject[];
  onEdit: (todo: TodoWithSubject) => void;
  onRefresh: () => void;
}

export function TodoTableView({
  todos,
  onEdit,
  onRefresh,
}: TodoTableViewProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatusChange(todoId: string, status: TodoStatus) {
    setBusyId(todoId);
    try {
      await updateTodoAction(todoId, { status });
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

  if (todos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No tasks match your filters.
      </p>
    );
  }

  return (
    <div className="-mx-1 overflow-x-auto sm:mx-0">
      <div className="min-w-[640px] overflow-hidden rounded-[14px] border border-border/60 sm:min-w-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/50 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Task
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Subject
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Priority
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 font-medium text-muted-foreground">
              Due
            </th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr
              key={todo.id}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-4 py-3 font-medium">{todo.title}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {todo.subjectName ?? "—"}
              </td>
              <td className="px-4 py-3 capitalize text-muted-foreground">
                {PRIORITY_LABELS[todo.priority]}
              </td>
              <td className="px-4 py-3">
                <FilterSelect
                  value={todo.status}
                  onValueChange={(v) =>
                    handleStatusChange(todo.id, v as TodoStatus)
                  }
                  disabled={busyId === todo.id}
                  size="sm"
                  triggerClassName="min-w-[7.5rem]"
                  options={TODO_STATUSES.map((s) => ({
                    value: s,
                    label: STATUS_LABELS[s],
                  }))}
                />
              </td>
              <td className="px-4 py-3">
                {todo.dueDate ? <TodoDueDate date={todo.dueDate} /> : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(todo)}
                    aria-label="Edit task"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(todo.id)}
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
