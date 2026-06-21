"use client";

import { usePathname } from "next/navigation";

import { Header } from "@/components/layout/header";
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

  return (
    <TimerProvider initialActiveTimer={activeTimer}>
      <SettingsHydrator>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar activePath={pathname} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header userEmail={userEmail} userName={userName} />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          </div>
          <PomodoroWidget subjects={subjects} />
        </div>
        <CommandPalette />
      </SettingsHydrator>
    </TimerProvider>
  );
}
