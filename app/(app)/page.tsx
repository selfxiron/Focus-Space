import { SchemaSetupRequired } from "@/components/setup/schema-setup-required";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { requireUser } from "@/lib/auth/require-user";
import { SchemaNotReadyError } from "@/lib/db/schema-error";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  try {
    const user = await requireUser();
    const data = await getDashboardData(user.id);

    return (
      <div className="mx-auto max-w-[1200px]">
        <DashboardView data={data} />
      </div>
    );
  } catch (error) {
    if (error instanceof SchemaNotReadyError) {
      return <SchemaSetupRequired />;
    }
    throw error;
  }
}
