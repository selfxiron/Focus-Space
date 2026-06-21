"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FilterSelect({
  value,
  onValueChange,
  options,
  id,
  "aria-label": ariaLabel,
  disabled,
  placeholder,
  triggerClassName,
  size = "default",
  fullWidth = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  size?: "sm" | "default";
  fullWidth?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        size={size}
        className={cn(
          fullWidth
            ? "w-full min-w-0 max-w-none"
            : "min-w-[8.5rem] w-auto max-w-[14rem]",
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
