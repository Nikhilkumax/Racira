"use server";

import { subscribe } from "@/lib/finance/data/newsletter";

export async function subscribeNewsletter({ email }: { email: string }) {
  if (typeof email !== "string") throw new Error("email required");
  return subscribe(email);
}