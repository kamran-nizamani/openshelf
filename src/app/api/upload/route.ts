import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser, isSuspended } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { detectImage, hasPdfSignature, inspectPdf, scanFile, sha256 } from "@/lib/files";
import { rateLimit, uploadsInLast24h } from "@/lib/rate-limit";
import { bookMetaSchema, firstError } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Please log in to upload.", 401);
  if (await isSuspended(user.id)) return fail("Your account is suspended and cannot upload.", 403);
  if (!rateLimit(`upload:${user.id}`, 3, 60_000)) return fail("Too many upload attempts. Wait a minute.", 429);
  if ((await uploadsInLast24h(user.id)) >= env.uploadsPerDay) return fail(`Daily upload limit reached (${env.uploadsPerDay} per 24 hours).`, 429);

  // Reject oversized bodies before buffering them.
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > env.maxPdfBytes + env.maxCoverBytes + 1024 * 1024) return fail("Upload is too large.", 413);

  let form: FormData;
  try { form = await req.formData(); } catch { return fail("Invalid upload."); }

  const parsed = bookMetaSchema.safeParse({
    title: form.get("title"), author: form.get("author"), description: form.get("description"),
    categoryId: form.get("categoryId"), language: form.get("language"),
    publicationYear: form.get("publicationYear") ?? "", isbn: form.get("isbn") ?? "", publisher: form.get("publisher") ?? "",
    licenseType: form.get("licenseType"), licenseEvidence: form.get("licenseEvidence"),
    allowDownload: form.get("allowDownload") === "on" || form.get("allowDownload") === "true",
    rightsConfirmed: form.get("rightsConfirmed") === "on" || form.get("rightsConfirmed") === "true",
  });
  if (!parsed.success) return fail(firstError(parsed.error));
  const m = parsed.data;

  const pdf = form.get("pdf");
  const cover = form.get("cover");
  if (!(pdf instanceof File) || pdf.size === 0) return fail("Choose a PDF file.");
  if (!(cover instanceof File) || cover.size === 0) return fail("Choose a cover image.");
  if (pdf.size > env.maxPdfBytes) return fail(`PDF is too large (max ${Math.round(env.maxPdfBytes / 1048576)} MB).`, 413);
  if (cover.size > env.maxCoverBytes) return fail(`Cover is too large (max ${Math.round(env.maxCoverBytes / 1048576)} MB).`, 413);

  const pdfBuf = Buffer.from(await pdf.arrayBuffer());
  const coverBuf = Buffer.from(await cover.arrayBuffer());

  // Signature checks: never trust the extension or the browser-reported MIME type.
  if (!hasPdfSignature(pdfBuf)) return fail("That file is not a valid PDF.");
  const img = detectImage(coverBuf);
  if (!img) return fail("Cover must be a JPG, PNG or WebP image.");
  const info = await inspectPdf(pdfBuf);
  if (!info.ok) return fail(info.reason);

  const admin = createAdminClient();
  const hash = sha256(pdfBuf);

  // Duplicate detection (same file already pending/approved)
  const { data: dupe } = await admin.from("books").select("id").eq("file_sha256", hash).in("status", ["pending", "approved", "restricted"]).maybeSingle();
  if (dupe) return fail("This exact file has already been uploaded to OpenShelf.", 409);

  const { data: cat } = await admin.from("categories").select("id").eq("id", m.categoryId).maybeSingle();
  if (!cat) return fail("Unknown category.");

  const scan = await scanFile(hash);
  if (scan.status === "infected") {
    await admin.from("moderation_logs").insert({ actor_id: null, action: "upload_blocked_malware", target_user_id: user.id, note: scan.detail });
    return fail("This file was flagged as malicious and cannot be uploaded.", 422);
  }

  const id = randomUUID();
  const pdfPath = `${user.id}/${id}.pdf`;
  const coverPath = `${user.id}/${id}.${img.ext}`;

  const up1 = await admin.storage.from("books").upload(pdfPath, pdfBuf, { contentType: "application/pdf", upsert: false });
  if (up1.error) return fail("Could not store the PDF. Please try again.", 500);
  const up2 = await admin.storage.from("covers").upload(coverPath, coverBuf, { contentType: img.mime, upsert: false });
  if (up2.error) { await admin.storage.from("books").remove([pdfPath]); return fail("Could not store the cover. Please try again.", 500); }

  const { data: pub } = admin.storage.from("covers").getPublicUrl(coverPath);

  const { error } = await admin.from("books").insert({
    id, title: m.title, author: m.author, description: m.description, category_id: m.categoryId, language: m.language,
    publication_year: m.publicationYear ?? null, isbn: m.isbn ?? null, publisher: m.publisher ?? null,
    page_count: info.pages, cover_url: pub.publicUrl, file_path: pdfPath, file_size: pdf.size, file_sha256: hash,
    uploader_id: user.id, license_type: m.licenseType, license_evidence: m.licenseEvidence,
    allow_download: m.allowDownload, rights_confirmed: true, status: "pending", scan: scan.status === "error" ? "error" : scan.status,
  });
  if (error) {
    await admin.storage.from("books").remove([pdfPath]);
    await admin.storage.from("covers").remove([coverPath]);
    return fail(error.code === "23505" ? "This file has already been uploaded." : "Could not save the book.", error.code === "23505" ? 409 : 500);
  }

  if (info.risky.length) {
    await admin.from("moderation_logs").insert({ actor_id: null, book_id: id, action: "upload_flagged_active_content", target_user_id: user.id, note: `PDF contains: ${info.risky.join(", ")}` });
  }
  return NextResponse.json({ ok: true, id, status: "pending" }, { status: 201 });
}
