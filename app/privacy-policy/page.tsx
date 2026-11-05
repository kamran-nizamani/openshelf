export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Legal</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Privacy policy</h1>
      <div className="mt-8 space-y-7 text-base leading-7 text-slate-600">
        <section><h2 className="text-xl font-bold text-slate-900">Preview notice</h2><p className="mt-2">This frontend preview does not create accounts, accept uploads, store reading activity, or send form data to a service.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">Information and use</h2><p className="mt-2">A production service may process account details, uploads, library activity, and moderation reports to provide its features and protect the community. The exact data, purpose, retention, and legal basis must be documented before launch.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">Security and choices</h2><p className="mt-2">Production privacy controls, account access, deletion, and data security practices depend on backend configuration and must be implemented and reviewed before collecting personal information.</p></section>
        <section><h2 className="text-xl font-bold text-slate-900">Policy status</h2><p className="mt-2">This page is a draft interface, not a final legal policy. It requires review and completion before public deployment.</p></section>
      </div>
    </article>
  );
}
