"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import {
  SidebarBrand,
  SidebarNav,
  SidebarSettingsLink,
} from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav({
  open,
  onOpenChange,
  activePath,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activePath: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onOpenChange(false);
    }
  }, [pathname, open, onOpenChange]);

  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,280px)] flex-col border-r border-border bg-sidebar px-3 py-5 shadow-[var(--shadow-elevated)] outline-none lg:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Navigation menu
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-3 z-10 h-9 w-9"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogPrimitive.Close>
          <SidebarBrand onNavigate={close} className="mb-6 pr-10" />
          <SidebarNav activePath={activePath} onNavigate={close} />
          <SidebarSettingsLink activePath={activePath} onNavigate={close} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
