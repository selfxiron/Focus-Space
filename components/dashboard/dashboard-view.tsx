import { StatCard } from "@/components/dashboard/stat-cards";
import { WeeklyChartDynamic } from "@/components/dashboard/weekly-chart-dynamic";
import { WeeklyFocusCard } from "@/components/dashboard/weekly-focus-card";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { SubjectCards } from "@/components/dashboard/subject-cards";
import { DashboardTodoTable } from "@/components/dashboard/dashboard-todo-table";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn, StaggerItem, StaggerList } from "@/components/motion/fade-in";
import type { DashboardData } from "@/lib/data/dashboard";

export function DashboardView({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <StatCard {...stat} />
          </StaggerItem>
        ))}
      </StaggerList>

      <FadeIn delay={0.1}>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyChartDynamic chart7d={data.chart7d} chart14d={data.chart14d} />
          </div>
          <WeeklyFocusCard
            percent={data.weeklyFocus.percent}
            actualHours={data.weeklyFocus.actualHours}
            targetHours={data.weeklyFocus.targetHours}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.12}>
        <RecentSessions sessions={data.recentSessions} />
      </FadeIn>

      <FadeIn delay={0.15}>
        <PageSection
          title="Subjects"
          description="Total hours logged per subject"
        >
          <SubjectCards subjects={data.subjectHours} />
        </PageSection>
      </FadeIn>

      <FadeIn delay={0.2}>
        <DashboardTodoTable todos={data.todos} />
      </FadeIn>
    </div>
  );
}
