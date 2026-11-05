import Link from 'next/link';

const items = [
  { title: 'Can I upload any book?', text: 'No. Only public-domain, appropriately licensed Creative Commons, author-owned, or explicitly authorized books may be submitted.' },
  { title: 'Why is a book pending?', text: 'New submissions require a moderation review of metadata and distribution rights before they can be published.' },
  { title: 'How do I report a book?', text: 'Open the report form and provide the book URL, your reason, and enough detail for a moderator to investigate.' },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Help center</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">How can we help?</h1>
      <p className="mt-4 text-lg text-slate-600">Answers about sharing books responsibly on OpenShelf.</p>
      <div className="mt-8 space-y-4">
        {items.map((item) => <section key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></section>)}
      </div>
      <p className="mt-8 text-sm text-slate-600">Need to flag content? <Link href="/report-book" className="font-semibold text-brand-600 hover:underline">Report a book</Link>.</p>
    </div>
  );
}
