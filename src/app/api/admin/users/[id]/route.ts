import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaff, logModeration } from "@/lib/staff";
import { getRoles } from "@/lib/auth";
import { adminUserActionSchema, firstError } from "@/lib/validation/schemas";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = adminUserActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  if (id === staff.id) return NextResponse.json({ error: "You cannot change your own account status." }, { status: 400 });
  const targetRoles = await getRoles(id);
  if (targetRoles.includes("admin") || (targetRoles.includes("moderator") && !staff.roles.includes("admin")))
    return NextResponse.json({ error: "You cannot moderate this account." }, { status: 403 });

  const suspend = parsed.data.action === "suspend";
  const { error } = await createAdminClient().from("profiles").update({
    suspended: suspend, suspended_reason: suspend ? parsed.data.reason || "Policy violation" : null,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update the account" }, { status: 500 });
  await logModeration({ actorId: staff.id, action: suspend ? "user_suspended" : "user_restored", targetUserId: id, note: parsed.data.reason });
  return NextResponse.json({ ok: true });
}
