"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/domains/finance/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Finance admin sign-in. Single admin account, provisioned directly in the
 * Supabase project (Dashboard → Authentication → Add user). There is
 * deliberately NO self-signup flow — the only way in is an existing account.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Invalid email or password.");
        return;
      }
      // Session cookies are set client-side by @supabase/ssr; a full
      // navigation lets the middleware see them on the next request.
      router.replace("/finance/admin");
      router.refresh();
    } catch {
      setError("Sign-in is unavailable — Supabase is not configured.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-6 flex items-center gap-2 font-display text-lg font-semibold">
          <span
            className="grid h-7 w-7 place-items-center rounded-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </span>
          Racira Admin
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editorial access only. Contact the team for an account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              placeholder="you@racira.com"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
