import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Book } from '@/lib/types';

export function BookCard({ book, list = false }: { book: Book; list?: boolean }) {
  return (
    <article className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-soft ${list ? 'flex items-center' : 'hover:-translate-y-1'}`}>
      <div className={`relative overflow-hidden ${list ? 'h-40 w-32 shrink-0 sm:h-44 sm:w-40' : 'h-64'}`}>
        <Image
          src={book.coverUrl}
          alt={book.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-600 shadow">
          {book.licenseType}
        </span>
      </div>

      <div className={`space-y-4 p-5 ${list ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{book.category}</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{book.title}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Free</span>
        </div>

        <p className="text-sm text-slate-500">by {book.author}</p>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{book.description}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/books/${book.slug}`} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
            View book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
