"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = Boolean(createSupabaseBrowserClient());

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = createSupabaseBrowserClient();
    if (!client) return;
    setSubmitting(true); setError(null);
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await client.auth.signInWithPassword({
      email: String(form.get("email")), password: String(form.get("password")),
    });
    if (signInError) setError("Unable to sign in. Check your email and password.");
    setSubmitting(false);
  }

  return <main className="min-h-screen bg-app-page p-6 text-app-foreground"><form onSubmit={submit} className="mx-auto grid max-w-sm gap-5 rounded-[var(--radius-surface)] border border-app-border bg-app-surface p-6" aria-describedby={error ? "login-error" : undefined}>
    <div><p className="text-sm text-app-muted">SCR-AUTH-001</p><h1 className="text-3xl font-semibold">Sign in</h1></div>
    {!configured && <p role="alert" className="text-sm text-app-muted">Sign-in is unavailable because this environment is not configured.</p>}
    {error && <p id="login-error" role="alert" className="text-sm text-red-700">{error}</p>}
    <label className="grid gap-2">Email<input required name="email" type="email" autoComplete="email" className="rounded border border-app-border p-2" /></label>
    <label className="grid gap-2">Password<input required name="password" type="password" autoComplete="current-password" className="rounded border border-app-border p-2" /></label>
    <button disabled={!configured || submitting} className="rounded bg-app-primary p-2 text-white disabled:opacity-50">{submitting ? "Signing in…" : "Sign in"}</button>
  </form></main>;
}
