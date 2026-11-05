import "server-only";
import { getCurrentUser, getRoles, type Role } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Server-side RBAC for API routes. Roles come from the database, never from the client. */
export async function getStaff(): Promise<{ id: string; roles: Role[] } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const roles = await getRoles(user.id);
  if (!roles.includes("admin") && !roles.includes("moderator")) return null;
  return { id: user.id, roles };
}

export async function logModeration(entry: {
  actorId: string | null; action: string; bookId?: string | null; targetUserId?: string | null; reportId?: string | null; note?: string | null;
}) {
  await createAdminClient().from("moderation_logs").insert({
    actor_id: entry.actorId, action: entry.action, book_id: entry.bookId ?? null,
    target_user_id: entry.targetUserId ?? null, report_id: entry.reportId ?? null, note: entry.note ?? null,
  });
}

export const STRIKE_LIMIT = 3;

/** Repeat-infringer policy: each upheld copyright removal adds a strike; the limit suspends the account. */
export async function addStrike(userId: string, actorId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("strikes").eq("id", userId).single();
  const strikes = (data?.strikes ?? 0) + 1;
  const suspend = strikes >= STRIKE_LIMIT;
  await admin.from("profiles").update({
    strikes, ...(suspend ? { suspended: true, suspended_reason: "Repeat copyright infringement" } : {}),
  }).eq("id", userId);
  await logModeration({ actorId, action: suspend ? "strike_limit_suspension" : "strike_added", targetUserId: userId, note: `Strikes: ${strikes}` });
}
