"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { EditBookDialog, type EditableBook } from "@/components/dashboard/UploadRowActions";

export function BookModeration({ book, status, scan, categories }: { book: EditableBook; status: string; scan: string; categories: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [copyright, setCopyright] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function act(action: string, needsReason: boolean) {
    if (needsReason && reason.trim().length < 5) return toast("error", "Enter a reason (5+ characters).");
    setBusy(action);
    const res = await fetch(`/api/admin/books/${book.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(needsReason ? { action, reason, copyright } : { action }),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast("error", body.error ?? "Action failed");
    toast("success", `Book ${action}${action.endsWith("e") ? "d" : "ed"}`);
    setReason(""); router.refresh();
  }

  async function openPdf() {
    setBusy("pdf");
    const res = await fetch(`/api/admin/books/${book.id}/file`);
    const body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast("error", body.error ?? "Could not open the PDF");
    window.open(body.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
      <h2 className="font-semibold">Moderation</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openPdf} loading={busy === "pdf"}><ExternalLink className="h-4 w-4" /> Review PDF</Button>
        <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit metadata</Button>
      </div>
      <Field label="Reason / note (required to reject, restrict or remove)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} className="min-h-20" /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={copyright} onChange={(e) => setCopyright(e.target.checked)} className="h-4 w-4" /> Upheld copyright violation (adds a strike to the uploader)</label>
      <div className="flex flex-wrap gap-2">
        {status === "pending" && <>
          <Button onClick={() => act("approve", false)} loading={busy === "approve"} disabled={scan === "infected"}>Approve &amp; publish</Button>
          <Button variant="danger" onClick={() => act("reject", true)} loading={busy === "reject"}>Reject</Button>
        </>}
        {status === "approved" && <>
          <Button variant="secondary" onClick={() => act("restrict", true)} loading={busy === "restrict"}>Restrict access</Button>
          <Button variant="danger" onClick={() => act("remove", true)} loading={busy === "remove"}>Remove</Button>
        </>}
        {["restricted", "removed", "rejected"].includes(status) && <Button onClick={() => act("restore", false)} loading={busy === "restore"} disabled={scan === "infected"}>Restore &amp; publish</Button>}
        {status === "restricted" && <Button variant="danger" onClick={() => act("remove", true)} loading={busy === "remove"}>Remove</Button>}
      </div>
      {scan === "infected" && <p className="text-sm text-red-700">This file was flagged as infected and cannot be published.</p>}
      {editing && <EditBookDialog staff book={book} categories={categories} endpoint={`/api/admin/books/${book.id}`} onClose={() => setEditing(false)} />}
    </div>
  );
}
