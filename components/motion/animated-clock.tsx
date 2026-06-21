"use client";

import { motion } from "framer-motion";

import { easeOut } from "@/components/motion/motion-config";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

export function AnimatedClock({
  value,
  className,
  pulse = true,
}: {
  value: string;
  className?: string;
  /** Subtle tick pulse each time value changes */
  pulse?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <p className={cn("tabular-nums tracking-tight", className)}>{value}</p>
    );
  }

  return (
    <motion.p
      key={value}
      className={cn("tabular-nums tracking-tight", className)}
      initial={{ opacity: 0.55, y: 6, filter: "blur(2px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: pulse ? [1, 1.015, 1] : 1,
      }}
      transition={{
        opacity: { duration: 0.2, ease: easeOut },
        y: { duration: 0.25, ease: easeOut },
        filter: { duration: 0.2 },
        scale: { duration: 0.35, ease: "easeOut" },
      }}
    >
      {value}
    </motion.p>
  );
}
