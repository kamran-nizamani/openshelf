import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-10 w-10 text-red-600" />
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-1 max-w-md text-sm text-red-700">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mx-auto my-16 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm">
      <h2 className="mb-2 text-lg font-semibold">Supabase is not configured</h2>
      <p>Copy <code>.env.example</code> to <code>.env.local</code>, add your Supabase URL and keys, and run the SQL migrations in <code>supabase/migrations</code>. See the README.</p>
    </div>
  );
}

export const BookCardSkeleton = () => (
  <div className="rounded-2xl bg-white p-3 shadow-card">
    <div className="skeleton aspect-[3/4] w-full" />
    <div className="skeleton mt-3 h-4 w-3/4" />
    <div className="skeleton mt-2 h-3 w-1/2" />
  </div>
);
