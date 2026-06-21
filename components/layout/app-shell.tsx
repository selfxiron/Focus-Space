"use client";

import { usePathname } from "next/navigation";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
}

export function AppShell({ children, userEmail, userName }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePath={pathname} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userEmail={userEmail} userName={userName} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
