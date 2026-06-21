import {
  BookOpen,
  Brain,
  Calculator,
  Code2,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

export const SUBJECT_ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  calculator: Calculator,
  folder: FolderKanban,
  brain: Brain,
  code: Code2,
};

export const SUBJECT_ICON_OPTIONS = Object.keys(SUBJECT_ICONS);

export const SUBJECT_COLORS = [
  "#14B8A6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
] as const;

export function getSubjectIcon(icon: string): LucideIcon {
  return SUBJECT_ICONS[icon] ?? FolderKanban;
}
