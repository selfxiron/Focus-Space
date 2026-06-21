import {
  BookOpen,
  Calculator,
  Brain,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Timer,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: Timer },
  { href: "/todos", label: "Todos", icon: ListTodo },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/subjects", label: "Subjects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col border-r border-border/60 bg-sidebar px-4 py-6"
    >
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-brand-dark text-white shadow-sm">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Focus Space</p>
          <p className="text-xs text-muted-foreground">Learning tracker</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? activePath === "/"
              : activePath.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-muted text-brand-dark"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export const subjectIcons = {
  gate: Calculator,
  ai: Brain,
  projects: FolderKanban,
} as const;
