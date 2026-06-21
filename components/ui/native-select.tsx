import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("relative inline-flex w-auto max-w-full", wrapperClassName)}>
      <select
        className={cn(
          "h-9 min-w-[9.5rem] max-w-full appearance-none rounded-[var(--radius-button)] border border-input bg-elevated py-0 pl-3 pr-9 text-sm text-foreground",
          "transition-[border-color,box-shadow] focus-visible:outline-none",
          "focus-visible:border-[color-mix(in_srgb,var(--brand)_50%,var(--input))]",
          "focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--brand)_20%,transparent)]",
          "disabled:cursor-not-allowed disabled:opacity-55",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

export { NativeSelect };
