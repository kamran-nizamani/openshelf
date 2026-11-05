import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser, isSuspended } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Returns a short-lived signed URL for a book's PDF. The storage path never leaves the server.
 *   ?mode=read      -> inline viewing (anyone, published books only)
 *   ?mode=download  -> attachment (signed-in users, only when the book allows downloads)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mode = req.nextUrl.searchParams.get("mode") === "download" ? "download" : "read";
  const user = await getCurrentUser();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (!rateLimit(`file:${user?.id ?? ip}:${mode}`, mode === "download" ? 20 : 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  if (mode === "download" && !user) return NextResponse.json({ error: "Please log in to download." }, { status: 401 });
  if (user && (await isSuspended(user.id))) return NextResponse.json({ error: "Your account is suspended." }, { status: 403 });

  const admin = createAdminClient();
  const { data: book } = await admin.from("books")
    .select("id, title, file_path, status, allow_download, scan").eq("id", id).maybeSingle();

  // Only approved + not-infected books are served. Everything else looks like a 404.
  if (!book || book.status !== "approved" || book.scan === "infected") {
    return NextResponse.json({ error: "Book not available" }, { status: 404 });
  }
  if (mode === "download" && !book.allow_download) {
    return NextResponse.json({ error: "The rights holder has not permitted downloads. You can read this book online." }, { status: 403 });
  }

  const safeName = book.title.replace(/[^\w\s.-]/g, "").trim().slice(0, 80) || "book";
  const { data, error } = await admin.storage.from("books").createSignedUrl(
    book.file_path, mode === "download" ? 60 : 600, mode === "download" ? { download: `${safeName}.pdf` } : undefined,
  );
  if (error || !data) return NextResponse.json({ error: "File is unavailable right now." }, { status: 500 });

  if (mode === "download") await admin.from("downloads").insert({ book_id: id, user_id: user!.id });
  return NextResponse.json({ url: data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
