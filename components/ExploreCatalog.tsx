'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { books, categories } from '@/lib/data';

interface ExploreCatalogProps {
  initialQuery: string;
  initialCategory: string;
}

export function ExploreCatalog({ initialQuery, initialCategory }: ExploreCatalogProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(
    categories.some((item) => item.name === initialCategory) ? initialCategory : 'All subjects',
  );
  const [language, setLanguage] = useState('Any language');
  const [license, setLicense] = useState('Any licence');
  const [year, setYear] = useState('Any year');
  const [sort, setSort] = useState('Newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setQuery(initialQuery);
    setPage(1);
  }, [initialQuery]);

  useEffect(() => {
    setCategory(categories.some((item) => item.name === initialCategory) ? initialCategory : 'All subjects');
    setPage(1);
  }, [initialCategory]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        [book.title, book.author, book.category, book.language, book.isbn, ...book.tags]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery));

      return (
        matchesQuery &&
        (category === 'All subjects' || book.category === category) &&
        (language === 'Any language' || book.language === language) &&
        (license === 'Any licence' || book.licenseType === license) &&
        (year === 'Any year' || String(book.publicationYear) === year)
      );
    });

    return result.sort((first, second) => {
      if (sort === 'Title A–Z') return first.title.localeCompare(second.title);
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }, [category, language, license, query, sort, year]);

  const pageCount = Math.ceil(filteredBooks.length / pageSize);
  const visibleBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setQuery('');
    setCategory('All subjects');
    setLanguage('Any language');
    setLicense('Any licence');
    setYear('Any year');
    setSort('Newest');
    setPage(1);
  }

  return (
    <>
      <section id="categories" aria-label="Filter books by category" className="mb-8 scroll-mt-24">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Browse subjects</h2>
          <button type="button" onClick={resetFilters} className="text-sm font-medium text-brand-600 hover:text-brand-700">Clear filters</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All subjects', ...categories.map((item) => item.name)].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => { setCategory(item); setPage(1); }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${category === item ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-600'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Book search results">
        <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_150px_180px_130px_145px]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Search books</span>
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Title, author, ISBN or subject"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Language</span>
            <select value={language} onChange={(event) => { setLanguage(event.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              <option>Any language</option>
              {Array.from(new Set(books.map((book) => book.language))).sort().map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Licence</span>
            <select value={license} onChange={(event) => { setLicense(event.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              <option>Any licence</option>
              {Array.from(new Set(books.map((book) => book.licenseType))).sort().map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Year</span>
            <select value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              <option>Any year</option>
              {Array.from(new Set(books.map((book) => String(book.publicationYear)))).sort((a, b) => Number(b) - Number(a)).map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Sort by</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-500">
              <option>Newest</option>
              <option>Title A–Z</option>
              <option disabled>Popularity (requires live metrics)</option>
            </select>
          </label>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500" aria-live="polite">{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} in this preview catalogue</p>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1" aria-label="Catalog layout">
            <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`rounded-lg p-2 ${view === 'list' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
        {filteredBooks.length ? (
          <div className={view === 'grid' ? 'card-grid' : 'space-y-4'}>
            {visibleBooks.map((book) => <BookCard key={book.id} book={book} list={view === 'list'} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-bold text-slate-900">No books found</h2>
            <p className="mt-2 text-sm text-slate-500">Try another search or clear the selected filters.</p>
            <button type="button" onClick={resetFilters} className="mt-5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Clear filters</button>
          </div>
        )}
        {pageCount > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="text-sm text-slate-500">Page {page} of {pageCount}</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        ) : null}
      </section>
    </>
  );
}
