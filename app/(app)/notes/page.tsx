import { Suspense } from "react";

import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { listNotes } from "@/lib/data/notes";
import { listSubjects } from "@/lib/data/subjects";

function NotesFallback() {
  return (
    <div className="mx-auto max-w-[1200px] py-12 text-center text-sm text-muted-foreground">
      Loading notes…
    </div>
  );
}

export default async function NotesPage() {
  try {
    const user = await requireUser();
    const [notes, subjects] = await Promise.all([
      listNotes(user.id),
      listSubjects(user.id),
    ]);

    return (
      <Suspense fallback={<NotesFallback />}>
        <NotesWorkspace notes={notes} subjects={subjects} />
      </Suspense>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
