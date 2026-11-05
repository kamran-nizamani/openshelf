'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <form action="/explore" role="search" className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
        <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          aria-label="Search books"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, author, ISBN, subject..."
          className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        {query ? (
          <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
        Search books
      </button>
    </form>
  );
}
