import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Report a Book" };

export default function ReportInfoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">Report a book</h1>
      <p className="mt-3 text-muted">To report a book, open its page and choose <strong>Report</strong>. You need to be logged in so we can follow up on copyright complaints.</p>
      <p className="mt-3 text-muted">Rights holders can submit takedown requests the same way, including claimant name and contact details. See our <Link className="font-semibold text-primary" href="/copyright">Copyright Policy</Link>.</p>
      <Link href="/explore" className="mt-6 inline-block font-semibold text-primary">Find the book →</Link>
    </div>
  );
}
