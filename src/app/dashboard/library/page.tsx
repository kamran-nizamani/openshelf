import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { PublicBook } from "@/lib/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/ui/States";
import { LinkButton } from "@/components/ui/Button";
import { TabNav } from "@/components/ui/Tabs";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { LibraryItemActions } from "@/components/dashboard/LibraryItemActions";

export const metadata: Metadata = { title: "My Library", robots: { index: false } };
const TABS = [["saved", "Saved"], ["favorites", "Favourites"], ["history", "Reading history"]] as const;

export default async function MyLibrary({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const tab = TABS.find(([k]) => k === sp.tab)?.[0] ?? "saved";
  const supabase = await createClient();

  const [{ data: saved }, { data: history }] = await Promise.all([
    supabase.from("saved_books").select("book_id, is_favorite, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("reading_history").select("book_id, last_page, last_read_at").eq("user_id", user.id).order("last_read_at", { ascending: false }).limit(50),
  ]);
  const ids = [...new Set([...(saved ?? []).map((s) => s.book_id), ...(history ?? []).map((h) => h.book_id)])];
  // Resolve through the public view: books that were removed or restricted simply disappear.
  const { data: books } = ids.length ? await supabase.from("public_books").select("*").in("id", ids) : { data: [] };
  const byId = new Map(((books ?? []) as PublicBook[]).map((b) => [b.id, b]));

  const savedItems = (saved ?? []).filter((s) => byId.has(s.book_id) && (tab === "saved" || s.is_favorite));
  const historyItems = (history ?? []).filter((h) => byId.has(h.book_id));

  return (
    <>
      <h1 className="text-3xl font-bold">My Library</h1>
      <div className="mt-6"><DashboardTabs active="library" /></div>
      <div className="mt-4"><TabNav active={tab} tabs={TABS.map(([k, l]) => ({ key: k, label: l, href: `/dashboard/library?tab=${k}` }))} /></div>
      <div className="mt-6">
        {tab !== "history" ? (
          savedItems.length === 0 ? (
            <EmptyState title={tab === "saved" ? "Nothing saved yet" : "No favourites yet"} message="Use “Add to My Library” on any book page." action={<LinkButton href="/explore">Explore books</LinkButton>} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {savedItems.map((s) => (
                <div key={s.book_id}><BookCard book={byId.get(s.book_id)!} /><LibraryItemActions bookId={s.book_id} userId={user.id} favorite={s.is_favorite} /></div>
              ))}
            </div>
          )
        ) : historyItems.length === 0 ? (
          <EmptyState title="No reading history" message="Books you open in the reader show up here so you can resume." action={<LinkButton href="/explore">Find something to read</LinkButton>} />
        ) : (
          <ul className="divide-y divide-line rounded-2xl bg-white shadow-card">
            {historyItems.map((h) => (
              <li key={h.book_id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0"><Link href={`/books/${h.book_id}`} className="font-medium hover:text-primary">{byId.get(h.book_id)!.title}</Link>
                  <p className="text-xs text-muted">{byId.get(h.book_id)!.author} · Page {h.last_page} · {formatDate(h.last_read_at)}</p></div>
                <LinkButton href={`/read/${h.book_id}`} variant="secondary">Resume</LinkButton>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
