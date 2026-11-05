import { NextResponse } from "next/server";
import { getCurrentUser, isSuspended } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { firstError, reportSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to report a book." }, { status: 401 });
  if (await isSuspended(user.id)) return NextResponse.json({ error: "Your account is suspended." }, { status: 403 });
  if (!rateLimit(`report:${user.id}`, 5, 10 * 60_000)) return NextResponse.json({ error: "Too many reports. Try again later." }, { status: 429 });

  const parsed = reportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const r = parsed.data;

  const admin = createAdminClient();
  const { data: book } = await admin.from("books").select("id, uploader_id").eq("id", r.bookId).maybeSingle();
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const { error } = await admin.from("reports").insert({
    book_id: r.bookId, reported_user_id: book.uploader_id, reporter_id: user.id, reporter_email: user.email,
    kind: r.kind, details: r.details, claimant_name: r.claimantName || null, claimant_contact: r.claimantContact || null,
  });
  if (error) return NextResponse.json({ error: "Could not submit report" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
