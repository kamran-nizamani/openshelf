'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpenText, Download, Heart, Share2 } from 'lucide-react';

export function BookActions({ title }: { title: string }) {
  const [message, setMessage] = useState('');

  async function shareBook() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setMessage('Book link shared.');
      } else {
        await navigator.clipboard.writeText(url);
        setMessage('Book link copied to clipboard.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessage('Could not share the book link. You can copy the page URL from your browser.');
    }
  }

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#reader" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-600">
          <BookOpenText className="h-4 w-4" />
          Read Online
        </a>
        <button type="button" onClick={() => setMessage('PDF downloads will be available when secure storage is connected.')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-500">
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-500">
          <Heart className="h-4 w-4" />
          Save to library
        </Link>
        <button type="button" onClick={shareBook} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-500">
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
      {message ? <p role="status" className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
