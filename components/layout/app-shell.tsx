"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command/command-palette";
import { PomodoroWidget } from "@/components/pomodoro/pomodoro-widget";
import { SettingsHydrator } from "@/components/settings/settings-hydrator";
import { TimerProvider } from "@/components/tracker/timer-provider";
import type { SubjectRow } from "@/lib/data/subjects";
import type { TimeEntryWithSubject } from "@/lib/data/time-entries";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  activeTimer: TimeEntryWithSubject | null;
  subjects: SubjectRow[];
}

export function AppShell({
  children,
  userEmail,
  userName,
  activeTimer,
  subjects,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <TimerProvider initialActiveTimer={activeTimer}>
      <SettingsHydrator>
        <div className="flex h-[100dvh] overflow-hidden fs-app-bg">
          <Sidebar activePath={pathname} />
          <MobileNav
            open={mobileNavOpen}
            onOpenChange={setMobileNavOpen}
            activePath={pathname}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Header
              userEmail={userEmail}
              userName={userName}
              mobileNavOpen={mobileNavOpen}
              onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
            />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-7">
              {children}
            </main>
          </div>
          <PomodoroWidget subjects={subjects} />
        </div>
        <CommandPalette />
      </SettingsHydrator>
    </TimerProvider>
  );
}
