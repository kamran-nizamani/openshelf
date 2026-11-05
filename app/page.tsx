import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenText, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeading } from '@/components/SectionHeading';
import { categories, getFeaturedBooks, getMoreBooks, getRecentBooks } from '@/lib/data';

const steps = [
  { icon: Search, title: 'Discover books', description: 'Search by title, author, subject, language, or category.' },
  { icon: BookOpenText, title: 'Read or download', description: 'The reader and download experience is ready to connect with permitted, securely stored book files.' },
  { icon: UploadCloud, title: 'Share legally', description: 'Publish public-domain, CC, or authorized materials with confidence.' },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(49,92,245,0.16),_transparent_52%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <span className="inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Global digital library
            </span>
            <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight text-slate-900">
              Every Book Opens a New World.
            </h1>
            <p className="mt-5 max-w-xl text-xl text-slate-600">
              Discover, read, and share knowledge with a global community of readers.
            </p>

            <div className="mt-8 max-w-2xl">
              <SearchBar />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600">
                Explore Books
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-500">
                Upload Your Book
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-28 w-28 rounded-full bg-brand-100 blur-3xl" />
            <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-brand-200 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                {getFeaturedBooks().map((book) => (
                  <div key={book.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="relative h-48">
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{book.category}</p>
                      <h3 className="mt-2 line-clamp-3 text-lg font-bold text-slate-900">{book.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular categories"
          title="Explore by subject"
          description="Curated categories designed to suit researchers, students, librarians, teachers, and curious readers."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link href={`/explore?category=${encodeURIComponent(category.name)}#categories`} key={category.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-soft">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <BookOpenText className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{category.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Sample titles"
            title="Explore the collection"
            description="Illustrative books for the frontend preview. Live titles will appear after the library database is connected."
            action={<Link href="/explore" className="text-sm font-semibold text-brand-600">Browse all books</Link>}
          />
          <div className="card-grid">
            {getFeaturedBooks().map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Example collection"
              title="A few books to get started"
              description="An illustrative collection showing how titles and subjects will appear in the library."
            />
            <div className="space-y-4">
              {getRecentBooks().map((book) => (
                <div key={book.id} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="relative h-24 w-20 overflow-hidden rounded-2xl">
                    <Image src={book.coverUrl} alt={book.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{book.category}</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">{book.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">by {book.author}</p>
                    <p className="mt-2 text-xs text-slate-500">{book.licenseType} · {book.language}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="More to discover"
              title="Explore more subjects"
              description="Browse a wider range of subjects and find resources that match your interests."
            />
            <div className="space-y-4">
              {getMoreBooks().map((book) => (
                <div key={book.id} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={book.coverUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{book.title}</h3>
                    <p className="text-sm text-slate-500">{book.category} · {book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="OpenShelf in three simple steps"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-brand-900 px-8 py-12 text-white shadow-soft md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-100">Support knowledge</p>
              <h2 className="mt-3 text-3xl font-bold">Help build a safer, freer library for everyone.</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-slate-100">
                <UploadCloud className="h-4 w-4" />
                Upload a book
              </Link>
              <Link href="/report-book" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50">
                <ShieldCheck className="h-4 w-4" />
                Report content
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
