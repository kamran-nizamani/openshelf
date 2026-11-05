export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  maxPdfBytes: Number(process.env.MAX_PDF_SIZE_MB ?? 50) * 1024 * 1024,
  maxCoverBytes: Number(process.env.MAX_COVER_SIZE_MB ?? 5) * 1024 * 1024,
  uploadsPerDay: Number(process.env.UPLOADS_PER_DAY ?? 5),
  scanProvider: process.env.MALWARE_SCAN_PROVIDER ?? "none",
};

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
