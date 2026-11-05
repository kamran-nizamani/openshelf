import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (!rateLimit(`search:${ip}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const q = sanitizeSearch(req.nextUrl.searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json({ suggestions: [] });
  const supabase = await createClient();
  const { data } = await supabase.rpc("search_suggestions", { q, lim: 6 });
  return NextResponse.json({ suggestions: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=30" } });
}
