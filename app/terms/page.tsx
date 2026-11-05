export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Legal</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Terms and conditions</h1>
      <div className="mt-8 space-y-7 text-base leading-7 text-slate-600">
        <section><h2 className="text-xl font-bold text-slate-900">Responsible use</h2><p className="mt-2">Use OpenShelf lawfully and respectfully. Do not upload, access, or distribute materials in violation of copyright, privacy, or other applicable rights.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">User submissions</h2><p className="mt-2">Uploaders retain their rights and are responsible for confirming that their content may be shared. Submissions may be reviewed, restricted, or removed under the copyright and content policy.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">Availability</h2><p className="mt-2">Features shown in this frontend preview are not yet connected to production services. Availability, account, storage, and moderation terms must be finalized before public launch.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">Questions</h2><p className="mt-2">For content concerns, use the book reporting form. These draft terms require legal review before launch.</p></section>
      </div>
    </article>
  );
}
