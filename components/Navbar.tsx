'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, LogIn, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore Books' },
  { href: '/explore#categories', label: 'Categories' },
  { href: '/upload', label: 'Upload Book' },
  { href: '/dashboard', label: 'My Library' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-brand-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-soft">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-xl font-bold">OpenShelf</p>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand-500">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-500 sm:flex">
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link href="/register" className="hidden items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 sm:inline-flex">
            Sign Up
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-500 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600">
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600">Login</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50">Sign Up</Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
