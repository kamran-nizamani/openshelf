"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Loader2, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

type Props = { bookId: string; title: string; canDownload: boolean; signedIn: boolean; userId: string | null; startPage: number };

export function PdfReader({ bookId, title, canDownload, signedIn, userId, startPage }: Props) {
  const { toast } = useToast();
  const wrap = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(startPage);
  const [scale, setScale] = useState(1);
  const [width, setWidth] = useState(800);
  const [full, setFull] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/books/${bookId}/file?mode=read`).then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (!live) return;
      if (!r.ok) setError(body.error ?? "Could not open this book."); else setUrl(body.url);
    }).catch(() => live && setError("Could not open this book."));
    return () => { live = false; };
  }, [bookId]);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.min(el.clientWidth - 32, 1000)));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  // Persist reading progress (signed-in users only), debounced.
  useEffect(() => {
    if (!userId || !pages) return;
    const t = setTimeout(() => {
      createClient().from("reading_history").upsert({ user_id: userId, book_id: bookId, last_page: page, last_read_at: new Date().toISOString() }, { onConflict: "user_id,book_id" });
    }, 800);
    return () => clearTimeout(t);
  }, [page, pages, userId, bookId]);

  const go = useCallback((n: number) => setPage((p) => Math.min(Math.max(1, n), pages || 1)), [pages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [go, page]);

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs); return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  async function toggleFull() {
    if (document.fullscreenElement) await document.exitFullscreen(); else await wrap.current?.requestFullscreen();
  }

  async function download() {
    if (!signedIn) return toast("error", "Please log in to download.");
    const r = await fetch(`/api/books/${bookId}/file?mode=download`);
    const body = await r.json().catch(() => ({}));
    if (!r.ok) return toast("error", body.error ?? "Download failed");
    window.location.href = body.url;
  }

  const btn = "rounded-lg p-2 hover:bg-white/10 disabled:opacity-40";
  return (
    <div ref={wrap} className="flex h-[calc(100vh-4rem)] flex-col bg-[#e9eef7]">
      <div className="flex items-center gap-2 bg-navy px-3 py-2 text-white">
        <Link href={`/books/${bookId}`} className={btn} aria-label="Back to book"><ArrowLeft className="h-5 w-5" /></Link>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        <button className={btn} aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft className="h-5 w-5" /></button>
        <span className="flex items-center gap-1 text-sm">
          <input aria-label="Page number" value={page} onChange={(e) => go(Number(e.target.value) || 1)} inputMode="numeric"
            className="w-12 rounded bg-white/10 px-1 py-0.5 text-center text-white" /> / {pages || "–"}
        </span>
        <button className={btn} aria-label="Next page" disabled={page >= pages} onClick={() => go(page + 1)}><ChevronRight className="h-5 w-5" /></button>
        <button className={btn} aria-label="Zoom out" disabled={scale <= 0.5} onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}><ZoomOut className="h-5 w-5" /></button>
        <span className="hidden w-10 text-center text-xs sm:block">{Math.round(scale * 100)}%</span>
        <button className={btn} aria-label="Zoom in" disabled={scale >= 3} onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}><ZoomIn className="h-5 w-5" /></button>
        <button className={btn} aria-label={full ? "Exit full screen" : "Full screen"} onClick={toggleFull}>{full ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}</button>
        {canDownload && <button className={btn} aria-label="Download PDF" onClick={download}><Download className="h-5 w-5" /></button>}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error ? <p className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 text-center text-sm text-red-700 shadow-card" role="alert">{error}</p> :
          !url ? <div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
            <Document file={url} onLoadSuccess={(d) => { setPages(d.numPages); setPage((p) => Math.min(p, d.numPages)); }}
              onLoadError={() => setError("This PDF could not be displayed.")}
              loading={<div className="mt-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
              className="flex justify-center">
              <Page pageNumber={page} width={width * scale} className="shadow-card" renderTextLayer renderAnnotationLayer />
            </Document>
          )}
      </div>
    </div>
  );
}
