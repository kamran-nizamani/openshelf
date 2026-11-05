import Link from "next/link";
import { Download } from "lucide-react";
import type { PublicBook } from "@/lib/types";
import { languageName } from "@/lib/utils";
import { BookCover } from "./BookCover";
import { Stars } from "./Stars";

export function BookCard({ book, view = "grid" }: { book: PublicBook; view?: "grid" | "list" }) {
  const free = book.allow_download;
  if (view === "list") {
    return (
      <Link href={`/books/${book.id}`} className="flex gap-4 rounded-2xl bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="w-24 shrink-0 sm:w-28"><BookCover url={book.cover_url} title={book.title} sizes="112px" /></div>
        <div className="min-w-0 flex-1 py-1">
          <p className="text-xs font-medium text-primary">{book.category_name} · {languageName(book.language)}</p>
          <h3 className="mt-0.5 line-clamp-2 text-base font-semibold">{book.title}</h3>
          <p className="text-sm text-muted">{book.author}</p>
          <p className="mt-2 line-clamp-2 hidden text-sm text-muted sm:block">{book.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Stars value={book.avg_rating} count={book.review_count} />
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${free ? "bg-green-50 text-green-700" : "bg-surface text-muted"}`}>
              {free ? "Free download" : "Read online only"}
            </span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <Link href={`/books/${book.id}`} className="group flex flex-col rounded-2xl bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <BookCover url={book.cover_url} title={book.title} />
        {free && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-green-700 shadow">
            <Download className="h-3 w-3" /> Free
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-primary">{book.category_name}</p>
      <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold group-hover:text-primary">{book.title}</h3>
      <p className="line-clamp-1 text-xs text-muted">{book.author}</p>
      <p className="mt-1 text-xs text-muted">{languageName(book.language)}</p>
      <div className="mt-2"><Stars value={book.avg_rating} count={book.review_count} size={14} /></div>
    </Link>
  );
}
