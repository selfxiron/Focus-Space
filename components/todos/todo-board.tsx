"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus } from "lucide-react";

import { TodoFormDialog } from "@/components/todos/todo-form-dialog";
import { TodoKanban } from "@/components/todos/todo-kanban";
import { TodoTableView } from "@/components/todos/todo-table-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "table";

interface TodoBoardProps {
  todos: TodoWithSubject[];
  subjects: SubjectRow[];
}

export function TodoBoard({ todos, subjects }: TodoBoardProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("kanban");
  const [statusFilter, setStatusFilter] = useState<TodoStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | "all">(
    "all"
  );
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TodoWithSubject | null>(null);

  const filtered = useMemo(() => {
    return todos.filter((todo) => {
      if (statusFilter !== "all" && todo.status !== statusFilter) return false;
      if (priorityFilter !== "all" && todo.priority !== priorityFilter) {
        return false;
      }
      if (subjectFilter !== "all" && todo.subjectId !== subjectFilter) {
        return false;
      }
      return true;
    });
  }, [todos, statusFilter, priorityFilter, subjectFilter]);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-[12px] border border-border/60 p-1">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-brand-muted text-brand-dark"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors",
                view === "table"
                  ? "bg-brand-muted text-brand-dark"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
              Table
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TodoStatus | "all")
            }
            className="fs-field h-9"
          >
            <option value="all">All statuses</option>
            {TODO_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as TodoPriority | "all")
            }
            className="fs-field h-9"
          >
            <option value="all">All priorities</option>
            {TODO_PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="fs-field h-9"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filtered.length} task{filtered.length === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent>
          {view === "kanban" ? (
            <TodoKanban
              todos={filtered}
              onEdit={setEditing}
              onRefresh={refresh}
            />
          ) : (
            <TodoTableView
              todos={filtered}
              onEdit={setEditing}
              onRefresh={refresh}
            />
          )}
        </CardContent>
      </Card>

      <TodoFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        subjects={subjects}
        onSuccess={refresh}
      />

      {editing && (
        <TodoFormDialog
          open={true}
          onOpenChange={(open) => !open && setEditing(null)}
          subjects={subjects}
          todo={editing}
          onSuccess={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
