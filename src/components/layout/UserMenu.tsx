"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, Settings, ShieldCheck, UserCircle } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function UserMenu({ name, staff }: { name: string; staff: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  const item = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface w-full text-left";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium hover:border-primary">
        <UserCircle className="h-5 w-5 text-primary" /><span className="max-w-32 truncate">{name}</span><ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-card">
          <Link role="menuitem" className={item} href="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
          <Link role="menuitem" className={item} href="/settings" onClick={() => setOpen(false)}><Settings className="h-4 w-4" /> Account settings</Link>
          {staff && <Link role="menuitem" className={item} href="/admin" onClick={() => setOpen(false)}><ShieldCheck className="h-4 w-4" /> Admin panel</Link>}
          <SignOutButton className={item} />
        </div>
      )}
    </div>
  );
}
