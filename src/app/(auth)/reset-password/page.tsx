"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { passwordChangeSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const parsed = passwordChangeSchema.safeParse({ password: f.get("password"), confirmPassword: f.get("confirmPassword") });
    if (!parsed.success) return setError(firstError(parsed.error));
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <Field label="New password"><Input name="password" type="password" autoComplete="new-password" required /></Field>
      <Field label="Confirm password"><Input name="confirmPassword" type="password" autoComplete="new-password" required /></Field>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Update password</Button>
    </form>
  );
}
