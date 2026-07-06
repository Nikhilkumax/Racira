"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/domains/finance/lib/newsletter.functions";
import { toast } from "sonner";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    try {
      const res = await subscribeNewsletter({ email });
      if (res.ok) {
        toast.success("Subscribed. Welcome aboard.");
        setEmail("");
      } else {
        toast.error(res.reason ?? "Something went wrong.");
      }
    } catch {
      toast.error("Could not subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        "rounded-2xl border border-border/60 p-6 md:p-8 " +
        (compact ? "" : "bg-card shadow-[var(--shadow-soft)]")
      }
      style={!compact ? { background: "var(--gradient-hero)" } : undefined}
    >
      <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        The Racira Weekly
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        One careful email each Sunday. The week's most important moves in markets, money, and policy — distilled.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          required
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background"
        />
        <Button type="submit" disabled={busy}>{busy ? "Subscribing…" : "Subscribe"}</Button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">Free. Unsubscribe anytime. No spam, ever.</p>
    </div>
  );
}