"use server";

/**
 * Newsletter subscribers — Supabase.
 *
 * subscribe() runs with the anon key and relies on the unique email
 * constraint (schema.sql) for idempotency: a duplicate insert is treated as
 * success (already subscribed), so double submits don't error.
 * listSubscribers() is admin-only (service role behind requireUser); the
 * subscribers table has no public RLS policies at all.
 */
import { createClient, createAdminClient } from "@/domains/finance/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(email: string): Promise<{ ok: boolean; reason?: string }> {
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return { ok: false, reason: "Invalid email" };
  }

  const { error } = await createClient()
    .from("newsletter_subscribers")
    .insert({ email: email.trim().toLowerCase() });

  if (error) {
    // Unique violation → already subscribed. Treat as success, mirroring the
    // mock's "Already subscribed" UX without leaking whether the email exists.
    if (error.code === "23505") return { ok: true };
    return { ok: false, reason: "Could not subscribe. Try again." };
  }
  return { ok: true };
}

export async function listSubscribers(): Promise<{ id: string; email: string; created_at: string }[]> {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error("Unauthorized");

  const { data: rows, error } = await createAdminClient()
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listSubscribers failed: ${error.message}`);
  return (rows ?? []) as { id: string; email: string; created_at: string }[];
}
