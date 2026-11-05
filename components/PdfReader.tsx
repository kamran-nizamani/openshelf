'use client';

import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

export function PdfReader({ title }: { title: string }) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reader</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Zoom out" disabled={zoom === 80} onClick={() => setZoom((current) => Math.max(80, current - 10))} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-xs font-medium text-slate-600" aria-live="polite">{zoom}%</span>
          <button type="button" aria-label="Zoom in" disabled={zoom === 150} onClick={() => setZoom((current) => Math.min(150, current + 10))} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Reset to first page" onClick={() => setPage(1)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:border-brand-500 hover:text-brand-500">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ zoom: `${zoom}%` }}>
          <div className="min-h-[720px] bg-[linear-gradient(135deg,#f8fafc,#e2e8f0)] p-10 text-slate-700">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-500">PDF preview</p>
              <h4 className="mt-6 text-3xl font-bold text-slate-900">Page {page}</h4>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                The reader layout is ready for the online reading experience. Connect the private PDF storage to display the actual book pages here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
        <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40">
          Previous
        </button>
        <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700" aria-live="polite">
          Page {page} of 24 (preview)
        </span>
        <button type="button" disabled={page === 24} onClick={() => setPage((current) => Math.min(24, current + 1))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  );
}
