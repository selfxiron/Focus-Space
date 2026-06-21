import {
  BookOpen,
  Brain,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Timer,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/tracker", label: "Tracker", icon: Timer },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/todos", label: "Todos", icon: ListTodo },
      { href: "/notes", label: "Notes", icon: BookOpen },
      { href: "/subjects", label: "Subjects", icon: FolderKanban },
    ],
  },
] as const;

export function SidebarBrand({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "mb-6 flex items-center gap-3 rounded-[var(--radius-card)] px-2 py-2 transition-colors hover:bg-accent/50 lg:mb-8",
        className
      )}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-primary-foreground fs-glow-brand"
      >
        <Brain className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold tracking-tight text-foreground">
          Focus Space
        </p>
        <p className="text-xs text-muted-foreground">Study tracker</p>
      </div>
    </Link>
  );
}

export function SidebarNav({
  activePath,
  onNavigate,
  className,
}: {
  activePath: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-1 flex-col gap-6", className)}>
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? activePath === "/"
                  : activePath.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "fs-pill-active fs-glow-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SidebarSettingsLink({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="mt-auto border-t border-border pt-4">
      <Link
        href="/settings"
        prefetch={true}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
          activePath.startsWith("/settings")
            ? "fs-pill-active fs-glow-brand"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Settings className="h-4 w-4 shrink-0" />
        Settings
      </Link>
    </div>
  );
}
