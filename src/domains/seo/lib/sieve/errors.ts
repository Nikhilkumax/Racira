/**
 * Error taxonomy for the sieve API.
 *
 * Retry policy is a pure function of the kind, so the decision "may I send this
 * again?" is testable without any HTTP.
 *
 * The one rule that must never be broken: a timeout or network failure on
 * POST /api/scrapes is AMBIGUOUS. The call has no idempotency key and an
 * accepted call spends credits, so the first attempt may well have created a
 * run. Such errors carry `ambiguous = true` and every layer refuses to resend
 * them automatically.
 */

export type SieveErrorKind =
  | "not_configured" // SIEVE_API_KEY unset — sieve is simply off
  | "bad_request" // 400 — fix the request, never retry
  | "unauthorized" // 401 — key missing/revoked, tell the user
  | "payment_required" // 402 — out of credits, tell the user
  | "not_found" // 404 — unknown or not theirs
  | "turn_in_flight" // 409 — a follow-up turn is already running
  | "rate_limited" // 429 — safe to retry after Retry-After
  | "server" // 5xx — safe to retry with backoff
  | "network" // fetch rejected — GET safe, POST ambiguous
  | "timeout" // aborted — GET safe, POST ambiguous
  | "unexpected_status" // a status/state the contract does not define
  | "contract"; // a response body that cannot be trusted

export class SieveError extends Error {
  readonly kind: SieveErrorKind;
  readonly status: number | null;
  /** Human-readable detail from the API, safe to log (never contains the key). */
  readonly detail: string | null;
  /** Parsed Retry-After, in milliseconds, when the server sent one. */
  readonly retryAfterMs: number | null;
  /**
   * True when the outcome of a start POST is unknown (timeout / network).
   * Callers must surface this instead of retrying.
   */
  readonly ambiguous: boolean;

  constructor(
    kind: SieveErrorKind,
    message: string,
    options?: {
      status?: number | null;
      detail?: string | null;
      retryAfterMs?: number | null;
      ambiguous?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "SieveError";
    this.kind = kind;
    this.status = options?.status ?? null;
    this.detail = options?.detail ?? null;
    this.retryAfterMs = options?.retryAfterMs ?? null;
    this.ambiguous = options?.ambiguous ?? false;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

/** Maps an HTTP status to a kind. Only the statuses the contract defines. */
export function errorKindForStatus(status: number): SieveErrorKind {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 402:
      return "payment_required";
    case 404:
      return "not_found";
    case 409:
      return "turn_in_flight";
    case 429:
      return "rate_limited";
    default:
      return status >= 500 ? "server" : "unexpected_status";
  }
}

/** One-line guidance for the user, per the documented error table. */
export function errorHint(kind: SieveErrorKind): string {
  switch (kind) {
    case "not_configured":
      return "Set SIEVE_API_KEY (see scripts/sieve-device-login.mjs) to enable sieve scraping.";
    case "bad_request":
      return "The request was rejected — fix the inputs; retrying it unchanged will fail again.";
    case "unauthorized":
      return "The sieve API key is missing or revoked — reconnect it and try again.";
    case "payment_required":
      return "This sieve account is out of credits — check GET /api/me/credits.";
    case "not_found":
      return "That run was not found, or it belongs to another account.";
    case "turn_in_flight":
      return "A follow-up turn is already in flight for this run — wait, then resend.";
    case "rate_limited":
      return "Rate limited by sieve — wait for Retry-After before the next request.";
    case "server":
      return "sieve returned a server error — retry with backoff.";
    case "network":
      return "The network request to sieve failed.";
    case "timeout":
      return "The request to sieve timed out.";
    case "unexpected_status":
      return "sieve returned a state this client does not recognise.";
    case "contract":
      return "sieve returned a body that does not match the documented contract.";
    default:
      return "sieve request failed.";
  }
}

/**
 * The HTTP status this app's own sieve routes answer with for a given kind.
 * Upstream failures become 502/504 so a caller can tell "sieve rejected this"
 * (4xx, surfaced verbatim) from "we could not complete the work" (5xx).
 */
export function httpStatusForSieveError(kind: SieveErrorKind): number {
  switch (kind) {
    case "not_configured":
      return 503;
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "payment_required":
      return 402;
    case "not_found":
      return 404;
    case "turn_in_flight":
      return 409;
    case "rate_limited":
      return 429;
    case "server":
      return 502;
    case "network":
    case "timeout":
      return 504;
    case "unexpected_status":
    case "contract":
      return 502;
    default:
      return 502;
  }
}

/**
 * Safe to send POST /api/scrapes again?
 *
 * No run was created for 429 or 5xx, so resending cannot cost a duplicate run.
 * Everything else — including every timeout and network failure — must be
 * treated as "the first call may have succeeded".
 */
export function isSafeToRetryStart(kind: SieveErrorKind): boolean {
  return kind === "rate_limited" || kind === "server";
}

/** Safe to repeat a GET (polling / download / credits)? */
export function isRetryableRead(kind: SieveErrorKind): boolean {
  return (
    kind === "rate_limited" ||
    kind === "server" ||
    kind === "network" ||
    kind === "timeout"
  );
}

/**
 * Parses a Retry-After header (delta-seconds or HTTP-date) into milliseconds.
 * Returns null when absent or unparseable. `nowMs` is injected so the function
 * stays pure and testable.
 */
export function parseRetryAfterMs(
  value: string | null | undefined,
  nowMs: number,
): number | null {
  if (value === null || value === undefined) return null;
  const raw = value.trim();
  if (raw === "") return null;
  if (/^\d+$/.test(raw)) {
    const seconds = Number.parseInt(raw, 10);
    return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : null;
  }
  const when = Date.parse(raw);
  if (Number.isNaN(when)) return null;
  return Math.max(0, when - nowMs);
}

/** Pulls the documented `{"error": "..."}` shape (or `message`) out of a body. */
export function readErrorDetail(bodyText: string | null | undefined): string | null {
  if (!bodyText) return null;
  const trimmed = bodyText.trim();
  if (trimmed === "") return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      for (const field of ["error", "message", "detail"]) {
        const value = record[field];
        if (typeof value === "string" && value.trim() !== "") return value;
      }
    }
  } catch {
    // Not JSON — fall through to the raw body.
  }
  return trimmed.slice(0, 500);
}

/** Normalises anything thrown by fetch into a SieveError. */
export function toSieveError(error: unknown, context?: string): SieveError {
  if (error instanceof SieveError) return error;
  const name = (error as { name?: string } | null)?.name;
  const message = (error as { message?: string } | null)?.message ?? "unknown error";
  const suffix = context ? ` (${context})` : "";
  if (name === "AbortError" || name === "TimeoutError") {
    return new SieveError("timeout", `sieve request timed out${suffix}`, { cause: error });
  }
  return new SieveError("network", `sieve request failed${suffix}: ${message}`, {
    cause: error,
  });
}
