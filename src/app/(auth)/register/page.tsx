"use client";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      fullName: f.get("fullName"), email: f.get("email"), password: f.get("password"),
      confirmPassword: f.get("confirmPassword"), acceptTerms: f.get("acceptTerms") === "on",
    });
    if (!parsed.success) return setError(firstError(parsed.error));
    setLoading(true);
    const { error } = await createClient().auth.signUp({
      email: parsed.data.email, password: parsed.data.password,
      options: { data: { full_name: parsed.data.fullName }, emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  if (done) return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-sm text-muted">We sent a verification link. Open it to activate your account, then log in.</p>
      <Link href="/login" className="mt-6 inline-block font-semibold text-primary">Go to login</Link>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <Field label="Full name"><Input name="fullName" autoComplete="name" required /></Field>
      <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
      <Field label="Password" hint="10+ characters with upper, lower case and a number"><Input name="password" type="password" autoComplete="new-password" required /></Field>
      <Field label="Confirm password"><Input name="confirmPassword" type="password" autoComplete="new-password" required /></Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptTerms" className="mt-1" />
        <span>I accept the <Link className="text-primary underline" href="/terms">Terms</Link> and <Link className="text-primary underline" href="/privacy">Privacy Policy</Link>.</span>
      </label>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Sign up</Button>
      <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-primary">Log in</Link></p>
    </form>
  );
}
