import { TodoBoard } from "@/components/todos/todo-board";
import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { listSubjects } from "@/lib/data/subjects";
import { listTodos } from "@/lib/data/todos";

export default async function TodosPage() {
  try {
    const user = await requireUser();
    const [todos, subjects] = await Promise.all([
      listTodos(user.id),
      listSubjects(user.id),
    ]);

    return (
      <div className="mx-auto max-w-[1200px]">
        <TodoBoard todos={todos} subjects={subjects} />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
