import {
  SidebarBrand,
  SidebarNav,
  SidebarSettingsLink,
} from "@/components/layout/sidebar-nav";

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside
      className="hidden h-full w-[240px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-5 lg:flex"
    >
      <SidebarBrand />
      <SidebarNav activePath={activePath} />
      <SidebarSettingsLink activePath={activePath} />
    </aside>
  );
}
