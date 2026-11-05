"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function UserActions({ userId, suspended }: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run() {
    let reason: string | undefined;
    if (!suspended) { const r = prompt("Reason for suspension (shown in the audit log):"); if (r === null) return; reason = r; }
    setBusy(true);
    const res = await fetch(`/api/admin/users/${userId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: suspended ? "restore" : "suspend", reason }) });
    const body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast("error", body.error ?? "Action failed");
    toast("success", suspended ? "Account restored" : "Account suspended"); router.refresh();
  }
  return <Button variant={suspended ? "secondary" : "danger"} onClick={run} loading={busy}>{suspended ? "Restore" : "Suspend"}</Button>;
}
