import { cn } from "@/lib/utils";

interface GoalProgressRingProps {
  percent: number;
  color?: string;
  size?: number;
  className?: string;
  glow?: boolean;
}

export function GoalProgressRing({
  percent,
  color = "var(--brand)",
  size = 72,
  className,
  glow = false,
}: GoalProgressRingProps) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        glow && percent > 0 && "fs-glow-brand rounded-full",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={
            glow && percent > 0
              ? { filter: "drop-shadow(0 0 6px var(--brand-glow))" }
              : undefined
          }
        />
      </svg>
      <span
        className={cn(
          "absolute font-bold tabular-nums tracking-tight",
          size >= 120 ? "text-2xl" : "text-sm"
        )}
      >
        {percent}%
      </span>
    </div>
  );
}
