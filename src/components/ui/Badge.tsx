import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700", approved: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-700",
  removed: "bg-red-50 text-red-700", restricted: "bg-orange-50 text-orange-700",
  open: "bg-amber-50 text-amber-700", investigating: "bg-blue-50 text-blue-700", resolved: "bg-green-50 text-green-700", dismissed: "bg-surface text-muted",
  clean: "bg-green-50 text-green-700", infected: "bg-red-50 text-red-700", skipped: "bg-surface text-muted", error: "bg-red-50 text-red-700",
  suspended: "bg-red-50 text-red-700", active: "bg-green-50 text-green-700",
};
export function Badge({ value, label }: { value: string; label?: string }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", tone[value] ?? "bg-surface text-muted")}>{label ?? value}</span>;
}
export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
