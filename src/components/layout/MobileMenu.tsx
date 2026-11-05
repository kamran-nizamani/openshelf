"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function MobileMenu({ links, signedIn, staff }: { links: { href: string; label: string }[]; signedIn: boolean; staff: boolean }) {
  const [open, setOpen] = useState(false);
  const item = "block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface";
  return (
    <div className="lg:hidden">
      <button aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-surface">
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-line bg-white p-3 shadow-card">
          {links.map((l) => <Link key={l.href} href={l.href} className={item} onClick={() => setOpen(false)}>{l.label}</Link>)}
          <div className="my-2 border-t border-line" />
          {signedIn ? (
            <>
              <Link href="/dashboard" className={item} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/settings" className={item} onClick={() => setOpen(false)}>Account settings</Link>
              {staff && <Link href="/admin" className={item} onClick={() => setOpen(false)}>Admin panel</Link>}
              <SignOutButton className={item + " flex items-center gap-2 w-full text-left"} />
            </>
          ) : (
            <>
              <Link href="/login" className={item} onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className={item + " text-primary"} onClick={() => setOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
