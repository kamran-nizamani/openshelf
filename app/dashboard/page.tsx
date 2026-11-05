import Link from 'next/link';
import { Bookmark, BookOpen, Clock3, FilePlus2, Settings2 } from 'lucide-react';

const dashboardSections = [
  { icon: FilePlus2, title: 'My uploads', description: 'Track books you submit and follow moderation decisions.', href: '/upload', action: 'Submit a book' },
  { icon: Bookmark, title: 'My library', description: 'Keep saved books and reading lists together in one place.', href: '/explore', action: 'Explore books' },
  { icon: Clock3, title: 'Reading history', description: 'Pick up where you left off and keep track of your progress.', href: '/explore', action: 'Find a book' },
  { icon: Settings2, title: 'Account settings', description: 'Manage your profile, privacy, and account preferences.', href: '/login', action: 'Sign in' },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Your OpenShelf</p>
          <h1 className="mt-3 text-4xl font-black text-slate-900">Your reading space.</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">Sign in to organize saved books, see your uploads, and continue reading.</p>
        </div>
        <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-600">
          <BookOpen className="h-4 w-4" /> Sign in to your account
        </Link>
      </div>

      <div className="mb-8 rounded-3xl border border-brand-100 bg-brand-50 p-6">
        <p className="text-sm font-semibold text-brand-900">Personal dashboard preview</p>
        <p className="mt-2 text-sm leading-6 text-brand-800">No profile or account data is shown here. Sign-in and personal records will be available after authentication is connected.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {dashboardSections.map(({ icon: Icon, title, description, href, action }) => (
          <section key={title} className="flex min-h-56 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</p>
            <Link href={href} className="mt-5 text-sm font-semibold text-brand-600 hover:text-brand-700">{action} →</Link>
          </section>
        ))}
      </div>
    </div>
  );
}
