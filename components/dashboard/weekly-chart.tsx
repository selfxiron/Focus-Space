"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  const maxHours = Math.max(...data.map((d) => d.hours), 0);
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Study intensity</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Hours per day</p>
        </div>
        <div className="flex gap-1 rounded-[var(--radius-button)] border border-border bg-secondary p-1">
          <Button
            variant={range === "7d" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setRange("7d")}
          >
            7d
          </Button>
          <Button
            variant={range === "14d" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3"
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
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                cursor={{ fill: "var(--chart-cursor)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-elevated)",
                  backgroundColor: "var(--elevated)",
                  color: "var(--foreground)",
                }}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.label ?? ""
                }
                formatter={(value: number) => [`${value}h`, "Study"]}
              />
              <Bar dataKey="hours" radius={[8, 8, 4, 4]} maxBarSize={40}>
                {data.map((entry, index) => {
                  const isPeak =
                    entry.hours > 0 && entry.hours === maxHours;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isPeak
                          ? "var(--chart-bar-active)"
                          : "var(--chart-bar-inactive)"
                      }
                      style={
                        isPeak
                          ? { filter: "drop-shadow(0 0 8px var(--brand-glow))" }
                          : undefined
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      {!data.every((d) => d.hours === 0) && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>{range === "7d" ? "Last 7 days" : "Last 14 days"}</span>
          <span className="font-medium text-foreground">
            Total: {Math.round(totalHours * 10) / 10}h
          </span>
        </div>
      )}
    </Card>
  );
}
