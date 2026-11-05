import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, List, SearchX } from "lucide-react";
import { getCategories, searchBooks, type BookFilters } from "@/lib/books";
import { isSupabaseConfigured } from "@/lib/env";
import { LANGUAGES, LICENSE_LABELS, cn } from "@/lib/utils";
import { BookGrid } from "@/components/books/BookGrid";
import { SearchBar } from "@/components/books/SearchBar";
import { EmptyState, ErrorState, SetupNotice } from "@/components/ui/States";
import { LinkButton } from "@/components/ui/Button";
import { inputCls } from "@/components/ui/Field";

export const metadata: Metadata = { title: "Explore Books", description: "Search and filter the OpenShelf catalogue of free, legally shareable books." };

type SP = Record<string, string | undefined>;

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const sp = await searchParams;
  const view = sp.view === "list" ? "list" : "grid";
  const sort = (["newest", "title", "popular"].includes(sp.sort ?? "") ? sp.sort : "newest") as BookFilters["sort"];
  const filters: BookFilters = {
    q: sp.q, category: sp.category, language: sp.language, license: sp.license, sort,
    yearFrom: sp.yearFrom ? Number(sp.yearFrom) || undefined : undefined,
    yearTo: sp.yearTo ? Number(sp.yearTo) || undefined : undefined,
    page: Number(sp.page) || 1,
  };
  const [cats, result] = await Promise.all([getCategories(), searchBooks(filters)]);

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged: SP = { ...sp, ...over };
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/explore?${p.toString()}`;
  };
  const hasFilters = Boolean(sp.q || sp.category || sp.language || sp.license || sp.yearFrom || sp.yearTo);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Explore books</h1>
      <div className="mt-5 max-w-2xl"><SearchBar initial={sp.q ?? ""} /></div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <form action="/explore" className="h-fit space-y-4 rounded-2xl bg-white p-4 shadow-card">
          {sp.q && <input type="hidden" name="q" value={sp.q} />}
          {sp.view && <input type="hidden" name="view" value={sp.view} />}
          <label className="block text-sm font-medium">Category
            <select name="category" defaultValue={sp.category ?? ""} className={cn(inputCls, "mt-1")}>
              <option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select></label>
          <label className="block text-sm font-medium">Language
            <select name="language" defaultValue={sp.language ?? ""} className={cn(inputCls, "mt-1")}>
              <option value="">Any language</option>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select></label>
          <label className="block text-sm font-medium">Licence
            <select name="license" defaultValue={sp.license ?? ""} className={cn(inputCls, "mt-1")}>
              <option value="">Any licence</option>{Object.entries(LICENSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm font-medium">Year from<input name="yearFrom" type="number" min={1000} max={2100} defaultValue={sp.yearFrom} className={cn(inputCls, "mt-1")} /></label>
            <label className="block text-sm font-medium">Year to<input name="yearTo" type="number" min={1000} max={2100} defaultValue={sp.yearTo} className={cn(inputCls, "mt-1")} /></label>
          </div>
          <label className="block text-sm font-medium">Sort by
            <select name="sort" defaultValue={sort} className={cn(inputCls, "mt-1")}>
              <option value="newest">Newest</option><option value="title">Title (A–Z)</option><option value="popular">Most popular</option>
            </select></label>
          <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Apply filters</button>
          {hasFilters && <Link href="/explore" className="block text-center text-sm font-semibold text-primary">Clear all</Link>}
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted">{result.total} {result.total === 1 ? "book" : "books"}{sp.q ? ` for “${sp.q}”` : ""}</p>
            <div className="flex gap-1 rounded-xl bg-white p-1 shadow-card" role="group" aria-label="View">
              <Link href={qs({ view: undefined })} aria-label="Grid view" className={cn("rounded-lg p-2", view === "grid" ? "bg-primary text-white" : "text-muted hover:text-primary")}><LayoutGrid className="h-4 w-4" /></Link>
              <Link href={qs({ view: "list" })} aria-label="List view" className={cn("rounded-lg p-2", view === "list" ? "bg-primary text-white" : "text-muted hover:text-primary")}><List className="h-4 w-4" /></Link>
            </div>
          </div>

          {result.error ? <ErrorState message="We couldn't load the catalogue. Please try again." action={<LinkButton href="/explore" variant="secondary">Retry</LinkButton>} /> :
            result.books.length === 0 ? (
              <EmptyState title={hasFilters ? "No books match your search" : "No books published yet"}
                message={hasFilters ? "Try different keywords or clear some filters." : "Be the first to upload a legally shareable book."}
                action={hasFilters ? <LinkButton href="/explore" variant="secondary"><SearchX className="h-4 w-4" /> Clear search</LinkButton> : <LinkButton href="/upload">Upload a book</LinkButton>} />
            ) : <BookGrid books={result.books} view={view} />}

          {result.pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              {result.page > 1 && <Link className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-card hover:text-primary" href={qs({ page: String(result.page - 1) })}>Previous</Link>}
              <span className="text-sm text-muted">Page {result.page} of {result.pages}</span>
              {result.page < result.pages && <Link className="rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-card hover:text-primary" href={qs({ page: String(result.page + 1) })}>Next</Link>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
