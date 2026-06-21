"use client";

import { usePathname } from "next/navigation";

import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Sidebar } from "@/components/layout/sidebar";

function skeletonVariant(pathname: string): "default" | "narrow" | "board" {
  if (pathname.startsWith("/tracker")) return "narrow";
  if (pathname.startsWith("/todos")) return "board";
  return "default";
}

/** Instant shell while AppShellLoader fetches auth + timer data. Do not render page children here — they may need TimerProvider from AppShell. */
export function AppShellFrame() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden fs-app-bg">
      <Sidebar activePath={pathname} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-border/60 bg-card/70 px-6 backdrop-blur-md lg:px-8">
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded-md bg-secondary" />
            <div className="h-3 w-48 animate-pulse rounded-md bg-secondary/70" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-24 animate-pulse rounded-[var(--radius-button)] bg-secondary" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <PageSkeleton variant={skeletonVariant(pathname)} />
        </main>
      </div>
    </div>
  );
}
