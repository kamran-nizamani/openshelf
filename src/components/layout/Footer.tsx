import Link from "next/link";
import { BookMarked } from "lucide-react";

const cols = [
  { title: "OpenShelf", links: [["About OpenShelf", "/about"], ["Contact", "/contact"], ["Help Center", "/help"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms and Conditions", "/terms"], ["Copyright Policy", "/copyright"]] },
  { title: "Community", links: [["Explore Books", "/explore"], ["Upload a Book", "/upload"], ["Report a Book", "/report"]] },
];

export function Footer() {
  const social = (process.env.NEXT_PUBLIC_SOCIAL_LINKS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <footer className="mt-20 border-t border-line bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold"><BookMarked className="h-6 w-6" /> OpenShelf</div>
          <p className="mt-3 text-sm text-white/70">A global digital library of legally shareable books.</p>
          {social.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {social.map((u) => { let host = u; try { host = new URL(u).hostname.replace("www.", ""); } catch {} 
                return <li key={u}><a className="underline-offset-2 hover:underline" href={u} rel="noopener noreferrer" target="_blank">{host}</a></li>; })}
            </ul>
          )}
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => <li key={href}><Link href={href} className="text-white/85 hover:text-white">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} OpenShelf. Only legally distributable books.</div>
    </footer>
  );
}
