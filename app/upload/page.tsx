'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { CheckCircle2, FileText, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { categories } from '@/lib/data';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;

export default function UploadPage() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function handlePdfChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError('');
    setSubmitted(false);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setPdf(null);
      setError('PDF must be 20 MB or smaller.');
      event.target.value = '';
      return;
    }

    const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    if (new TextDecoder().decode(signature) !== '%PDF-') {
      setPdf(null);
      setError('This file does not have a valid PDF signature. Please choose a PDF document.');
      event.target.value = '';
      return;
    }

    setPdf(file);
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError('');
    setSubmitted(false);
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCover(null);
      setError('Cover image must be JPG, PNG, or WebP.');
      event.target.value = '';
      return;
    }
    if (file && file.size > MAX_COVER_SIZE) {
      setCover(null);
      setError('Cover image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }
    setCover(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!event.currentTarget.reportValidity()) return;
    if (!pdf) {
      setError('Choose a valid PDF before submitting.');
      return;
    }
    if (!cover) {
      setError('Choose a cover image before submitting.');
      return;
    }
    if (!rightsConfirmed) {
      setError('Confirm that you have the right to distribute this book.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-9">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Share knowledge responsibly</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Submit a book</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Only upload public-domain, Creative Commons-compatible, author-owned, or explicitly authorized material. Every submission requires moderation before publication.
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700"><ShieldCheck className="h-6 w-6" /></div>
        <div>
          <h2 className="font-semibold text-emerald-950">Rights-first publishing</h2>
          <p className="mt-1 text-sm leading-6 text-emerald-800">A connected service should keep submissions private and pending until their rights are verified by the moderation team.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 rounded-[32px] border border-slate-200 bg-white p-5 shadow-soft sm:p-8 lg:grid-cols-2" noValidate>
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Book information</h2>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Book title <span className="text-rose-600">*</span></span>
            <input required name="title" maxLength={200} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Enter the book title" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Author name <span className="text-rose-600">*</span></span>
            <input required name="author" maxLength={160} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Author or contributor" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description <span className="text-rose-600">*</span></span>
            <textarea required name="description" maxLength={3000} rows={5} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="What is this book about?" />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Category <span className="text-rose-600">*</span></span>
              <select name="category" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-500">
                {categories.map((category) => <option key={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Language <span className="text-rose-600">*</span></span>
              <select name="language" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-500">
                {['English', 'Urdu', 'Arabic', 'French', 'Spanish', 'Other'].map((language) => <option key={language}>{language}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Publication year</span>
              <input name="publicationYear" type="number" min="1000" max={new Date().getFullYear()} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="e.g. 2024" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">ISBN</span>
              <input name="isbn" maxLength={17} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="Optional" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Publisher</span>
            <input name="publisher" maxLength={160} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="Optional" />
          </label>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Files and rights</h2>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Cover image <span className="text-rose-600">*</span></span>
            <input required type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
            <span className="mt-1 block text-xs text-slate-500">JPG, PNG, or WebP. Maximum 5 MB.</span>
          </label>
          {cover ? <p className="text-sm text-slate-600">Cover selected: {cover.name}</p> : null}

          <div>
            <label htmlFor="book-pdf" className="mb-2 block text-sm font-medium text-slate-700">Book PDF <span className="text-rose-600">*</span></label>
            <label htmlFor="book-pdf" className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/50">
              {pdf ? <FileText className="h-8 w-8 text-brand-600" /> : <UploadCloud className="h-8 w-8 text-brand-500" />}
              <span className="mt-3 text-sm font-semibold text-slate-800">{pdf ? pdf.name : 'Choose a PDF to upload'}</span>
              <span className="mt-1 text-xs text-slate-500">Maximum file size: 20 MB</span>
            </label>
            <input ref={pdfInputRef} id="book-pdf" type="file" accept="application/pdf,.pdf" onChange={handlePdfChange} className="sr-only" />
            {pdf ? (
              <button type="button" onClick={() => { setPdf(null); if (pdfInputRef.current) pdfInputRef.current.value = ''; }} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600">
                <X className="h-3.5 w-3.5" /> Remove PDF
              </button>
            ) : null}
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Copyright / licence type <span className="text-rose-600">*</span></span>
            <select name="licenseType" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-brand-500">
              <option>Public Domain</option>
              <option>Creative Commons</option>
              <option>Author-owned</option>
              <option>Explicit permission from copyright holder</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Licence evidence or permission details <span className="text-rose-600">*</span></span>
            <textarea name="licenseEvidence" required maxLength={2000} rows={3} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500" placeholder="Add a licence URL, permission statement, or evidence details." />
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
            <span className="text-sm leading-6 text-slate-600">I confirm that I have the legal right to distribute this material and that the information above is accurate.</span>
          </label>
        </section>

        {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 lg:col-span-2">{error}</p> : null}
        {submitted ? (
          <div role="status" className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 lg:col-span-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p><strong>Form validated.</strong> This frontend preview does not store submissions yet. Connect the backend before accepting uploads.</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <p className="text-sm text-slate-500">Submission delivery will be available when a backend is connected.</p>
          <button type="submit" disabled={!rightsConfirmed} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300">
            Validate submission
          </button>
        </div>
      </form>
    </div>
  );
}
