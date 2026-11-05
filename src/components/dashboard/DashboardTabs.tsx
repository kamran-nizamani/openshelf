import { TabNav } from "@/components/ui/Tabs";

export function DashboardTabs({ active }: { active: "overview" | "uploads" | "library" | "settings" }) {
  return <TabNav active={active} tabs={[
    { key: "overview", href: "/dashboard", label: "Overview" },
    { key: "uploads", href: "/dashboard/uploads", label: "My Uploads" },
    { key: "library", href: "/dashboard/library", label: "My Library" },
    { key: "settings", href: "/settings", label: "Account Settings" },
  ]} />;
}
