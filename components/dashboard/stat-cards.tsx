import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  pastel: "peach" | "mint" | "lavender" | "sky";
}

const pastelMap = {
  peach: "bg-pastel-peach",
  mint: "bg-pastel-mint",
  lavender: "bg-pastel-lavender",
  sky: "bg-pastel-sky",
} as const;

export function StatCard({ label, value, subtitle, pastel }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-5 shadow-[var(--shadow-card)]",
        pastelMap[pastel]
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

