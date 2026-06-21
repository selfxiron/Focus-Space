"use client";

import { usePathname } from "next/navigation";

import { PageSkeleton } from "@/components/layout/page-skeleton";

function skeletonVariant(pathname: string): "default" | "narrow" | "board" {
  if (pathname.startsWith("/tracker")) return "narrow";
  if (pathname.startsWith("/todos")) return "board";
  return "default";
}

/** Instant shell while AppShellLoader fetches auth + timer data. Do not render page children here — they may need TimerProvider from AppShell. */
export function AppShellFrame() {
  const pathname = usePathname();

  return (
    <div className="flex h-[100dvh] overflow-hidden fs-app-bg">
      <div className="hidden h-full w-[240px] shrink-0 border-r border-border bg-sidebar lg:block" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card/70 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-md bg-secondary lg:hidden" />
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded-md bg-secondary sm:h-5 sm:w-32" />
              <div className="hidden h-3 w-40 animate-pulse rounded-md bg-secondary/70 sm:block sm:w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
            <div className="hidden h-8 w-8 animate-pulse rounded-full bg-secondary sm:block" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7">
          <PageSkeleton variant={skeletonVariant(pathname)} />
        </main>
      </div>
    </div>
  );
}
