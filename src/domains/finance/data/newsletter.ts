/**
 * Newsletter subscribers.
 * TODO(Cloud): replace with supabase.from('subscribers').insert({ email }).
 */
import { getStore, uid } from "./store";

export function subscribe(email: string): { ok: boolean; reason?: string } {
  const s = getStore();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, reason: "Invalid email" };
  if (s.subscribers.some((x) => x.email.toLowerCase() === email.toLowerCase())) return { ok: false, reason: "Already subscribed" };
  s.subscribers.push({ id: uid("sub"), email, created_at: new Date().toISOString() });
  return { ok: true };
}

export const listSubscribers = () => getStore().subscribers.slice();