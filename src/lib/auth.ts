import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export type Role = "user" | "moderator" | "admin";

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Roles are always read from the database on the server, never from the client. */
export async function getRoles(userId: string): Promise<Role[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role as Role);
}

export async function isStaff(userId: string) {
  const roles = await getRoles(userId);
  return roles.includes("admin") || roles.includes("moderator");
}

export async function requireStaff() {
  const user = await requireUser();
  if (!(await isStaff(user.id))) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!(await getRoles(user.id)).includes("admin")) redirect("/");
  return user;
}

export async function isSuspended(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("suspended").eq("id", userId).single();
  return Boolean(data?.suspended);
}
