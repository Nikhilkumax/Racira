/**
 * Types for the sieve scrape API (https://scrape.usesieve.com).
 *
 * These mirror the wire contract documented by sieve. They are deliberately
 * structural and permissive on the read side: sieve may add fields, and a
 * status we do not recognise must surface as an error rather than be silently
 * treated as success, so every response field is optional except the ones the
 * caller is required to branch on.
 */

/** Column layout of the delivered table. */
export type SieveTableShape = "long" | "wide";

/**
 * How aggressively sieve may treat a target site.
 * "regular" is the default; "yolo" relaxes the site-access policy and is only
 * ever selected by an explicit caller (the user's) decision.
 */
export type SieveComplianceMode = "conservative" | "regular" | "yolo";

/**
 * Terminal and non-terminal run states.
 * "queued" appears in the 202 start response; GET can also report it.
 */
export type SieveRunStatus = "queued" | "running" | "done" | "refused";

/**
 * Verdict of the strict output_schema check.
 *  pass          — validated payload is inline in `result`.
 *  partial       — no violations, but declared columns are missing.
 *  fail          — still non-conforming after schema repair; NOT clean data.
 *  not_checkable — nothing in the run could be checked.
 *  no_artifact   — the run produced no artifact to check.
 */
export type SieveSchemaConformance =
  | "pass"
  | "partial"
  | "fail"
  | "not_checkable"
  | "no_artifact";

/** A document to scrape instead of (or alongside) target_urls. */
export interface SieveUploadFile {
  /** Raw bytes of the document. */
  bytes: Uint8Array;
  /** Filename sent in the multipart part. */
  filename: string;
  /** MIME type sent in the multipart part. */
  contentType?: string;
}

/**
 * Body of POST /api/scrapes and of a follow-up POST .../messages.
 * An upload switches the whole request to multipart/form-data with a "file"
 * field, exactly as the API documents.
 */
export interface SieveRunInput {
  /** Required, plain language. */
  instruction: string;
  /** Public http(s) pages to scrape. */
  target_urls?: string[];
  /** Expected columns. */
  fields?: string[];
  /** Advisory JSON Schema (not enforced). */
  schema?: unknown;
  /** Strict JSON Schema 2020-12, at most 32 KB serialised. */
  output_schema?: unknown;
  table_shape?: SieveTableShape;
  compliance_mode?: SieveComplianceMode;
  /** Optional document upload. */
  file?: SieveUploadFile;
}

/** 202 response body of POST /api/scrapes. */
export interface SieveStartedRun {
  status: "queued";
  session_id: string;
  poll: string;
}

/** One delivered file. `url` is relative to the API base URL. */
export interface SieveFile {
  name: string;
  size: number;
  ext: string;
  url: string;
}

/** A single conversational turn on a run. */
export interface SieveTurn {
  role?: string;
  content?: string;
  [key: string]: unknown;
}

/** Terminal state of a refused run: the run never started. */
export interface SieveRefusal {
  code: string;
  message?: string;
  /** Present when the refusal is a credit/quota limit. */
  quota?: unknown;
  [key: string]: unknown;
}

/** GET /api/scrapes/<session_id> (and the body echoed by messages). */
export interface SieveRunSnapshot {
  status: string;
  session_id?: string;
  summary?: string;
  files?: SieveFile[];
  schema_conformance?: {
    status?: string;
    [key: string]: unknown;
  } | null;
  /** Validated payload, present when output_schema passed. */
  result?: unknown;
  refusal?: SieveRefusal | null;
  turns?: SieveTurn[];
  error?: string;
  [key: string]: unknown;
}

/** GET /api/me/credits. */
export interface SieveCredits {
  plan?: string;
  limit?: number;
  used?: number;
  remaining?: number;
  [key: string]: unknown;
}

/** The subset of a durable run record that a store must round-trip. */
export interface SieveRunRecord {
  /** Local row id (uuid in Supabase, opaque string in memory). */
  id: string;
  /** Set as soon as the 202 arrives — the durable anti-duplicate anchor. */
  sessionId: string | null;
  /**
   * Local lifecycle:
   *  starting  — intent recorded, POST may be in flight or may have landed.
   *  queued    — 202 received, session_id persisted.
   *  running   — a poll reported "running".
   *  done      — terminal success.
   *  refused   — terminal refusal from sieve (run never started).
   *  ambiguous — the start POST timed out / lost the network; we must NOT retry.
   *  error     — terminal local error.
   */
  status: SieveRunStatusLocal;
  instruction: string;
  /** The request body as sent (minus the key), for resume/troubleshooting. */
  request: SieveRunInput;
  /** Last polled snapshot, for resume without a round trip. */
  snapshot: SieveRunSnapshot | null;
  /** Turn count recorded when a follow-up was sent. */
  baselineTurns: number | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SieveRunStatusLocal =
  | "starting"
  | "queued"
  | "running"
  | "done"
  | "refused"
  | "ambiguous"
  | "error";
