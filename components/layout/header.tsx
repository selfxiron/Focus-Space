"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ActiveTimerBadge } from "@/components/tracker/active-timer-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { COMMAND_PALETTE_OPEN_EVENT } from "@/components/command/command-palette";

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
    subtitle: "Subjects and study goals",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Preferences, export, and account",
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-xl lg:px-8">
      <div>
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {page.title}
        </h1>
        <p className="text-xs text-muted-foreground">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 sm:flex"
          onClick={() => {
            window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Search</span>
          <kbd className="ml-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />

        <ActiveTimerBadge />

        <ThemeToggle />

        <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-[var(--radius-button)] py-1 pl-1 pr-2 transition-colors hover:bg-accent"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {userEmail && (
              <p className="mt-0.5 text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
