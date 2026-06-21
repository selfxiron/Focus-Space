"use client";

import dynamic from "next/dynamic";

import type { DashboardChartDay } from "@/lib/data/dashboard";

const WeeklyChart = dynamic(
  () =>
    import("@/components/dashboard/weekly-chart").then((mod) => mod.WeeklyChart),
  {
    loading: () => (
      <div className="h-[280px] animate-pulse rounded-[20px] bg-secondary/50" />
    ),
  }
);

export function WeeklyChartDynamic({
  chart7d,
  chart14d,
}: {
  chart7d: DashboardChartDay[];
  chart14d: DashboardChartDay[];
}) {
  return <WeeklyChart chart7d={chart7d} chart14d={chart14d} />;
}
