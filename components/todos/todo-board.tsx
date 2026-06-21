"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Plus } from "lucide-react";

import { TodoFormDialog } from "@/components/todos/todo-form-dialog";
import { TodoKanban } from "@/components/todos/todo-kanban";
import { TodoTableView } from "@/components/todos/todo-table-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
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

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    subjectFilter !== "all";

  function refresh() {
    router.refresh();
  }

  function clearFilters() {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSubjectFilter("all");
  }

  const statusOptions = [
    { value: "all", label: "All statuses" },
    ...TODO_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];
  const priorityOptions = [
    { value: "all", label: "All priorities" },
    ...TODO_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] })),
  ];
  const subjectOptions = [
    { value: "all", label: "All subjects" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-[12px] border border-border/60 p-1">
            <button
              type="button"
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-brand-muted text-brand"
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
                  ? "bg-brand-muted text-brand"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
              Table
            </button>
          </div>
          <Button size="sm" className="gap-2 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            id="todo-filter-status"
            aria-label="Filter by status"
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TodoStatus | "all")}
            options={statusOptions}
          />
          <FilterSelect
            id="todo-filter-priority"
            aria-label="Filter by priority"
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as TodoPriority | "all")}
            options={priorityOptions}
          />
          <FilterSelect
            id="todo-filter-subject"
            aria-label="Filter by subject"
            value={subjectFilter}
            onValueChange={setSubjectFilter}
            options={subjectOptions}
          />
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
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
