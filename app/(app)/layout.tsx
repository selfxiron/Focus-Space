import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { getActiveTimeEntry } from "@/lib/data/time-entries";
import { SchemaNotReadyError } from "@/lib/db/schema-error";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeTimer = null;

  if (user) {
    try {
      activeTimer = await getActiveTimeEntry(user.id);
    } catch (error) {
      if (error instanceof SchemaNotReadyError) {
        // Tables not migrated yet — layout still renders; tracker shows setup UI
      } else {
        console.error("Database connection failed:", error);
      }
    }
  }

  return (
    <AppShell
      userEmail={user?.email}
      userName={user?.user_metadata?.full_name}
      activeTimer={activeTimer}
    >
      {children}
    </AppShell>
  );
}
