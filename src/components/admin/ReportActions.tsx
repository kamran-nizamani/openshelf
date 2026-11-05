"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

export function ReportActions({ reportId, hasBook, status, note: initial }: { reportId: string; hasBook: boolean; status: string; note: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [note, setNote] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function send(next: string, restrictBook = false) {
    setBusy(next + restrictBook);
    const res = await fetch(`/api/admin/reports/${reportId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next, note, restrictBook }) });
    const body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast("error", body.error ?? "Action failed");
    toast("success", "Decision recorded"); router.refresh();
  }
  const done = status === "resolved" || status === "dismissed";
  return (
    <div className="mt-3 space-y-2">
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Decision / investigation notes" maxLength={2000} className="min-h-16" aria-label="Decision notes" />
      <div className="flex flex-wrap gap-2">
        {!done && status !== "investigating" && <Button variant="secondary" onClick={() => send("investigating")} loading={busy === "investigatingfalse"}>Start investigating</Button>}
        {hasBook && !done && <Button variant="secondary" onClick={() => send("investigating", true)} loading={busy === "investigatingtrue"}>Restrict book &amp; investigate</Button>}
        {!done && <Button onClick={() => send("resolved")} loading={busy === "resolvedfalse"}>Resolve</Button>}
        {!done && <Button variant="ghost" onClick={() => send("dismissed")} loading={busy === "dismissedfalse"}>Dismiss</Button>}
        {done && <Button variant="secondary" onClick={() => send("open")} loading={busy === "openfalse"}>Reopen</Button>}
      </div>
    </div>
  );
}
