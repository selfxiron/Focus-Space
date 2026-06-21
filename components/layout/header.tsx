"use client";

import { usePathname } from "next/navigation";
import { Plus, Search, Timer } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Study time, tasks, and activity",
  },
  "/tracker": {
    title: "Time Tracker",
    subtitle: "Live timer and session history",
  },
  "/todos": {
    title: "Todos",
    subtitle: "Kanban board and task table",
  },
  "/notes": {
    title: "Notes",
    subtitle: "Markdown notes per subject",
  },
  "/subjects": {
    title: "Subjects",
    subtitle: "Subjects and goals",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Account and preferences",
  },
};

interface HeaderProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function Header({ userEmail, userName }: HeaderProps) {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? PAGE_TITLES["/"];
  const displayName = userName ?? userEmail?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border/60 bg-card/80 px-8 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{page.title}</h1>
        <p className="text-sm text-muted-foreground">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
          <Search className="h-4 w-4" />
          <span className="text-muted-foreground">Search</span>
          <kbd className="ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick add
        </Button>

        <Badge variant="info" className="gap-1.5 px-3 py-1.5">
          <Timer className="h-3 w-3" />
          No active timer
        </Badge>

        <div className="flex items-center gap-2 pl-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {userEmail && (
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
