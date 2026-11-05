import { notFound } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/books";
import { LICENSE_LABELS, formatBytes, formatDate, languageName } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BookCover } from "@/components/books/BookCover";
import { BookModeration } from "@/components/admin/BookModeration";

export default async function AdminBook({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const admin = createAdminClient();
  const { data: b } = await admin.from("books").select("*, profiles:uploader_id(full_name, strikes, suspended)").eq("id", id).maybeSingle();
  if (!b) notFound();
  const [categories, { data: logs }, { data: reports }] = await Promise.all([
    getCategories(),
    admin.from("moderation_logs").select("id, action, note, created_at").eq("book_id", id).order("created_at", { ascending: false }).limit(20),
    admin.from("reports").select("id, kind, status, created_at").eq("book_id", id).order("created_at", { ascending: false }),
  ]);
  const up = (Array.isArray(b.profiles) ? b.profiles[0] : b.profiles) as { full_name: string; strikes: number; suspended: boolean } | null;
  const rows: Array<[string, string]> = [
    ["Author", b.author], ["Category", categories.find((c) => c.id === b.category_id)?.name ?? "—"], ["Language", languageName(b.language)],
    ["Year", b.publication_year ? String(b.publication_year) : "—"], ["ISBN", b.isbn ?? "—"], ["Publisher", b.publisher ?? "—"],
    ["Pages", b.page_count ? String(b.page_count) : "—"], ["File", `${formatBytes(b.file_size)} · sha256 ${b.file_sha256?.slice(0, 12)}…`],
    ["Downloads allowed", b.allow_download ? "Yes" : "Read-only"], ["Uploaded", formatDate(b.created_at)],
    ["Uploader", `${up?.full_name ?? "?"} · ${up?.strikes ?? 0} strike(s)${up?.suspended ? " · SUSPENDED" : ""}`],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <div className="max-w-xs"><div className="rounded-2xl bg-white p-3 shadow-card"><BookCover url={b.cover_url} title={b.title} sizes="256px" /></div></div>
      <div className="space-y-5">
        <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">{b.title}</h1><Badge value={b.status} /><Badge value={b.scan} label={`scan: ${b.scan}`} /></div>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{b.description}</p></div>
        <dl className="grid gap-3 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-2">
          {rows.map(([k, v]) => <div key={k}><dt className="text-xs font-medium uppercase text-muted">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}
        </dl>
        <div className="rounded-2xl border-2 border-primary/20 bg-white p-5">
          <p className="text-xs font-medium uppercase text-muted">Licence: {LICENSE_LABELS[b.license_type]} — evidence provided by uploader (verify before approving)</p>
          <p className="mt-1 whitespace-pre-line text-sm">{b.license_evidence}</p>
          {b.rejection_reason && <p className="mt-3 text-sm text-red-700">Last moderation note: {b.rejection_reason}</p>}
        </div>
        <BookModeration status={b.status} scan={b.scan} categories={categories} book={{
          id: b.id, title: b.title, author: b.author, description: b.description, categoryId: b.category_id, language: b.language,
          publicationYear: b.publication_year, isbn: b.isbn, publisher: b.publisher, allowDownload: b.allow_download,
          licenseType: b.license_type, licenseEvidence: b.license_evidence, status: b.status,
        }} />
        {(reports ?? []).length > 0 && <div className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-semibold">Reports on this book</h2>
          <ul className="mt-2 space-y-1 text-sm">{(reports ?? []).map((r) => <li key={r.id}><Link href="/admin/reports" className="text-primary">{r.kind}</Link> · <Badge value={r.status} /> · {formatDate(r.created_at)}</li>)}</ul></div>}
        <div className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-semibold">Moderation history</h2>
          {(logs ?? []).length === 0 ? <p className="mt-2 text-sm text-muted">No actions recorded.</p> :
            <ul className="mt-2 space-y-1 text-sm">{(logs ?? []).map((l) => <li key={l.id}><code className="rounded bg-surface px-1.5">{l.action}</code> {l.note && <span className="text-muted">— {l.note}</span>} <span className="text-xs text-muted">{formatDate(l.created_at)}</span></li>)}</ul>}
        </div>
      </div>
    </div>
  );
}
