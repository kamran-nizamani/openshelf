#!/usr/bin/env node
/**
 * OpenShelf legal book importer.
 *
 * Imports ONLY books whose source states a redistributable licence:
 *   - openstax : OpenStax textbooks (Creative Commons, usually CC BY)
 *   - archive  : Internet Archive items whose metadata `licenseurl` is a Creative Commons
 *                licence or a public-domain dedication/mark. Items without that metadata are skipped.
 * Every imported book stores its source URL + licence in `license_evidence`.
 *
 * Usage (run on your own computer; needs your service-role key, which must never be shared):
 *   node --env-file=.env.local scripts/import-books.mjs --source=openstax --limit=20
 *   node --env-file=.env.local scripts/import-books.mjs --source=archive --category=history --limit=10
 *   add --dry-run to list what would be imported without writing anything
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, IMPORT_ADMIN_EMAIL
 * (IMPORT_ADMIN_EMAIL = the email of the admin account that will appear as uploader).
 */
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const source = args.source ?? "openstax";
const limit = Number(args.limit ?? 10);
const dry = Boolean(args["dry-run"]);
const onlyCategory = args.category; // slug, e.g. "history"
const MAX_PDF = 50 * 1024 * 1024; // matches the bucket limit
const UA = { "User-Agent": "OpenShelf-importer/1.0 (open library project)" };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, adminEmail = process.env.IMPORT_ADMIN_EMAIL;
if (!url || !key || !adminEmail) { console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and IMPORT_ADMIN_EMAIL (run with --env-file=.env.local)."); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(u) { const r = await fetch(u, { headers: UA }); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); }
async function getBuf(u, max) {
  const r = await fetch(u, { headers: UA, redirect: "follow" });
  if (!r.ok) throw new Error(`${r.status} ${u}`);
  const len = Number(r.headers.get("content-length") ?? 0);
  if (len && len > max) throw new Error("too large");
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > max) throw new Error("too large");
  return buf;
}

// ---- categories -------------------------------------------------------------
const KEYWORDS = {
  "artificial-intelligence": ["artificial intelligence"], "machine-learning": ["machine learning", "statistics", "data science"],
  "computer-science": ["computer science", "computing", "information systems"], programming: ["programming", "software", "python", "java"],
  technology: ["technology", "digital"], mathematics: ["math", "algebra", "calculus", "geometry", "trigonometry", "precalculus"],
  science: ["physics", "chemistry", "biology", "astronomy", "science", "anatomy", "microbiology", "geology"],
  business: ["business", "accounting", "finance", "economics", "management", "marketing", "law"],
  entrepreneurship: ["entrepreneur"], education: ["education", "teaching", "pedagogy"], history: ["history", "civilization", "u.s. history"],
  literature: ["literature", "poetry", "poems", "essays", "drama", "plays"], novels: ["novel", "fiction", "stories"],
  psychology: ["psychology", "sociology", "anthropology"], engineering: ["engineering", "mechanics"], "self-development": ["self-help", "personal development", "success"],
};
function guessCategory(text, fallback) {
  const t = text.toLowerCase();
  for (const [slug, words] of Object.entries(KEYWORDS)) if (words.some((w) => t.includes(w))) return slug;
  return fallback ?? "education";
}

