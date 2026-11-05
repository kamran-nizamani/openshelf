import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BookActions } from '@/components/BookActions';
import { PdfReader } from '@/components/PdfReader';
import { notFound } from 'next/navigation';
import { books, getBookBySlug } from '@/lib/data';

export default function BookDetailsPage({ params }: { params: { slug: string } }) {
  if (!books.some((item) => item.slug === params.slug)) notFound();
  const book = getBookBySlug(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap gap-3 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-brand-500">Explore</Link>
        <span>/</span>
        <span className="text-slate-700">{book.title}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.6fr_1.4fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft">
          <div className="relative h-[420px] overflow-hidden rounded-[24px]">
            <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{book.category}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{book.licenseType}</span>
          </div>

          <h1 className="mt-6 text-4xl font-black text-slate-900">{book.title}</h1>
          <p className="mt-2 text-xl text-slate-600">by {book.author}</p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{book.description}</p>
          <BookActions title={book.title} />

          <div className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm text-slate-500">Publisher</p>
              <p className="mt-2 font-semibold text-slate-900">{book.publisher}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Publication date</p>
              <p className="mt-2 font-semibold text-slate-900">{book.publicationYear}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Language</p>
              <p className="mt-2 font-semibold text-slate-900">{book.language}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">ISBN</p>
              <p className="mt-2 font-semibold text-slate-900">{book.isbn ?? 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div id="reader">
          <PdfReader title={book.title} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Book details</h3>
            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex justify-between gap-3"><span>File format</span><span className="font-medium text-slate-900">{book.fileFormat}</span></li>
              <li className="flex justify-between gap-3"><span>Licence</span><span className="font-medium text-slate-900">{book.licenseType}</span></li>
              <li className="flex justify-between gap-3"><span>Rights status</span><span className="font-medium text-slate-900">Sample information</span></li>
              <li className="flex justify-between gap-3"><span>Uploader</span><span className="font-medium text-slate-900">Preview entry</span></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Reader reviews</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">There are no reader reviews in this sample catalogue yet. Sign in to share your thoughts when community accounts are available.</p>
            <Link href="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
              Sign in to review
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-14 rounded-[32px] bg-slate-950 px-8 py-10 text-slate-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Content rights</p>
            <h3 className="mt-2 text-2xl font-bold">Legally shareable knowledge starts with clear permission.</h3>
          </div>
          <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
            Upload your own book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
