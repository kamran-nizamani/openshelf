import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { TabNav } from "@/components/ui/Tabs";
import { ReportActions } from "@/components/admin/ReportActions";

const FILTERS = ["active", "resolved", "dismissed", "all"] as const;

export default async function AdminReports({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? "active";
  const admin = createAdminClient();
  let q = admin.from("reports").select("*, books:book_id(id, title, status), reporter:reporter_id(full_name)").order("created_at", { ascending: false }).limit(100);
  if (filter === "active") q = q.in("status", ["open", "investigating"]);
  else if (filter !== "all") q = q.eq("status", filter);
  const { data: reports } = await q;
  const one = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v) ?? null;

  return (
    <>
      <h1 className="text-3xl font-bold">Reports &amp; copyright complaints</h1>
      <div className="mt-4"><TabNav active={filter} tabs={FILTERS.map((f) => ({ key: f, label: f[0].toUpperCase() + f.slice(1), href: `/admin/reports?status=${f}` }))} /></div>
      <div className="mt-6 space-y-3">
        {(reports ?? []).length === 0 && <EmptyState title="No reports" message="Nothing to review in this view." />}
        {(reports ?? []).map((r) => {
          const book = one(r.books as { id: string; title: string; status: string } | { id: string; title: string; status: string }[] | null);
          const reporter = one(r.reporter as { full_name: string } | { full_name: string }[] | null);
          return (
            <article key={r.id} className="rounded-2xl bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <Badge value={r.status} /><span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold">{r.kind.replace("_", " ")}</span>
                <span className="text-xs text-muted">{formatDate(r.created_at)} · from {reporter?.full_name ?? r.reporter_email ?? "unknown"}</span>
              </div>
              {book ? <p className="mt-2 text-sm">Book: <Link className="font-semibold text-primary" href={`/admin/books/${book.id}`}>{book.title}</Link> <Badge value={book.status} /></p> : <p className="mt-2 text-sm text-muted">The book no longer exists.</p>}
              <p className="mt-2 whitespace-pre-line text-sm">{r.details}</p>
              {(r.claimant_name || r.claimant_contact) && <p className="mt-2 text-xs text-muted">Claimant: {r.claimant_name ?? "—"} · {r.claimant_contact ?? "—"}</p>}
              <ReportActions reportId={r.id} hasBook={Boolean(book)} status={r.status} note={r.resolution_note ?? ""} />
            </article>
          );
        })}
      </div>
    </>
  );
}
