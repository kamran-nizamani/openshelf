import Link from "next/link";
import { BookMarked } from "lucide-react";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { UserMenu } from "./UserMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore Books" },
  { href: "/categories", label: "Categories" },
  { href: "/upload", label: "Upload Book" },
  { href: "/library", label: "My Library" },
];

export async function Navbar() {
  let user = null as Awaited<ReturnType<typeof getCurrentUser>>;
  let name = "";
  let staff = false;
  if (isSupabaseConfigured) {
    user = await getCurrentUser();
    if (user) {
      const supabase = await createClient();
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      name = data?.full_name ?? user.email ?? "Account";
      try { staff = await isStaff(user.id); } catch { staff = false; }
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><BookMarked className="h-5 w-5" /></span>
          OpenShelf
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}><Link href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-surface hover:text-primary">{l.label}</Link></li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? <UserMenu name={name} staff={staff} /> : (
            <>
              <LinkButton href="/login" variant="ghost">Login</LinkButton>
              <LinkButton href="/register">Sign Up</LinkButton>
            </>
          )}
        </div>
        <MobileMenu links={links} signedIn={Boolean(user)} staff={staff} />
      </nav>
    </header>
  );
}
