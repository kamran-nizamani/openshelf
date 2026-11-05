"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { LANGUAGES, LICENSE_LABELS } from "@/lib/utils";
import { bookMetaSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

const HINTS: Record<string, string> = {
  public_domain: "Link to the source (e.g. Project Gutenberg) or give the author's death year.",
  creative_commons: "State the exact licence (e.g. CC BY 4.0) and link to it.",
  author_owned: "Describe your authorship (your name, where it was published, your website).",
  explicit_permission: "Name the rights holder and describe or link to the written permission.",
};

export function UploadForm({ categories, maxPdfMb, maxCoverMb }: { categories: { id: string; name: string }[]; maxPdfMb: number; maxCoverMb: number }) {
  const { toast } = useToast();
  const [license, setLicense] = useState("public_domain");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const f = new FormData(form);

    const check = bookMetaSchema.safeParse({
      title: f.get("title"), author: f.get("author"), description: f.get("description"), categoryId: f.get("categoryId"),
      language: f.get("language"), publicationYear: f.get("publicationYear") ?? "", isbn: f.get("isbn") ?? "", publisher: f.get("publisher") ?? "",
      licenseType: f.get("licenseType"), licenseEvidence: f.get("licenseEvidence"),
      allowDownload: f.get("allowDownload") === "on", rightsConfirmed: f.get("rightsConfirmed") === "on",
    });
    if (!check.success) return setError(firstError(check.error));
    const pdf = f.get("pdf") as File, cover = f.get("cover") as File;
    if (!pdf?.size) return setError("Choose a PDF file.");
    if (pdf.type !== "application/pdf" && !pdf.name.toLowerCase().endsWith(".pdf")) return setError("The book must be a PDF.");
    if (pdf.size > maxPdfMb * 1048576) return setError(`PDF must be under ${maxPdfMb} MB.`);
    if (!cover?.size) return setError("Choose a cover image.");
    if (cover.size > maxCoverMb * 1048576) return setError(`Cover must be under ${maxCoverMb} MB.`);

    // XHR (not fetch) so we get real upload-progress events.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      setProgress(null);
      let body: { error?: string } = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* non-JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) { setDone(true); toast("success", "Uploaded! Your book is pending review."); form.reset(); }
      else { setError(body.error ?? "Upload failed. Please try again."); toast("error", body.error ?? "Upload failed"); }
    };
    xhr.onerror = () => { setProgress(null); setError("Network error. Please try again."); };
    setProgress(0);
    xhr.send(f);
  }

  if (done) return (
    <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-card">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
      <h2 className="mt-3 text-xl font-bold">Submitted for review</h2>
      <p className="mt-1 text-sm text-muted">Your book is <strong>pending</strong>. You can track its status in your dashboard.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/dashboard/uploads" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">View my uploads</Link>
        <Button variant="secondary" onClick={() => setDone(false)}>Upload another</Button>
      </div>
    </div>
  );

  const uploading = progress !== null;
  return (
    <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-card" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Book title *"><Input name="title" required maxLength={300} /></Field>
        <Field label="Author *"><Input name="author" required maxLength={200} /></Field>
      </div>
      <Field label="Description *" hint="At least 20 characters"><Textarea name="description" required maxLength={5000} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category *"><Select name="categoryId" required defaultValue=""><option value="" disabled>Choose…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Language *"><Select name="language" required defaultValue="en">{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</Select></Field>
        <Field label="Publication year"><Input name="publicationYear" type="number" min={1000} max={2100} /></Field>
        <Field label="ISBN"><Input name="isbn" placeholder="978-…" maxLength={17} /></Field>
        <Field label="Publisher"><Input name="publisher" maxLength={200} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`PDF file * (max ${maxPdfMb} MB)`}><Input name="pdf" type="file" accept="application/pdf,.pdf" required /></Field>
        <Field label={`Cover image * (JPG/PNG/WebP, max ${maxCoverMb} MB)`}><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" required /></Field>
      </div>

      <fieldset className="space-y-4 rounded-xl border border-line p-4">
        <legend className="px-2 text-sm font-semibold">Licence &amp; rights</legend>
        <Field label="Licence type *">
          <Select name="licenseType" value={license} onChange={(e) => setLicense(e.target.value)}>
            {Object.entries(LICENSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Licence evidence / permission details *" hint={HINTS[license]}><Textarea name="licenseEvidence" required maxLength={2000} /></Field>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="allowDownload" defaultChecked className="mt-1" />Allow readers to download the PDF (uncheck for online reading only)</label>
        <label className="flex items-start gap-2 text-sm font-medium"><input type="checkbox" name="rightsConfirmed" className="mt-1" />
          I confirm that I have the legal right to distribute this material, that the licence information above is accurate, and I accept the <Link href="/copyright" className="text-primary underline">Copyright Policy</Link>.</label>
      </fieldset>

      {uploading && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-1 text-xs text-muted">{progress === 100 ? "Processing and checking your file…" : `Uploading… ${progress}%`}</p>
        </div>
      )}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={uploading} className="w-full sm:w-auto">Submit for review</Button>
    </form>
  );
}
