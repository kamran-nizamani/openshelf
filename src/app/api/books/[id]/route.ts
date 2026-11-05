import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookEditSchema, firstError } from "@/lib/validation/schemas";
import { logModeration } from "@/lib/staff";

type Ctx = { params: Promise<{ id: string }> };
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Owner edits metadata. Runs as the user, so RLS + the books_guard trigger enforce ownership.
 *  Editing a published book sends it back to "pending" (done by the DB trigger). */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return bad("Not found", 404);
  const user = await getCurrentUser();
  if (!user) return bad("Please log in.", 401);
  const parsed = bookEditSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(firstError(parsed.error));
  const m = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.from("books").update({
    title: m.title, author: m.author, description: m.description, category_id: m.categoryId, language: m.language,
    publication_year: m.publicationYear ?? null, isbn: m.isbn ?? null, publisher: m.publisher ?? null,
    allow_download: m.allowDownload, license_type: m.licenseType, license_evidence: m.licenseEvidence,
  }).eq("id", id).eq("uploader_id", user.id).select("id, status").maybeSingle();
  if (error) return bad("Could not save changes.", 500);
  if (!data) return bad("Book not found.", 404);
  return NextResponse.json({ ok: true, status: data.status });
}

/** Owner deletes own submission (files + row). Restricted books are kept for the moderation record. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return bad("Not found", 404);
  const user = await getCurrentUser();
  if (!user) return bad("Please log in.", 401);

  const admin = createAdminClient();
  const { data: book } = await admin.from("books").select("id, uploader_id, status, file_path, cover_url").eq("id", id).maybeSingle();
  if (!book || book.uploader_id !== user.id) return bad("Book not found.", 404);
  if (book.status === "restricted" || book.status === "removed") return bad("This book is under moderation review and cannot be deleted right now.", 403);

  await admin.storage.from("books").remove([book.file_path]);
  const cover = book.cover_url?.split("/covers/")[1];
  if (cover) await admin.storage.from("covers").remove([cover]);
  const { error } = await admin.from("books").delete().eq("id", id);
  if (error) return bad("Could not delete the book.", 500);
  await logModeration({ actorId: null, action: "book_deleted_by_owner", bookId: id, targetUserId: user.id });
  return NextResponse.json({ ok: true });
}
