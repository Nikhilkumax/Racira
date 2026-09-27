"use client";

/**
 * Browser Supabase client (anon key).
 *
 * - Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (public by
 *   design; row-level security on the database is the real boundary).
 * - Session storage lives in cookies via @supabase/ssr so the server
 *   middleware can see the same auth session (see ../server.ts + middleware).
 * - Only for "use client" files. For server components / route handlers use
 *   the server client instead.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
