import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground bg-elevated",
        success:
          "border-brand/25 bg-brand-muted text-brand",
        warning:
          "border-orange-500/25 bg-pastel-peach text-orange-400",
        info:
          "border-border bg-secondary text-muted-foreground",
        progress:
          "border-violet-500/25 bg-pastel-lavender text-violet-400",
        live:
          "border-brand/30 bg-brand-muted text-brand fs-glow-brand",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
