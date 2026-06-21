import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "fs-field min-h-[80px] py-2 shadow-sm placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
