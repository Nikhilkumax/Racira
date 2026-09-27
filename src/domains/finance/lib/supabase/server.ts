/**
 * Server-only Supabase client (service role key — bypasses RLS).
 *
 * ⚠️ MUST NEVER be imported from any "use client" file. This module reads
 * SUPABASE_SERVICE_ROLE_KEY, which would leak full database write access to
 * the browser bundle. The `import "server-only"` guard below makes the build
 * fail if a client component ever imports this file.
 *
 * Who may import this: server components, route handlers, server actions,
 * and the middleware session helper.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * True when the Supabase env vars hold real values. The placeholder
 * .env.example leaves them empty, so a checkout without a wired project
 * (local dev, previews) must degrade gracefully instead of 500-ing.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Thrown by the client factories when Supabase env vars are unset/empty.
 * Data functions catch this and return their empty-state results so that
 * public pages render their empty states in an unconfigured environment.
 * Writes still fail closed (throw Unauthorized) via requireUser().
 */
export class UnconfiguredSupabaseError extends Error {
  constructor() {
    super("Supabase env vars are not configured (placeholder .env values)");
    this.name = "UnconfiguredSupabaseError";
  }
}

/**
 * Request-scoped client bound to the user's auth cookies.
 * Use for reads gated by RLS and for auth session checks
 * (middleware, server components under /finance).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware refreshes sessions,
            // so this can be safely ignored (the @supabase/ssr pattern).
          }
        },
      },
    },
  );
}

/**
 * Cookie-free read client for ISR-cached public pages.
 *
 * Why it exists: any request-scoped `cookies()` access opts a Next.js route
 * into dynamic rendering, which would silently disable the `export const
 * revalidate` windows on the public finance pages. Public reads need NO
 * request context — anon-key access + RLS + an empty cookie jar is exactly
 * the anonymous-visitor position — so cached renders can use this client.
 *
 * Scope rule:
 *  - createReadClient(): public RLS reads inside cached (revalidate) pages.
 *  - createClient():     anything session-aware (auth checks, admin reads).
 *  - createAdminClient(): privileged writes only.
 */
export function createReadClient() {
  if (!isSupabaseConfigured()) {
    throw new UnconfiguredSupabaseError();
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No cookie writes from a cacheable render context.
        },
      },
    },
  );
}

/**
 * Privileged client using SUPABASE_SERVICE_ROLE_KEY (RLS bypassed).
 * Request-scoped (reads cookies per call). Use ONLY in trusted server code
 * for admin write operations: post/taxonomy/media CRUD, subscriber inserts.
 * Never import from "use client" code.
 */
export function createAdminClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Same Server Component caveat as above.
          }
        },
      },
    },
  );
}
