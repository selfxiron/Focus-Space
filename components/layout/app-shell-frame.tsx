"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";

export function AppShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePath={pathname} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border/60 bg-card px-6 lg:px-8">
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-md bg-secondary" />
            <div className="h-3 w-48 animate-pulse rounded-md bg-secondary/70" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-24 animate-pulse rounded-[12px] bg-secondary" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
