"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Download, Flag, Share2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { reportSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export function BookActions({ bookId, title, canDownload, signedIn, saved }: { bookId: string; title: string; canDownload: boolean; signedIn: boolean; saved: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(saved);
  const [busy, setBusy] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);

  const needLogin = () => router.push(`/login?next=/books/${bookId}`);

  async function download() {
    if (!signedIn) return needLogin();
    setBusy("dl");
    const res = await fetch(`/api/books/${bookId}/file?mode=download`);
    const body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast("error", body.error ?? "Download failed");
    window.location.href = body.url;
    toast("success", "Your download is starting");
  }

  async function toggleSave() {
    if (!signedIn) return needLogin();
    setBusy("save");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(null); return needLogin(); }
    const { error } = isSaved
      ? await supabase.from("saved_books").delete().eq("book_id", bookId).eq("user_id", user.id)
      : await supabase.from("saved_books").insert({ book_id: bookId, user_id: user.id });
    setBusy(null);
    if (error) return toast("error", error.message);
    setIsSaved(!isSaved);
    toast("success", isSaved ? "Removed from My Library" : "Added to My Library");
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); toast("success", "Link copied to clipboard"); }
    } catch { /* user cancelled */ }
  }

  async function submitReport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = reportSchema.safeParse({
      bookId, kind: f.get("kind"), details: f.get("details"), claimantName: f.get("claimantName"), claimantContact: f.get("claimantContact"),
    });
    if (!parsed.success) return toast("error", firstError(parsed.error));
    setBusy("report");
    const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
    setBusy(null);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return toast("error", body.error ?? "Could not send report");
    setReporting(false);
    toast("success", "Report received. Our team will review it.");
  }

  return (
    <>
      {canDownload && <Button variant="secondary" onClick={download} loading={busy === "dl"}><Download className="h-4 w-4" /> Download PDF</Button>}
      <Button variant="secondary" onClick={toggleSave} loading={busy === "save"}>
        {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />} {isSaved ? "In My Library" : "Add to My Library"}
      </Button>
      <Button variant="ghost" onClick={share}><Share2 className="h-4 w-4" /> Share</Button>
      <Button variant="ghost" onClick={() => (signedIn ? setReporting(true) : needLogin())}><Flag className="h-4 w-4" /> Report</Button>

      {reporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" role="dialog" aria-modal="true" aria-label="Report this book">
          <form onSubmit={submitReport} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Report this book</h2>
              <button type="button" aria-label="Close" onClick={() => setReporting(false)}><X className="h-5 w-5" /></button></div>
            <Field label="Reason">
              <Select name="kind" defaultValue="copyright">
                <option value="copyright">Copyright infringement</option><option value="inappropriate">Inappropriate content</option>
                <option value="broken_file">Broken or wrong file</option><option value="wrong_metadata">Wrong information</option><option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Details" hint="For copyright claims, explain what work is infringed and why you hold the rights."><Textarea name="details" required minLength={10} maxLength={4000} /></Field>
            <Field label="Your name (copyright claims)"><Input name="claimantName" /></Field>
            <Field label="Contact details (copyright claims)"><Input name="claimantContact" /></Field>
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setReporting(false)}>Cancel</Button><Button type="submit" loading={busy === "report"}>Submit report</Button></div>
          </form>
        </div>
      )}
    </>
  );
}
