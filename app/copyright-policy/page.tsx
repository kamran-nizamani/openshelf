import { AlertTriangle, BookOpenCheck, Scale } from 'lucide-react';

export default function CopyrightPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Legal and community standards</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Copyright policy</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">OpenShelf is intended for books that may lawfully be shared. Copyright compliance is a condition of using the platform.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpenCheck, title: 'Permitted works', text: 'Public-domain, compatible Creative Commons, author-owned, or explicitly authorized works.' },
          { icon: AlertTriangle, title: 'Not permitted', text: 'Books uploaded without the copyright owner’s permission or a valid redistribution licence.' },
          { icon: Scale, title: 'Review process', text: 'Submissions require moderation. Reported content may be restricted while a claim is reviewed.' },
        ].map(({ icon: Icon, title, text }) => (
          <section key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
      <div className="prose-copy mt-10 space-y-7">
        <section><h2>Uploader responsibilities</h2><p>Uploaders must identify the applicable licence, provide evidence or permission details, and confirm their legal right to distribute the material. A rights declaration does not replace moderator review or transfer copyright to OpenShelf.</p></section>
        <section><h2>Reporting a concern</h2><p>If you believe content infringes your rights, submit the book link, identify the material, explain your relationship to the rights holder, and provide contact details so the moderation team can investigate.</p><a className="font-semibold text-brand-600 hover:underline" href="/report-book">Report a book</a></section>
        <section><h2>Review and takedown</h2><p>OpenShelf may temporarily restrict access to disputed content while reviewing a complete report. Moderation decisions should be documented, and content found to violate the policy may be removed.</p></section>
        <section><h2>Repeat infringement</h2><p>Accounts associated with repeated or serious violations may be restricted or suspended. Applicable law and the facts of each report guide the review.</p></section>
      </div>
    </article>
  );
}
