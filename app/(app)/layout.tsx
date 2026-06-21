import { Suspense } from "react";

import { AppShellFrame } from "@/components/layout/app-shell-frame";
import { AppShellLoader } from "@/components/layout/app-shell-loader";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellFrame>{children}</AppShellFrame>}>
      <AppShellLoader>{children}</AppShellLoader>
    </Suspense>
  );
}
