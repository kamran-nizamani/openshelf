import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/books";
import { env } from "@/lib/env";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Upload a Book", robots: { index: false } };

export default async function UploadPage() {
  await requireUser();
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Upload a book</h1>
      <p className="mt-1 text-muted">Share only books you have the legal right to distribute. Every upload is reviewed by our team before it is published.</p>
      <UploadForm categories={categories} maxPdfMb={Math.round(env.maxPdfBytes / 1048576)} maxCoverMb={Math.round(env.maxCoverBytes / 1048576)} />
    </div>
  );
}
