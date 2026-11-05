import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createAdminClient();
  // Remove the user's private PDFs and covers from storage before the DB cascade removes the rows.
  const { data: books } = await admin.from("books").select("file_path, cover_url").eq("uploader_id", user.id);
  const files = (books ?? []).map((b) => b.file_path).filter(Boolean);
  if (files.length) await admin.storage.from("books").remove(files);
  const covers = (books ?? []).map((b) => b.cover_url?.split("/covers/")[1]).filter(Boolean) as string[];
  if (covers.length) await admin.storage.from("covers").remove(covers);

  await admin.from("moderation_logs").insert({ actor_id: null, action: "account_deleted", target_user_id: user.id, note: "Self-service deletion" });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "Could not delete account" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
