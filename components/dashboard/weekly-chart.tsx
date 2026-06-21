"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardChartDay } from "@/lib/data/dashboard";

interface WeeklyChartProps {
  chart7d: DashboardChartDay[];
  chart14d: DashboardChartDay[];
}

export function WeeklyChart({ chart7d, chart14d }: WeeklyChartProps) {
  const [range, setRange] = useState<"7d" | "14d">("7d");
  const data = range === "7d" ? chart7d : chart14d;

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Weekly Study Activity</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Hours per day
          </p>
        </div>
        <div className="flex gap-1 rounded-[12px] bg-secondary p-1">
          <Button
            variant={range === "7d" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setRange("7d")}
          >
            7d
          </Button>
          <Button
            variant={range === "14d" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            onClick={() => setRange("14d")}
          >
            14d
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {data.every((d) => d.hours === 0) ? (
          <EmptyState
            icon={BarChart3}
            title="No study time yet"
            description="Tracked hours will appear here once you log sessions."
            className="h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                cursor={{ fill: "rgba(45, 212, 191, 0.08)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.label ?? ""
                }
                formatter={(value: number) => [`${value}h`, "Study"]}
              />
              <Bar
                dataKey="hours"
                fill="var(--brand-dark)"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
