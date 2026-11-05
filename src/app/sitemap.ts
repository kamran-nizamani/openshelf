import type { MetadataRoute } from "next";
import { env, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const pages = ["", "/explore", "/categories", "/about", "/help", "/contact", "/privacy", "/terms", "/copyright"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const }));
  if (!isSupabaseConfigured) return pages;
  // Cookie-free anon client: the sitemap is public data from the public_books view only.
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
  const { data } = await supabase.from("public_books").select("id, created_at").order("created_at", { ascending: false }).limit(5000);
  return [...pages, ...(data ?? []).map((b) => ({ url: `${base}/books/${b.id}`, lastModified: b.created_at }))];
}
