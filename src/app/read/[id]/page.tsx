import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getBook } from "@/lib/books";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PdfReader } from "./PdfReader";

export const metadata: Metadata = { title: "Reader", robots: { index: false } };

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const book = await getBook(id);
  if (!book) notFound();

  const user = await getCurrentUser();
  let startPage = 1;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("reading_history").select("last_page").eq("book_id", id).eq("user_id", user.id).maybeSingle();
    startPage = data?.last_page ?? 1;
  }
  return <PdfReader bookId={id} title={book.title} canDownload={book.allow_download} signedIn={Boolean(user)} userId={user?.id ?? null} startPage={startPage} />;
}
