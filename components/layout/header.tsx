"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ActiveTimerBadge } from "@/components/tracker/active-timer-badge";

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
    subtitle: "Coming soon — markdown notes per subject",
  },
  "/subjects": {
    title: "Subjects",
    subtitle: "Subjects and study goals",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Account and sign out",
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
        <ActiveTimerBadge />

        <Link
          href="/settings"
          className="flex items-center gap-2 pl-2 rounded-[12px] transition-colors hover:bg-secondary/60"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {userEmail && (
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
