"use server";

import { subscribe } from "@/domains/finance/data/newsletter";

export async function subscribeNewsletter({ email }: { email: string }) {
  if (typeof email !== "string") throw new Error("email required");
  return subscribe(email);
}