const LANG = { eng: "en", urd: "ur", ara: "ar", hin: "hi", ben: "bn", spa: "es", fre: "fr", fra: "fr", ger: "de", deu: "de", por: "pt", rus: "ru", chi: "zh", zho: "zh", jpn: "ja", tur: "tr", per: "fa", fas: "fa", ita: "it" };
const toLang = (v) => { const s = String(Array.isArray(v) ? v[0] : v ?? "en").toLowerCase(); return s.length === 2 ? s : LANG[s] ?? "en"; };
const strip = (s) => String(s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const first = (v) => (Array.isArray(v) ? v[0] : v);

// ---- source: OpenStax -------------------------------------------------------
async function* openstax() {
  const u = "https://openstax.org/apps/cms/api/v2/pages/?type=books.Book&fields=title,description,cover_url,high_resolution_pdf_url,low_resolution_pdf_url,license_name,license_url,publish_date,book_state,slug&limit=100";
  const data = await getJson(u);
  for (const b of data.items ?? []) {
    const pdf = b.high_resolution_pdf_url || b.low_resolution_pdf_url;
    if (b.book_state && b.book_state !== "live") continue;
    if (!pdf || !b.license_name) continue;
    yield {
      title: strip(b.title), author: "OpenStax, Rice University", description: strip(b.description),
      pdf, cover: b.cover_url, language: "en", year: b.publish_date ? Number(String(b.publish_date).slice(0, 4)) : null,
      publisher: "OpenStax", license: "creative_commons",
      evidence: `Published by OpenStax under ${b.license_name}. Source: https://openstax.org/details/books/${b.slug ?? ""} ${b.license_url ?? ""}`.trim(),
      categoryText: `${b.title}`, id: `openstax:${b.slug ?? b.title}`,
    };
  }
}

// ---- source: Internet Archive ----------------------------------------------
const ARCHIVE_TOPICS = { technology: "technology", "computer-science": "computer science", programming: "programming", science: "science", mathematics: "mathematics", business: "business", education: "education", history: "history", literature: "literature", novels: "fiction", psychology: "psychology", engineering: "engineering", "self-development": "self help" };
async function* archive() {
  const topics = onlyCategory ? [[onlyCategory, ARCHIVE_TOPICS[onlyCategory] ?? onlyCategory]] : Object.entries(ARCHIVE_TOPICS);
  for (const [slug, topic] of topics) {
    const q = `mediatype:texts AND subject:("${topic}") AND (licenseurl:*publicdomain* OR licenseurl:*creativecommons.org*)`;
    const s = await getJson(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&sort[]=downloads+desc&rows=${Math.max(limit * 3, 15)}&output=json`);
    for (const d of s.response?.docs ?? []) {
      try {
        const m = await getJson(`https://archive.org/metadata/${d.identifier}`);
        const md = m.metadata ?? {};
        const lic = String(first(md.licenseurl) ?? "");
        const isPD = /publicdomain/i.test(lic);
        const isCC = /creativecommons\.org\/licenses\//i.test(lic);
        if (!isPD && !isCC) continue;
        const pdfFile = (m.files ?? []).filter((f) => /pdf/i.test(f.format ?? "") && !/^_|_text\.pdf$/.test(f.name)).sort((a, b) => Number(a.size) - Number(b.size)).find((f) => Number(f.size) <= MAX_PDF);
        if (!pdfFile) continue;
        yield {
          title: strip(first(md.title)), author: strip(first(md.creator)) || "Unknown author", description: strip(first(md.description)),
          pdf: `https://archive.org/download/${d.identifier}/${encodeURIComponent(pdfFile.name)}`, cover: `https://archive.org/services/img/${d.identifier}`,
          language: toLang(md.language), year: Number(String(first(md.date) ?? "").slice(0, 4)) || null, publisher: strip(first(md.publisher)) || null,
          license: isPD ? "public_domain" : "creative_commons",
          evidence: `Internet Archive item https://archive.org/details/${d.identifier} — licence: ${lic}`,
          categoryText: `${first(md.title)} ${[].concat(md.subject ?? []).join(" ")}`, categoryHint: slug, id: `archive:${d.identifier}`,
        };
        await sleep(500);
      } catch (e) { console.warn(`  skip ${d.identifier}: ${e.message}`); }
    }
  }
}

// ---- main -------------------------------------------------------------------
async function findAdmin() {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === adminEmail.toLowerCase());
    if (u) return u.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`No user with email ${adminEmail}. Sign up on the site first.`);
}

function imageType(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return { ext: "jpg", mime: "image/jpeg" };
  if (b.subarray(0, 4).toString("hex") === "89504e47") return { ext: "png", mime: "image/png" };
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", mime: "image/webp" };
  return null;
}

