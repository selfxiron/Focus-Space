"use client";

import { motion } from "framer-motion";

import { easeOut } from "@/components/motion/motion-config";
import { cn } from "@/lib/utils";

export function CountdownRing({
  progress,
  size = 168,
  strokeWidth = 5,
  className,
  children,
  glow = true,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative mx-auto", className)}
      style={{ width: size, height: size }}
    >
      {glow && clamped > 0 && (
        <div
          className="pointer-events-none absolute inset-2 rounded-full opacity-40 blur-xl"
          style={{
            background: `conic-gradient(from 0deg, var(--brand) ${clamped}%, transparent ${clamped}%)`,
          }}
          aria-hidden
        />
      )}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.55, ease: easeOut }}
          style={{
            filter: glow ? "drop-shadow(0 0 6px var(--brand-glow))" : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
