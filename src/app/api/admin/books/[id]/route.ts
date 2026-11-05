import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { addStrike, getStaff, logModeration } from "@/lib/staff";
import { adminBookActionSchema, firstError } from "@/lib/validation/schemas";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaff();
  if (!staff) return bad("Forbidden", 403);
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return bad("Not found", 404);
  const parsed = adminBookActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return bad(firstError(parsed.error));
  const a = parsed.data;

  const admin = createAdminClient();
  const { data: book } = await admin.from("books").select("id, status, scan, uploader_id").eq("id", id).maybeSingle();
  if (!book) return bad("Book not found", 404);

  const now = new Date().toISOString();
  const review = { reviewed_by: staff.id, reviewed_at: now };

  if (a.action === "edit") {
    const m = a.meta;
    const { error } = await admin.from("books").update({
      title: m.title, author: m.author, description: m.description, category_id: m.categoryId, language: m.language,
      publication_year: m.publicationYear ?? null, isbn: m.isbn ?? null, publisher: m.publisher ?? null,
      allow_download: m.allowDownload, license_type: m.licenseType, license_evidence: m.licenseEvidence,
    }).eq("id", id);
    if (error) return bad("Could not save changes", 500);
    await logModeration({ actorId: staff.id, action: "book_metadata_edited", bookId: id, targetUserId: book.uploader_id });
    return NextResponse.json({ ok: true });
  }

  let update: Record<string, unknown>;
  switch (a.action) {
    case "approve":
    case "restore":
      if (book.scan === "infected") return bad("Infected files cannot be published.", 422);
      if (a.action === "approve" && book.status !== "pending") return bad("Only pending books can be approved.");
      if (a.action === "restore" && !["restricted", "removed", "rejected"].includes(book.status)) return bad("Nothing to restore.");
      update = { status: "approved", rejection_reason: null, ...review };
      break;
    case "reject":
      if (book.status !== "pending") return bad("Only pending books can be rejected.");
      update = { status: "rejected", rejection_reason: a.reason, ...review };
      break;
    case "remove":
      update = { status: "removed", rejection_reason: a.reason, ...review };
      break;
    case "restrict":
      if (book.status !== "approved") return bad("Only published books can be restricted.");
      update = { status: "restricted", rejection_reason: a.reason, ...review };
      break;
  }
  const { error } = await admin.from("books").update(update).eq("id", id);
  if (error) return bad("Could not update the book", 500);

  await logModeration({
    actorId: staff.id, action: `book_${a.action}`, bookId: id, targetUserId: book.uploader_id,
    note: "reason" in a ? a.reason : null,
  });
  if ("copyright" in a && a.copyright && (a.action === "remove" || a.action === "reject")) await addStrike(book.uploader_id, staff.id);
  return NextResponse.json({ ok: true });
}
