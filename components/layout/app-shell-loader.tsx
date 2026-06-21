import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";
import { listSubjects } from "@/lib/data/subjects";
import { getActiveTimeEntry } from "@/lib/data/time-entries";
import { SchemaNotReadyError } from "@/lib/db/schema-error";

export async function AppShellLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let activeTimer = null;
  let subjects: Awaited<ReturnType<typeof listSubjects>> = [];

  try {
    user = await requireUser();
    [activeTimer, subjects] = await Promise.all([
      getActiveTimeEntry(user.id),
      listSubjects(user.id),
    ]);
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      // Tables not migrated yet
    } else if (error instanceof Error && error.message === "Unauthorized") {
      // Middleware should redirect
    } else {
      console.error("Failed to load app shell data:", error);
    }
  }

  return (
    <AppShell
      userEmail={user?.email}
      userName={user?.user_metadata?.full_name}
      activeTimer={activeTimer}
      subjects={subjects}
    >
      {children}
    </AppShell>
  );
}
