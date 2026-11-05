import type { PublicBook } from "@/lib/types";
import { BookCard } from "./BookCard";

export function BookGrid({ books, view = "grid" }: { books: PublicBook[]; view?: "grid" | "list" }) {
  if (view === "list") return <div className="space-y-3">{books.map((b) => <BookCard key={b.id} book={b} view="list" />)}</div>;
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>;
}
