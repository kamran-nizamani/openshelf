import "server-only";
import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { env } from "@/lib/env";

export function sha256(buf: Buffer) {
  return createHash("sha256").update(buf).digest("hex");
}

/** A PDF must start with %PDF- (within the first 1 KB) and contain an %%EOF marker near the end. */
export function hasPdfSignature(buf: Buffer) {
  if (!buf.subarray(0, 1024).toString("latin1").includes("%PDF-")) return false;
  return buf.subarray(Math.max(0, buf.length - 2048)).toString("latin1").includes("%%EOF");
}

export async function inspectPdf(buf: Buffer): Promise<{ ok: true; pages: number; risky: string[] } | { ok: false; reason: string }> {
  try {
    const doc = await PDFDocument.load(buf, { ignoreEncryption: false, updateMetadata: false });
    const pages = doc.getPageCount();
    if (pages < 1) return { ok: false, reason: "The PDF has no pages." };
    const text = buf.toString("latin1");
    const risky = ["/JavaScript", "/JS", "/Launch", "/EmbeddedFile", "/OpenAction", "/RichMedia"].filter((t) => text.includes(t));
    return { ok: true, pages, risky };
  } catch (e) {
    const msg = e instanceof Error ? e.message.toLowerCase() : "";
    if (msg.includes("encrypt")) return { ok: false, reason: "Password-protected PDFs are not accepted." };
    return { ok: false, reason: "The file is not a valid, readable PDF." };
  }
}

export function detectImage(buf: Buffer): { ext: "jpg" | "png" | "webp"; mime: string } | null {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}

export type ScanOutcome = { status: "clean" | "infected" | "skipped" | "error"; detail?: string };

/**
 * Malware scan. Provider "virustotal" does a SHA-256 hash lookup (the file is not uploaded to a
 * third party). A hash VirusTotal has never seen is reported as "skipped" (NOT clean), so moderators
 * know no verdict exists. Provider "none" always returns "skipped".
 */
export async function scanFile(hash: string): Promise<ScanOutcome> {
  if (env.scanProvider !== "virustotal") return { status: "skipped", detail: "No malware scanner configured" };
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) return { status: "error", detail: "VIRUSTOTAL_API_KEY missing" };
  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, { headers: { "x-apikey": key }, cache: "no-store" });
    if (res.status === 404) return { status: "skipped", detail: "Hash unknown to VirusTotal" };
    if (!res.ok) return { status: "error", detail: `VirusTotal HTTP ${res.status}` };
    const stats = (await res.json())?.data?.attributes?.last_analysis_stats;
    if (stats && (stats.malicious > 0)) return { status: "infected", detail: `${stats.malicious} engines flagged this file` };
    return { status: "clean" };
  } catch {
    return { status: "error", detail: "Scanner unreachable" };
  }
}
