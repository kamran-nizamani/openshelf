import { SearchBar } from '@/components/SearchBar';
import { ExploreCatalog } from '@/components/ExploreCatalog';

export default function ExplorePage({ searchParams }: { searchParams?: { q?: string; category?: string } }) {
  const initialQuery = searchParams?.q ?? '';
  const initialCategory = searchParams?.category ?? '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Explore the library</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black text-slate-900">Find your next great read.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Explore books shared under public-domain, Creative Commons, author-owned, or explicitly authorized terms.</p>
        </div>
        <div className="w-full max-w-xl">
          <SearchBar initialQuery={initialQuery} />
        </div>
      </div>
      <div className="mb-8 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Frontend preview: catalogue entries are sample content until the database is connected.
      </div>
      <ExploreCatalog initialQuery={initialQuery} initialCategory={initialCategory} />
    </div>
  );
}
