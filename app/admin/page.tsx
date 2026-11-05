import Link from 'next/link';
import { AlertTriangle, BookCheck, Flag, Users } from 'lucide-react';

const adminSections = [
  { icon: BookCheck, title: 'Book submissions', description: 'Review metadata, licences, and distribution evidence before publication.' },
  { icon: Flag, title: 'Copyright reports', description: 'Investigate reported content and document moderation decisions.' },
  { icon: Users, title: 'User management', description: 'Review accounts and respond to repeat policy violations.' },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Administration</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Moderation workspace</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">A dedicated place for authorized moderators to review submissions, handle reports, and protect the community.</p>
      </div>

      <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Admin access is not enabled in this frontend preview.</p>
          <p className="mt-1 text-sm leading-6">No user or moderation data is loaded. Production access must be protected by server-side role checks.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {adminSections.map(({ icon: Icon, title, description }) => (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Preview state</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Moderation queue and platform statistics will be populated from the secure admin API.</p>
        <Link href="/copyright-policy" className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">Review copyright policy →</Link>
      </div>
    </div>
  );
}
