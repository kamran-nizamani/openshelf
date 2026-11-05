import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBytes, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/Badge";

export default async function AdminOverview() {
  await requireStaff();
  const admin = createAdminClient();
  const head = { count: "exact", head: true } as const;
  const c = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
  const [users, books, pending, published, rejected, restricted, reports, openReports, dl, dl7, dl30, storage, { data: logs }] = await Promise.all([
    c(admin.from("profiles").select("id", head)),
    c(admin.from("books").select("id", head)),
    c(admin.from("books").select("id", head).eq("status", "pending")),
    c(admin.from("books").select("id", head).eq("status", "approved")),
    c(admin.from("books").select("id", head).eq("status", "rejected")),
    c(admin.from("books").select("id", head).in("status", ["restricted", "removed"])),
    c(admin.from("reports").select("id", head)),
    c(admin.from("reports").select("id", head).in("status", ["open", "investigating"])),
    c(admin.from("downloads").select("id", head)),
    c(admin.from("downloads").select("id", head).gte("created_at", day(7))),
    c(admin.from("downloads").select("id", head).gte("created_at", day(30))),
    admin.rpc("admin_storage_bytes").then((r) => Number(r.data ?? 0)),
    admin.from("moderation_logs").select("id, action, note, created_at").order("created_at", { ascending: false }).limit(15),
  ]);
  return (
    <>
      <h1 className="text-3xl font-bold">Platform overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total users" value={users} />
        <StatCard label="Total books" value={books} />
        <StatCard label="Pending review" value={pending} />
        <StatCard label="Published" value={published} />
        <StatCard label="Rejected" value={rejected} />
        <StatCard label="Restricted / removed" value={restricted} />
        <StatCard label="Reports received" value={reports} hint={`${openReports} need attention`} />
        <StatCard label="PDF storage used" value={formatBytes(storage)} />
        <StatCard label="Downloads (all time)" value={dl} />
        <StatCard label="Downloads, 7 days" value={dl7} />
        <StatCard label="Downloads, 30 days" value={dl30} />
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold">Recent moderation activity</h2>
        {(logs ?? []).length === 0 ? <p className="mt-3 text-sm text-muted">No moderation actions yet.</p> : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {(logs ?? []).map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2"><span><code className="rounded bg-surface px-1.5 py-0.5">{l.action}</code>{l.note ? <span className="ml-2 text-muted">{l.note}</span> : null}</span><span className="text-xs text-muted">{formatDate(l.created_at)}</span></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
