import Link from "next/link";
import { cn } from "@/lib/utils";

export function TabNav({ tabs, active }: { tabs: Array<{ href: string; label: string; key: string }>; active: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <Link key={t.key} href={t.href} role="tab" aria-selected={active === t.key}
          className={cn("whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium", active === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-navy")}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
