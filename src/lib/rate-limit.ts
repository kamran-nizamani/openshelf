import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** DB-backed daily upload limit: counts the user's books created in the last 24h. */
export async function uploadsInLast24h(userId: string) {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await admin
    .from("books").select("id", { count: "exact", head: true })
    .eq("uploader_id", userId).gte("created_at", since);
  return count ?? 0;
}

/** Small in-memory limiter for lightweight endpoints (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr);
  return true;
}
