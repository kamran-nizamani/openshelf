"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email");
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true); // same message whether or not the account exists
  }

  if (sent) return <div className="text-center"><h1 className="text-2xl font-bold">Check your email</h1><p className="mt-2 text-sm text-muted">If an account exists for that address, a reset link is on its way.</p></div>;
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Reset password</h1>
      <Field label="Email"><Input name="email" type="email" required /></Field>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
      <p className="text-center text-sm"><Link href="/login" className="font-semibold text-primary">Back to login</Link></p>
    </form>
  );
}
