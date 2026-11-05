import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/books";
import { LICENSE_LABELS, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { TabNav } from "@/components/ui/Tabs";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { UploadRowActions } from "@/components/dashboard/UploadRowActions";

export const metadata: Metadata = { title: "My uploads", robots: { index: false } };
const FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default async function MyUploads({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f === sp.status) ?? "all";
  const supabase = await createClient();
  let q = supabase.from("books").select("*").eq("uploader_id", user.id).order("created_at", { ascending: false });
  if (filter !== "all") q = q.eq("status", filter);
  const [{ data: books }, categories] = await Promise.all([q, getCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">My uploads</h1><LinkButton href="/upload">Upload a book</LinkButton></div>
      <div className="mt-6"><DashboardTabs active="uploads" /></div>
      <div className="mt-4"><TabNav active={filter} tabs={FILTERS.map((f) => ({ key: f, href: f === "all" ? "/dashboard/uploads" : `/dashboard/uploads?status=${f}`, label: f[0].toUpperCase() + f.slice(1) }))} /></div>
      <div className="mt-6 space-y-3">
        {(books ?? []).length === 0 && <EmptyState title="No uploads here" message="Books you upload appear here with their review status." action={<LinkButton href="/upload">Upload your first book</LinkButton>} />}
        {(books ?? []).map((b) => (
          <article key={b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{b.status === "approved" ? <Link href={`/books/${b.id}`} className="hover:text-primary">{b.title}</Link> : b.title}</h3><Badge value={b.status} /></div>
              <p className="text-sm text-muted">{b.author} · {catName.get(b.category_id)} · {LICENSE_LABELS[b.license_type]} · Uploaded {formatDate(b.created_at)}</p>
              {b.rejection_reason && <p className="mt-1 text-sm text-red-700">Moderator note: {b.rejection_reason}</p>}
              {b.status === "pending" && <p className="mt-1 text-xs text-muted">Waiting for moderator review.</p>}
            </div>
            <UploadRowActions canDelete={!["restricted", "removed"].includes(b.status)} categories={categories} book={{
              id: b.id, title: b.title, author: b.author, description: b.description, categoryId: b.category_id, language: b.language,
              publicationYear: b.publication_year, isbn: b.isbn, publisher: b.publisher, allowDownload: b.allow_download,
              licenseType: b.license_type, licenseEvidence: b.license_evidence, status: b.status,
            }} />
          </article>
        ))}
      </div>
    </>
  );
}
