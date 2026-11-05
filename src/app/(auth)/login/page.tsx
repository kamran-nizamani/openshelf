"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, firstError } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("error") ?? "");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: f.get("email"), password: f.get("password") });
    if (!parsed.success) return setError(firstError(parsed.error));
    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) return setError(error.message === "Email not confirmed" ? "Please verify your email first." : "Invalid email or password.");
    const next = params.get("next");
    router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <Field label="Email"><Input name="email" type="email" autoComplete="email" required /></Field>
      <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">Your session is kept securely on this device.</span>
        <Link href="/forgot-password" className="font-semibold text-primary">Forgot password?</Link>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">Log in</Button>
      <p className="text-center text-sm text-muted">New here? <Link href="/register" className="font-semibold text-primary">Create an account</Link></p>
    </form>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
