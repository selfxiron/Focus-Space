import { GoalsPanel } from "@/components/goals/goals-panel";
import { SubjectList } from "@/components/subjects/subject-list";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { listGoalsWithProgress } from "@/lib/data/goals";
import { listSubjects } from "@/lib/data/subjects";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  try {
    const user = await requireUser();
    const [subjects, goals] = await Promise.all([
      listSubjects(user.id),
      listGoalsWithProgress(user.id),
    ]);

    return (
      <div className="mx-auto max-w-[960px] space-y-10">
        <SubjectList subjects={subjects} />
        <GoalsPanel goals={goals} subjects={subjects} />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
