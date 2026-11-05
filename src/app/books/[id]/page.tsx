import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { z } from "zod";
import { getBook } from "@/lib/books";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { LICENSE_LABELS, formatBytes, formatDate, languageName } from "@/lib/utils";
import { BookCover } from "@/components/books/BookCover";
import { Stars } from "@/components/books/Stars";
import { LinkButton } from "@/components/ui/Button";
import { BookActions } from "./BookActions";
import { Reviews } from "./Reviews";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return {};
  const book = await getBook(id);
  if (!book) return { title: "Book not found" };
  return {
    title: `${book.title} by ${book.author}`,
    description: book.description.slice(0, 160),
    openGraph: { title: book.title, description: book.description.slice(0, 160), type: "book", images: book.cover_url ? [book.cover_url] : [] },
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const book = await getBook(id);
  if (!book) notFound();

  const user = await getCurrentUser();
  const supabase = await createClient();
  const [{ data: reviews }, saved] = await Promise.all([
    supabase.from("reviews").select("id, rating, body, created_at, user_id, profiles(full_name)").eq("book_id", id).order("created_at", { ascending: false }),
    user ? supabase.from("saved_books").select("is_favorite").eq("book_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const rows: Array<[string, string]> = [
    ["Publisher", book.publisher ?? "—"],
    ["Publication year", book.publication_year ? String(book.publication_year) : "—"],
    ["ISBN", book.isbn ?? "—"],
    ["Language", languageName(book.language)],
    ["Pages", book.page_count ? String(book.page_count) : "—"],
    ["Format", `PDF · ${formatBytes(book.file_size)}`],
    ["Licence", LICENSE_LABELS[book.license_type] ?? book.license_type],
    ["Uploaded by", book.uploader_name],
    ["Added", formatDate(book.created_at)],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted"><Link href="/explore" className="hover:text-primary">Explore</Link> / <Link href={`/explore?category=${book.category_slug}`} className="hover:text-primary">{book.category_name}</Link></nav>
      <div className="grid gap-8 md:grid-cols-[18rem_1fr]">
        <div className="mx-auto w-full max-w-xs md:mx-0"><div className="rounded-2xl bg-white p-3 shadow-card"><BookCover url={book.cover_url} title={book.title} priority sizes="288px" /></div></div>
        <div>
          <p className="text-sm font-semibold text-primary">{book.category_name}</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{book.title}</h1>
          <p className="mt-1 text-lg text-muted">by {book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Stars value={book.avg_rating} count={book.review_count} size={18} />
            {book.download_count > 0 && <span className="text-sm text-muted">{book.download_count} {book.download_count === 1 ? "download" : "downloads"}</span>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href={`/read/${book.id}`}><BookOpen className="h-4 w-4" /> Read Online</LinkButton>
            <BookActions bookId={book.id} title={book.title} canDownload={book.allow_download} signedIn={Boolean(user)} saved={Boolean(saved.data)} />
          </div>
          {!book.allow_download && <p className="mt-3 text-sm text-muted">The rights holder allows online reading only for this book.</p>}
          <h2 className="mt-8 text-lg font-semibold">About this book</h2>
          <p className="mt-2 whitespace-pre-line text-muted">{book.description}</p>
          <dl className="mt-8 grid gap-x-8 gap-y-3 rounded-2xl bg-white p-5 shadow-card sm:grid-cols-2">
            {rows.map(([k, v]) => <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-muted">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>)}
          </dl>
        </div>
      </div>
      <Reviews
        bookId={book.id} signedIn={Boolean(user)} currentUserId={user?.id ?? null}
        reviews={(reviews ?? []).map((r) => ({
          id: r.id, rating: r.rating, body: r.body, createdAt: r.created_at, userId: r.user_id,
          name: (Array.isArray(r.profiles) ? r.profiles[0]?.full_name : (r.profiles as { full_name: string } | null)?.full_name) ?? "Reader",
        }))}
      />
    </div>
  );
}
