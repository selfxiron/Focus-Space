"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";

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
  onOpenMobileNav?: () => void;
}

export function Header({
  userEmail,
  userName,
  onOpenMobileNav,
}: HeaderProps) {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? PAGE_TITLES["/"];
  const displayName = userName ?? userEmail?.split("@")[0] ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/50 px-4 backdrop-blur-xl sm:h-16 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 lg:hidden"
          onClick={() => onOpenMobileNav?.()}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
            {page.title}
          </h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {page.subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 sm:hidden"
          onClick={() => {
            window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));
          }}
          aria-label="Search"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 sm:flex"
          onClick={() => {
            window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));
          }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="hidden text-muted-foreground md:inline">Search</span>
          <kbd className="ml-1 hidden rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
            ⌘K
          </kbd>
        </Button>

        <ActiveTimerBadge />

        <ThemeToggle />

        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-[var(--radius-button)] py-1 pl-1 pr-2 transition-colors hover:bg-accent"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-medium leading-none">
              {displayName}
            </p>
            {userEmail && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
