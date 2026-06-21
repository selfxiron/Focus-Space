import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "fs-field file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Input };
