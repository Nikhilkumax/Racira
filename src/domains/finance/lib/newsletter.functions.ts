"use server";

/**
 * Newsletter server action — thin wrapper kept so the client import path
 * (used by newsletter-signup.tsx) stays stable across the data-layer swap.
 */
import { subscribe } from "@/domains/finance/data/newsletter";

export async function subscribeNewsletter({ email }: { email: string }) {
  return subscribe(email);
}
