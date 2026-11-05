export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatBytes(n?: number | null) {
  if (!n) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0, v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const LICENSE_LABELS: Record<string, string> = {
  public_domain: "Public Domain",
  creative_commons: "Creative Commons",
  author_owned: "Author-owned",
  explicit_permission: "Explicit permission",
};

export const LANGUAGES: Array<{ code: string; name: string }> = [
  { code: "en", name: "English" }, { code: "ur", name: "Urdu" }, { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" }, { code: "bn", name: "Bengali" }, { code: "es", name: "Spanish" },
  { code: "fr", name: "French" }, { code: "de", name: "German" }, { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" }, { code: "zh", name: "Chinese" }, { code: "ja", name: "Japanese" },
  { code: "tr", name: "Turkish" }, { code: "fa", name: "Persian" }, { code: "it", name: "Italian" },
];

export function languageName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code.toUpperCase();
}

/** Escape characters that have meaning inside PostgREST .or() filters. */
export function sanitizeSearch(q: string) {
  return q.replace(/[%_,()\\*"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}
