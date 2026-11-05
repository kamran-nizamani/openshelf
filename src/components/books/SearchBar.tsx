"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

type Suggestion = { id: string; title: string; author: string };

export function SearchBar({ initial = "", large = false, basePath = "/explore" }: { initial?: string; large?: boolean; basePath?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setItems([]); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctl.signal });
        if (res.ok) setItems((await res.json()).suggestions ?? []);
      } catch { /* aborted */ }
    }, 200);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(q.trim() ? `${basePath}?q=${encodeURIComponent(q.trim())}` : basePath);
  }

  return (
    <div ref={box} className="relative w-full">
      <form onSubmit={submit} role="search" className={`flex items-center gap-2 rounded-2xl border border-line bg-white shadow-card focus-within:border-primary ${large ? "p-2.5 pl-4" : "p-1.5 pl-3"}`}>
        <Search className="h-5 w-5 shrink-0 text-muted" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search by title, author, ISBN or subject" aria-label="Search books"
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted/70 ${large ? "py-2 text-base" : "py-1.5 text-sm"}`} />
        {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(""); setItems([]); }} className="rounded-full p-1.5 hover:bg-surface"><X className="h-4 w-4" /></button>}
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Search</button>
      </form>
      {open && items.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-card">
          {items.map((s) => (
            <li key={s.id}>
              <button type="button" className="block w-full px-4 py-2.5 text-left hover:bg-surface"
                onClick={() => { setOpen(false); router.push(`/books/${s.id}`); }}>
                <span className="block text-sm font-medium">{s.title}</span>
                <span className="block text-xs text-muted">{s.author}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
