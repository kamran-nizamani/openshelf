import Link from "next/link";
import { ArrowRight, BookOpenCheck, Compass, Share2, Upload } from "lucide-react";
import { getCategories, getCategoryCounts, getHomeSections } from "@/lib/books";
import { isSupabaseConfigured } from "@/lib/env";
import { BookGrid } from "@/components/books/BookGrid";
import { SearchBar } from "@/components/books/SearchBar";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, SetupNotice } from "@/components/ui/States";
import { HeroArt } from "@/components/layout/HeroArt";

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {href && <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {children}
    </section>
  );
}

export default async function HomePage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const [categories, counts, { recent, popular, featured }] = await Promise.all([getCategories(), getCategoryCounts(), getHomeSections()]);

  return (
    <>
      <section className="bg-gradient-to-b from-white to-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Every Book Opens a New World.</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">Discover, read, and share knowledge with a global community of readers.</p>
            <div className="mt-8 max-w-xl"><SearchBar large /></div>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton href="/explore"><Compass className="h-4 w-4" /> Explore Books</LinkButton>
              <LinkButton href="/upload" variant="secondary"><Upload className="h-4 w-4" /> Upload Your Book</LinkButton>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <Section title="Popular categories" href="/categories">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/explore?category=${c.slug}`} className="rounded-2xl bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-0.5 text-xs text-muted">{counts[c.slug] ?? 0} {(counts[c.slug] ?? 0) === 1 ? "book" : "books"}</p>
            </Link>
          ))}
        </div>
      </Section>

      {featured.length > 0 && <Section title="Featured books"><BookGrid books={featured} /></Section>}

      <Section title="Recently uploaded" href="/explore?sort=newest">
        {recent.length ? <BookGrid books={recent} /> : (
          <EmptyState title="No books published yet" message="Be the first to share a legally distributable book with the community."
            action={<LinkButton href="/upload">Upload a book</LinkButton>} />
        )}
      </Section>

      {popular.length > 0 && <Section title="Most popular" href="/explore?sort=popular"><BookGrid books={popular} /></Section>}

      <Section title="How it works">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Compass, "1. Discover books", "Search by title, author, ISBN or subject and filter by language, year and licence."],
            [BookOpenCheck, "2. Read or download", "Read in your browser or download the PDF when the licence allows it — always free."],
            [Share2, "3. Share with the community", "Upload books you have the right to distribute. Every upload is reviewed before it goes live."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Compass;
            return (
              <div key={title as string} className="rounded-2xl bg-white p-6 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><I className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                <p className="mt-1 text-sm text-muted">{text as string}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
