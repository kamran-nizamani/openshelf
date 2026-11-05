import type { ReactNode } from "react";

export function Prose({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {updated && <p className="mt-1 text-sm text-muted">Last updated {updated}</p>}
      <div className="mt-8 space-y-4 leading-relaxed text-navy/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_a]:text-primary [&_a]:underline">{children}</div>
    </div>
  );
}
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
