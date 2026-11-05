import Link from "next/link";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  const items = [["/admin", "Overview"], ["/admin/books", "Books"], ["/admin/reports", "Reports"], ["/admin/users", "Users"]];
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-navy p-2 text-sm text-white">
        <span className="px-3 font-semibold">Admin</span>
        {items.map(([h, l]) => <Link key={h} href={h} className="rounded-xl px-3 py-1.5 hover:bg-white/10">{l}</Link>)}
      </div>
      {children}
    </div>
  );
}
