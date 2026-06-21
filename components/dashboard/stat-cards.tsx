import {
  CheckCircle2,
  Clock,
  Flame,
  Target,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  pastel: "peach" | "mint" | "lavender" | "sky";
}

const pastelConfig: Record<
  StatCardProps["pastel"],
  { accent: string; icon: LucideIcon }
> = {
  peach: { accent: "var(--accent-peach)", icon: Clock },
  mint: { accent: "var(--accent-mint)", icon: Target },
  lavender: { accent: "var(--accent-lavender)", icon: CheckCircle2 },
  sky: { accent: "var(--accent-sky)", icon: Flame },
};

export function StatCard({ label, value, subtitle, pastel }: StatCardProps) {
  const config = pastelConfig[pastel];
  const Icon = config.icon;

  return (
    <div className="fs-panel group rounded-[var(--radius-card)] p-5 transition-all duration-200 hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="fs-metric mt-3 text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="fs-icon-box h-10 w-10 shrink-0">
          <Icon className="h-4 w-4" style={{ color: config.accent }} />
        </div>
      </div>
    </div>
  );
}
