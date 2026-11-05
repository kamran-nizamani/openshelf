import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getCategoryCounts } from "@/lib/books";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/ui/States";

export const metadata: Metadata = { title: "Categories", description: "Browse OpenShelf books by category." };

export default async function CategoriesPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const [cats, counts] = await Promise.all([getCategories(), getCategoryCounts()]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-1 text-muted">Find your next read by subject.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} href={`/explore?category=${c.slug}`} className="rounded-2xl bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-lg font-semibold">{c.name}</p>
            <p className="mt-1 text-sm text-muted">{counts[c.slug] ?? 0} {(counts[c.slug] ?? 0) === 1 ? "book" : "books"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
