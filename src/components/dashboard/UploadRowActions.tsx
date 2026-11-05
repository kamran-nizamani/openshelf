"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { LANGUAGES } from "@/lib/utils";
import { LICENSE_LABELS } from "@/lib/utils";

export type EditableBook = {
  id: string; title: string; author: string; description: string; categoryId: string; language: string;
  publicationYear: number | null; isbn: string | null; publisher: string | null; allowDownload: boolean;
  licenseType: string; licenseEvidence: string; status: string;
};

/** Shared edit dialog. `endpoint` is the owner route or the staff route; `wrap` shapes the body. */
export function EditBookDialog({ book, categories, endpoint, staff, onClose }: {
  book: EditableBook; categories: Array<{ id: string; name: string }>; endpoint: string; staff?: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const meta = {
      title: f.get("title"), author: f.get("author"), description: f.get("description"), categoryId: f.get("categoryId"),
      language: f.get("language"), publicationYear: f.get("publicationYear") ?? "", isbn: f.get("isbn") ?? "", publisher: f.get("publisher") ?? "",
      licenseType: f.get("licenseType"), licenseEvidence: f.get("licenseEvidence"), allowDownload: f.get("allowDownload") === "on",
    };
    setBusy(true);
    const res = await fetch(endpoint, {
      method: staff ? "POST" : "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staff ? { action: "edit", meta } : meta),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast("error", body.error ?? "Could not save");
    toast("success", !staff && book.status === "approved" ? "Saved. The book returns to review before it is public again." : "Changes saved");
    onClose(); router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" role="dialog" aria-modal="true" aria-label="Edit book">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Edit metadata</h2><button type="button" aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button></div>
        {!staff && book.status === "approved" && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This book is published. Saving changes sends it back to moderation.</p>}
        <Field label="Title"><Input name="title" defaultValue={book.title} required maxLength={300} /></Field>
        <Field label="Author"><Input name="author" defaultValue={book.author} required maxLength={200} /></Field>
        <Field label="Description"><Textarea name="description" defaultValue={book.description} required minLength={20} maxLength={5000} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category"><Select name="categoryId" defaultValue={book.categoryId}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
          <Field label="Language"><Select name="language" defaultValue={book.language}>{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</Select></Field>
          <Field label="Publication year"><Input name="publicationYear" type="number" min={1000} max={2100} defaultValue={book.publicationYear ?? ""} /></Field>
          <Field label="ISBN"><Input name="isbn" defaultValue={book.isbn ?? ""} /></Field>
          <Field label="Publisher"><Input name="publisher" defaultValue={book.publisher ?? ""} /></Field>
          <Field label="Licence"><Select name="licenseType" defaultValue={book.licenseType}>{Object.entries(LICENSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        </div>
        <Field label="Licence evidence"><Textarea name="licenseEvidence" defaultValue={book.licenseEvidence} required minLength={10} maxLength={2000} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="allowDownload" defaultChecked={book.allowDownload} className="h-4 w-4" /> Allow free PDF downloads (otherwise read-online only)</label>
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Save changes</Button></div>
      </form>
    </div>
  );
}

export function UploadRowActions({ book, categories, canDelete }: { book: EditableBook; categories: Array<{ id: string; name: string }>; canDelete: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const editable = ["pending", "approved", "rejected"].includes(book.status);

  async function remove() {
    if (!confirm(`Delete "${book.title}" permanently? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/books/${book.id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast("error", body.error ?? "Could not delete");
    toast("success", "Book deleted"); router.refresh();
  }
  return (
    <div className="flex gap-2">
      {editable && <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit</Button>}
      {canDelete && <Button variant="secondary" onClick={remove} loading={busy} className="text-red-600"><Trash2 className="h-4 w-4" /> Delete</Button>}
      {editing && <EditBookDialog book={book} categories={categories} endpoint={`/api/books/${book.id}`} onClose={() => setEditing(false)} />}
    </div>
  );
}
