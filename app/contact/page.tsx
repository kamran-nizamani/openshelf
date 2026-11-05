'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { CheckCircle2, Mail, MessageSquareText } from 'lucide-react';

export default function ContactPage() {
  const [validated, setValidated] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidated(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Get in touch</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Contact OpenShelf</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Have a question about the library, accessibility, or responsible sharing? Write a message below.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Send a message</h2>
              <p className="text-sm text-slate-500">All fields are required.</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Your name</span>
            <input required name="name" autoComplete="name" maxLength={100} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Your name" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
            <input required name="email" type="email" autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="you@example.com" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Topic</span>
            <select required name="topic" defaultValue="" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              <option value="" disabled>Select a topic</option>
              <option>General question</option>
              <option>Accessibility</option>
              <option>Book submission</option>
              <option>Technical issue</option>
              <option>Other</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
            <textarea required name="message" maxLength={4000} rows={6} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="How can we help?" />
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Frontend preview: messages are not sent or stored. Connect a secure contact service before collecting real messages.
          </div>

          {validated ? (
            <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              The form is complete. Your message was not sent or stored.
            </p>
          ) : null}

          <button type="submit" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
            Validate message
          </button>
        </form>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Mail className="h-5 w-5 text-brand-600" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">Copyright or content concern?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the dedicated reporting form so the moderation team has the information needed to review the request.</p>
            <Link href="/report-book" className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-brand-600 transition hover:border-brand-500">
              Report a book
            </Link>
          </div>
          <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
            <h2 className="font-bold text-brand-950">Looking for an answer?</h2>
            <p className="mt-2 text-sm leading-6 text-brand-800">Browse common questions about submissions, rights, and reporting.</p>
            <Link href="/help-center" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Visit the help center →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
