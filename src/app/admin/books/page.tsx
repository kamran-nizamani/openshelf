import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { TabNav } from "@/components/ui/Tabs";

const FILTERS = ["pending", "approved", "rejected", "restricted", "removed", "all"] as const;

export default async function AdminBooks({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? "pending";
  const admin = createAdminClient();
  let q = admin.from("books").select("id, title, author, status, scan, license_type, created_at, uploader_id, profiles:uploader_id(full_name)").order("created_at", { ascending: filter === "pending" }).limit(100);
  if (filter !== "all") q = q.eq("status", filter);
  const { data: books } = await q;
  return (
    <>
      <h1 className="text-3xl font-bold">Book submissions</h1>
      <div className="mt-4"><TabNav active={filter} tabs={FILTERS.map((f) => ({ key: f, label: f[0].toUpperCase() + f.slice(1), href: `/admin/books?status=${f}` }))} /></div>
      <div className="mt-6 space-y-2">
        {(books ?? []).length === 0 && <EmptyState title="Nothing here" message="No books match this filter." />}
        {(books ?? []).map((b) => {
          const p = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
          return (
            <Link key={b.id} href={`/admin/books/${b.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-card hover:ring-1 hover:ring-primary">
              <div className="min-w-0"><p className="font-semibold">{b.title}</p><p className="text-sm text-muted">{b.author} · by {(p as { full_name?: string } | null)?.full_name ?? "unknown"} · {formatDate(b.created_at)}</p></div>
              <div className="flex gap-2"><Badge value={b.scan} label={`scan: ${b.scan}`} /><Badge value={b.status} /></div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
