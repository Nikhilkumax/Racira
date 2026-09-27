/**
 * Composition root for the sieve routes.
 *
 * Lives in the app layer, not in the seo domain, because it is the one place
 * that knows both about sieve config and about the app's existing Supabase
 * client factory. Nothing here reads a secret into a response or a log.
 */

import { NextResponse } from "next/server";

import { createAdminClient, isSupabaseConfigured } from "@/domains/finance/lib/supabase/server";
import { createSieveClient, type SieveClient } from "@/domains/seo/lib/sieve/client.server";
import { getSieveConfig, isSieveConfigured } from "@/domains/seo/lib/sieve/config.server";
import {
  SieveError,
  errorHint,
  httpStatusForSieveError,
  toSieveError,
} from "@/domains/seo/lib/sieve/errors";
import { createSupabaseRunStore } from "@/domains/seo/lib/sieve/supabase-store.server";
import type { SieveRunStore } from "@/domains/seo/lib/sieve/store";
import type { AdminGateResult } from "@/lib/adminAuth";

export interface SieveRouteContext {
  client: SieveClient;
  store: SieveRunStore;
}

/** 503 when sieve is off; null when the caller should carry on. */
export function sieveUnavailable(): NextResponse | null {
  if (!isSieveConfigured()) {
    return NextResponse.json(
      {
        error: "sieve is not configured",
        kind: "not_configured",
        hint: errorHint("not_configured"),
      },
      { status: 503 },
    );
  }
  if (!isSupabaseConfigured()) {
    // A run must be recorded before the POST is sent (no idempotency key, and
    // accepted calls spend credits) — without durable storage we refuse rather
    // than risk a duplicate run.
    return NextResponse.json(
      {
        error: "durable storage is not configured",
        kind: "not_configured",
        hint: "sieve runs need Supabase env vars (see supabase/schema.sql: sieve_runs).",
      },
      { status: 503 },
    );
  }
  return null;
}

export function sieveContext(): SieveRouteContext {
  const { apiKey, baseUrl } = getSieveConfig();
  return {
    client: createSieveClient({ apiKey, baseUrl }),
    store: createSupabaseRunStore(createAdminClient()),
  };
}

/** Uniform JSON error mapping for every sieve route. */
export function sieveErrorResponse(error: unknown, context: string): NextResponse {
  const mapped = toSieveError(error, context);
  const status = httpStatusForSieveError(mapped.kind);
  const headers =
    mapped.retryAfterMs !== null
      ? { "Retry-After": String(Math.max(1, Math.ceil(mapped.retryAfterMs / 1000))) }
      : undefined;
  return NextResponse.json(
    {
      error: mapped.message,
      kind: mapped.kind,
      hint: errorHint(mapped.kind),
      detail: mapped.detail,
      ...(mapped.ambiguous ? { ambiguous: true } : {}),
    },
    { status, headers },
  );
}

/** Reads a JSON body, rejecting non-objects with a bad_request SieveError. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new SieveError("bad_request", "request body must be JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new SieveError("bad_request", "request body must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

/** 401/403 for a failed admin gate, mirroring /finance/admin. Null to carry on. */
export function adminDenied(gate: AdminGateResult): NextResponse | null {
  if (gate.ok) return null;
  return NextResponse.json(
    {
      error: gate.message,
      kind: "unauthorized",
      hint: errorHint("unauthorized"),
    },
    { status: gate.status },
  );
}
