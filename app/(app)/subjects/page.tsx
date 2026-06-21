import { SubjectList } from "@/components/subjects/subject-list";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { listSubjects } from "@/lib/data/subjects";

export default async function SubjectsPage() {
  try {
    const user = await requireUser();
    const subjects = await listSubjects(user.id);

    return (
      <div className="mx-auto max-w-[960px]">
        <SubjectList subjects={subjects} />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
