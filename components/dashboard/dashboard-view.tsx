import { StatCard } from "@/components/dashboard/stat-cards";
import { WeeklyChartDynamic } from "@/components/dashboard/weekly-chart-dynamic";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SubjectCards } from "@/components/dashboard/subject-cards";
import { DashboardTodoTable } from "@/components/dashboard/dashboard-todo-table";
import { FadeIn, StaggerItem, StaggerList } from "@/components/motion/fade-in";
import type { DashboardData } from "@/lib/data/dashboard";

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8">
      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <StatCard {...stat} />
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyChartDynamic chart7d={data.chart7d} chart14d={data.chart14d} />
          </div>
          <RecentSessions sessions={data.recentSessions} />
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div>
          <h2 className="mb-4 text-base font-semibold">Subjects</h2>
          <SubjectCards subjects={data.subjectHours} />
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <DashboardTodoTable todos={data.todos} />
      </FadeIn>
    </div>
  );
}
