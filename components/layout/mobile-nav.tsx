"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import {
  SidebarBrand,
  SidebarNav,
  SidebarSettingsLink,
} from "@/components/layout/sidebar-nav";
import { easeOut, springSnappy } from "@/components/motion/motion-config";
import { useReducedMotion } from "@/components/motion/use-reduced-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const navItem = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: easeOut },
  },
};

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
  const reducedMotion = useReducedMotion();

  // Close only when the route changes — not when `open` flips to true.
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  const close = () => onOpenChange(false);

  const overlayTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: easeOut };

  const panelTransition = reducedMotion ? { duration: 0 } : springSnappy;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <DialogPrimitive.Overlay forceMount asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={overlayTransition}
                  aria-hidden={!open}
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content forceMount asChild>
                <motion.aside
                  className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-2.5rem,280px)] flex-col border-r border-border bg-sidebar px-3 py-5 shadow-[var(--shadow-elevated)] outline-none lg:hidden"
                  )}
                  initial={reducedMotion ? false : { x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={panelTransition}
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
                  <motion.div
                    variants={reducedMotion ? undefined : navStagger}
                    initial={reducedMotion ? false : "hidden"}
                    animate="show"
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <motion.div variants={reducedMotion ? undefined : navItem}>
                      <SidebarBrand onNavigate={close} className="mb-6 pr-10" />
                    </motion.div>
                    <motion.div
                      variants={reducedMotion ? undefined : navItem}
                      className="min-h-0 flex-1"
                    >
                      <SidebarNav activePath={activePath} onNavigate={close} />
                    </motion.div>
                    <motion.div variants={reducedMotion ? undefined : navItem}>
                      <SidebarSettingsLink
                        activePath={activePath}
                        onNavigate={close}
                      />
                    </motion.div>
                  </motion.div>
                </motion.aside>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
