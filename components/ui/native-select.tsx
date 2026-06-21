import * as React from "react";

import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select className={cn("fs-field appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export { NativeSelect };
