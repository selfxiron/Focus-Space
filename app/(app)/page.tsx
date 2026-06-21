import {
  PLACEHOLDER_STATS,
  StatCard,
} from "@/components/dashboard/stat-cards";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SubjectCards } from "@/components/dashboard/subject-cards";
import { TodoTable } from "@/components/dashboard/todo-table";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <RecentSessions />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold">Subjects</h2>
        <SubjectCards />
      </div>

      <TodoTable />
    </div>
  );
}
