"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings,
  Timer,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Time Tracker", icon: Timer },
  { href: "/todos", label: "Todos", icon: ListTodo },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/subjects", label: "Subjects", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const COMMAND_PALETTE_OPEN_EVENT = "focus-space:command-palette-open";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    function onOpenEvent() {
      setOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, onOpenEvent);
    };
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  async function handleNewNote() {
    setOpen(false);
    router.push("/notes?new=1");
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => navigate(item.href)}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          <CommandItem
            value="New note"
            onSelect={() => void handleNewNote()}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            New note
          </CommandItem>
          <CommandItem
            value="New task todos"
            onSelect={() => navigate("/todos")}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
            Open todos
          </CommandItem>
          <CommandItem
            value="Start timer tracker"
            onSelect={() => navigate("/tracker")}
          >
            <Timer className="h-4 w-4 text-muted-foreground" />
            Open tracker
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
