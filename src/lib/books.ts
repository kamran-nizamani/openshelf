import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch } from "@/lib/utils";
import type { Category, PublicBook } from "@/lib/types";

export const PAGE_SIZE = 12;

export type BookFilters = {
  q?: string; category?: string; language?: string; license?: string;
  yearFrom?: number; yearTo?: number; sort?: "newest" | "title" | "popular"; page?: number;
};

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name, slug").order("sort_order");
  return data ?? [];
}

export async function searchBooks(f: BookFilters) {
  const supabase = await createClient();
  const page = Math.max(1, f.page ?? 1);
  let query = supabase.from("public_books").select("*", { count: "exact" });

  const q = f.q ? sanitizeSearch(f.q) : "";
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,author.ilike.%${q}%,isbn.ilike.%${q.replace(/-/g, "")}%,isbn.ilike.%${q}%,category_name.ilike.%${q}%,search.plfts(simple).${q}`,
    );
  }
  if (f.category) query = query.eq("category_slug", f.category);
  if (f.language) query = query.eq("language", f.language);
  if (f.license) query = query.eq("license_type", f.license);
  if (f.yearFrom) query = query.gte("publication_year", f.yearFrom);
  if (f.yearTo) query = query.lte("publication_year", f.yearTo);

  if (f.sort === "title") query = query.order("title", { ascending: true });
  else if (f.sort === "popular") query = query.order("download_count", { ascending: false }).order("review_count", { ascending: false }).order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  return { books: (data ?? []) as PublicBook[], total: count ?? 0, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)), error: error?.message };
}

export async function getBook(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("public_books").select("*").eq("id", id).maybeSingle();
  return (data as PublicBook | null) ?? null;
}

export async function getHomeSections() {
  const supabase = await createClient();
  const [recent, popular, featured] = await Promise.all([
    supabase.from("public_books").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("public_books").select("*").gt("download_count", 0).order("download_count", { ascending: false }).limit(8),
    // "Featured" = best rated books with at least one real review
    supabase.from("public_books").select("*").gt("review_count", 0).order("avg_rating", { ascending: false }).order("review_count", { ascending: false }).limit(4),
  ]);
  return {
    recent: (recent.data ?? []) as PublicBook[],
    popular: (popular.data ?? []) as PublicBook[],
    featured: (featured.data ?? []) as PublicBook[],
  };
}

export async function getCategoryCounts() {
  const supabase = await createClient();
  const { data } = await supabase.from("public_books").select("category_slug");
  const counts: Record<string, number> = {};
  (data ?? []).forEach((r) => { counts[r.category_slug] = (counts[r.category_slug] ?? 0) + 1; });
  return counts;
}
