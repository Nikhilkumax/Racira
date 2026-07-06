/**
 * Lovable Cloud (Supabase) configuration flag.
 *
 * When Lovable Cloud is enabled, VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
 * are injected automatically — no manual key entry needed.
 *
 * While CLOUD_ENABLED stays false, all data access uses the mock store in
 * src/lib/data/store.ts.
 *
 * TODO(Cloud): flip to true once Cloud is enabled, then swap the mock branches
 * in src/lib/data/*.ts for Supabase queries.
 */
export const CLOUD_ENABLED = false;

export const cloudConfig = {
  supabaseUrl: (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey:
    (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
};