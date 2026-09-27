/**
 * Server-only configuration for the sieve integration.
 *
 * Follows the repo's existing convention (.server.ts suffix + read process.env
 * inside a function rather than at module scope), and adds no new config
 * system: the key lives in the same .env.local that Next.js already loads, is
 * declared as a placeholder in .env.example, and is read lazily so an unset
 * key degrades to "sieve is off" instead of breaking the app.
 *
 * Never import this from a "use client" module, a script that ships to the
 * browser, or an error report — the key has full account access and no scopes.
 */
import process from "node:process";

import { SieveError } from "./errors";
import { SIEVE_BASE_URL } from "./request";

/** The self-reported name shown on the approval page during device login. */
export const SIEVE_DEVICE_CLIENT_NAME = "Racira Freebuff agent";

export function isSieveConfigured(): boolean {
  return typeof process.env.SIEVE_API_KEY === "string" && process.env.SIEVE_API_KEY.trim() !== "";
}

export interface SieveConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Throws a `not_configured` SieveError when SIEVE_API_KEY is absent. Callers
 * that must not change behaviour when sieve is off should ask
 * `isSieveConfigured()` first and return their unconfigured response.
 */
export function getSieveConfig(): SieveConfig {
  const apiKey = process.env.SIEVE_API_KEY?.trim() ?? "";
  if (apiKey === "") {
    throw new SieveError("not_configured", "SIEVE_API_KEY is not set");
  }
  // Trailing slash tolerated; only an explicit override is honoured so a
  // typo cannot silently redirect the key to another host.
  const baseUrl = (process.env.SIEVE_API_BASE_URL?.trim() || SIEVE_BASE_URL).replace(/\/+$/, "");
  return { apiKey, baseUrl };
}
