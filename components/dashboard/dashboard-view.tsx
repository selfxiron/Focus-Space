import { StatCard } from "@/components/dashboard/stat-cards";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SubjectCards } from "@/components/dashboard/subject-cards";
import { DashboardTodoTable } from "@/components/dashboard/dashboard-todo-table";
import type { DashboardData } from "@/lib/data/dashboard";

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeeklyChart chart7d={data.chart7d} chart14d={data.chart14d} />
        </div>
        <RecentSessions sessions={data.recentSessions} />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold">Subjects</h2>
        <SubjectCards subjects={data.subjectHours} />
      </div>

      <DashboardTodoTable todos={data.todos} />
    </div>
  );
}