const adminId = dry ? null : await findAdmin();
const { data: cats } = await db.from("categories").select("id, slug");
const catId = Object.fromEntries((cats ?? []).map((c) => [c.slug, c.id]));
const perCategory = {};
let done = 0;
const gen = source === "archive" ? archive() : openstax();

for await (const b of gen) {
  if (done >= limit * (source === "archive" && !onlyCategory ? Object.keys(ARCHIVE_TOPICS).length : 1)) break;
  const slug = guessCategory(b.categoryText ?? b.title, b.categoryHint);
  if (onlyCategory && slug !== onlyCategory && source !== "archive") continue;
  if ((perCategory[slug] ?? 0) >= limit) continue;
  if (!b.title || b.title.length > 300) continue;
  const description = b.description.length >= 20 ? b.description.slice(0, 4900) : `${b.title} by ${b.author}. Freely distributable under the licence stated on this page.`;
  console.log(`${dry ? "[dry] " : ""}${slug.padEnd(24)} ${b.title}  (${b.license})`);
  if (dry) { perCategory[slug] = (perCategory[slug] ?? 0) + 1; done++; continue; }
  try {
    const pdf = await getBuf(b.pdf, MAX_PDF);
    if (!pdf.subarray(0, 1024).toString("latin1").includes("%PDF-")) throw new Error("not a PDF");
    const hash = createHash("sha256").update(pdf).digest("hex");
    const { data: dupe } = await db.from("books").select("id").eq("file_sha256", hash).maybeSingle();
    if (dupe) { console.log("   duplicate, skipped"); continue; }
    let pages = null;
    try { pages = (await PDFDocument.load(pdf, { updateMetadata: false, ignoreEncryption: false })).getPageCount(); } catch { /* keep null */ }
    const cover = b.cover ? await getBuf(b.cover, 5 * 1024 * 1024).catch(() => null) : null;
    const img = cover && imageType(cover);
    const id = randomUUID();
    const pdfPath = `${adminId}/${id}.pdf`;
    const up = await db.storage.from("books").upload(pdfPath, pdf, { contentType: "application/pdf" });
    if (up.error) throw up.error;
    let coverUrl = null, coverPath = null;
    if (img) {
      coverPath = `${adminId}/${id}.${img.ext}`;
      const c = await db.storage.from("covers").upload(coverPath, cover, { contentType: img.mime });
      if (!c.error) coverUrl = db.storage.from("covers").getPublicUrl(coverPath).data.publicUrl;
    }
    const { error } = await db.from("books").insert({
      id, title: b.title, author: b.author.slice(0, 200), description, category_id: catId[slug] ?? catId.education, language: b.language,
      publication_year: b.year && b.year >= 1000 && b.year <= 2100 ? b.year : null, publisher: b.publisher?.slice(0, 200) ?? null, page_count: pages,
      cover_url: coverUrl, file_path: pdfPath, file_size: pdf.length, file_sha256: hash, uploader_id: adminId,
      license_type: b.license, license_evidence: b.evidence.slice(0, 2000), allow_download: true, rights_confirmed: true,
      status: "approved", scan: "skipped", reviewed_by: adminId, reviewed_at: new Date().toISOString(),
    });
    if (error) { await db.storage.from("books").remove([pdfPath]); if (coverPath) await db.storage.from("covers").remove([coverPath]); throw error; }
    await db.from("moderation_logs").insert({ actor_id: adminId, action: "book_imported", book_id: id, note: b.id });
    perCategory[slug] = (perCategory[slug] ?? 0) + 1; done++;
    console.log(`   imported (${pages ?? "?"} pages)`);
  } catch (e) { console.warn(`   failed: ${e.message ?? e}`); }
  await sleep(800);
}
console.log(`\nDone. ${dry ? "Would import" : "Imported"} ${done} book(s).`, perCategory);
