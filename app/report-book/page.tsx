'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReportBookPage() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Trust and safety</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Report a book</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">Use this form to report suspected copyright infringement, incorrect metadata, harmful content, or another policy concern.</p>
      <div className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        This preview does not submit reports. A secure reporting endpoint must be connected before launch.
      </div>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Book page URL</span><input type="url" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="https://..." /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Reason for report</span><select required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500"><option value="">Select a reason</option><option>Copyright or licence concern</option><option>Incorrect book information</option><option>Inappropriate content</option><option>Other policy concern</option></select></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Details</span><textarea required rows={5} maxLength={4000} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="Describe the issue and provide any relevant information." /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Your email</span><input type="email" required autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="you@example.com" /></label>
        {submitted ? <p role="status" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><CheckCircle2 className="h-4 w-4" /> Form validated in preview; the report has not been sent.</p> : null}
        <button className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Review report form</button>
      </form>
    </div>
  );
}
