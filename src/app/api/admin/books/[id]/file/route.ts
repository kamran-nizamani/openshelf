import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaff } from "@/lib/staff";

/** Staff-only signed URL for reviewing any submission's PDF (any status). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getStaff())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const admin = createAdminClient();
  const { data: book } = await admin.from("books").select("file_path").eq("id", id).maybeSingle();
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await admin.storage.from("books").createSignedUrl(book.file_path, 300);
  if (error || !data) return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl }, { headers: { "Cache-Control": "no-store" } });
}
