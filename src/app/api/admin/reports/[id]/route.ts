import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaff, logModeration } from "@/lib/staff";
import { adminReportActionSchema, firstError } from "@/lib/validation/schemas";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = adminReportActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  const { status, note, restrictBook } = parsed.data;
  const final = status === "resolved" || status === "dismissed";

  const admin = createAdminClient();
  const { data: report } = await admin.from("reports").select("id, book_id").eq("id", id).maybeSingle();
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  if (restrictBook && report.book_id) {
    const { data: b } = await admin.from("books").select("status").eq("id", report.book_id).maybeSingle();
    if (b?.status === "approved") {
      await admin.from("books").update({ status: "restricted", rejection_reason: note || "Restricted pending report review", reviewed_by: staff.id, reviewed_at: new Date().toISOString() }).eq("id", report.book_id);
      await logModeration({ actorId: staff.id, action: "book_restrict", bookId: report.book_id, reportId: id, note });
    }
  }
  const { error } = await admin.from("reports").update({
    status, resolution_note: note || null, handled_by: staff.id, resolved_at: final ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update the report" }, { status: 500 });
  await logModeration({ actorId: staff.id, action: `report_${status}`, bookId: report.book_id, reportId: id, note });
  return NextResponse.json({ ok: true });
}
