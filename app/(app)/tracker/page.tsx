import { LiveTimer } from "@/components/tracker/live-timer";
import { ManualEntryForm } from "@/components/tracker/manual-entry-form";
import { SessionLog } from "@/components/tracker/session-log";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { listSubjects } from "@/lib/data/subjects";
import { listRecentTimeEntries } from "@/lib/data/time-entries";

export default async function TrackerPage() {
  try {
    const user = await requireUser();
    const [subjects, entries] = await Promise.all([
      listSubjects(user.id),
      listRecentTimeEntries(user.id, 30),
    ]);

    return (
      <div className="mx-auto max-w-[960px] space-y-6">
        <LiveTimer subjects={subjects} />
        <ManualEntryForm subjects={subjects} />
        <SessionLog entries={entries} />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
