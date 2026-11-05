import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function Dashboard() {
  const user = await requireUser();
  const supabase = await createClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: "exact", head: true } as const;
  const [total, approved, pending, rejected, saved, downloads, { data: recent }, { data: profile }] = await Promise.all([
    count(supabase.from("books").select("id", head).eq("uploader_id", user.id)),
    count(supabase.from("books").select("id", head).eq("uploader_id", user.id).eq("status", "approved")),
    count(supabase.from("books").select("id", head).eq("uploader_id", user.id).eq("status", "pending")),
    count(supabase.from("books").select("id", head).eq("uploader_id", user.id).eq("status", "rejected")),
    count(supabase.from("saved_books").select("book_id", head).eq("user_id", user.id)),
    count(supabase.from("downloads").select("id", head).eq("user_id", user.id)),
    supabase.from("reading_history").select("book_id, last_page, last_read_at").eq("user_id", user.id).order("last_read_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);
  const ids = (recent ?? []).map((r) => r.book_id);
  const { data: titles } = ids.length ? await supabase.from("public_books").select("id, title").in("id", ids) : { data: [] };
  const titleOf = new Map((titles ?? []).map((t) => [t.id, t.title]));

  return (
    <>
      <h1 className="text-3xl font-bold">Welcome, {profile?.full_name ?? "reader"}</h1>
      <div className="mt-6"><DashboardTabs active="overview" /></div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Uploaded books" value={total} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Pending" value={pending} />
        <StatCard label="Rejected" value={rejected} />
        <StatCard label="Saved books" value={saved} />
        <StatCard label="My downloads" value={downloads} />
      </div>
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Continue reading</h2><Link href="/dashboard/library?tab=history" className="text-sm text-primary">All history</Link></div>
        {(recent ?? []).filter((r) => titleOf.has(r.book_id)).length === 0 ? (
          <p className="mt-3 text-sm text-muted">You have not opened any books yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {(recent ?? []).filter((r) => titleOf.has(r.book_id)).map((r) => (
              <li key={r.book_id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0"><Link href={`/books/${r.book_id}`} className="font-medium hover:text-primary">{titleOf.get(r.book_id)}</Link>
                  <span className="block text-xs text-muted">Page {r.last_page} · {formatDate(r.last_read_at)}</span></span>
                <LinkButton href={`/read/${r.book_id}`} variant="secondary">Resume</LinkButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
