import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="mb-4 text-2xl font-bold text-white">OpenShelf</p>
          <p className="text-sm text-slate-400">
            A global digital library for lawful, creative, and educational access to shareable knowledge.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Company</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/">About OpenShelf</Link></li>
            <li><Link href="/explore">Explore Books</Link></li>
            <li><Link href="/upload">Upload Book</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/help-center">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Legal</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms and Conditions</Link></li>
            <li><Link href="/copyright-policy">Copyright Policy</Link></li>
            <li><Link href="/report-book">Report a Book</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Our promise</h3>
          <p className="text-sm leading-6 text-slate-400">OpenShelf is for knowledge that can be shared legally. Every book deserves clear rights.</p>
        </div>
      </div>
    </footer>
  );
}
