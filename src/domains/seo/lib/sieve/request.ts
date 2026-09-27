/**
 * Pure request building and response interpretation for the sieve API.
 *
 * Nothing here performs I/O, reads env, or touches the clock, so every rule
 * below (JSON vs multipart, the 32 KB output_schema ceiling, http(s)-only
 * target URLs, status classification, the follow-up turn check) is directly
 * testable at the HTTP boundary without a network.
 */

import { SieveError } from "./errors";
import type {
  SieveFile,
  SieveRunInput,
  SieveRunSnapshot,
  SieveSchemaConformance,
  SieveTableShape,
  SieveTurn,
} from "./types";

/** The one place the API origin is written down. */
export const SIEVE_BASE_URL = "https://scrape.usesieve.com";

/** Strict output_schema ceiling from the contract. */
export const MAX_OUTPUT_SCHEMA_BYTES = 32 * 1024;

const TABLE_SHAPES: readonly SieveTableShape[] = ["long", "wide"];
const COMPLIANCE_MODES = ["conservative", "regular", "yolo"] as const;

export interface SieveHttpRequest {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string | FormData;
}

/** Joins a base URL and a relative path without doubling or dropping slashes. */
export function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

/** The only header every request carries. The key is never logged. */
export function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Copies a byte view into a standalone ArrayBuffer. Uploads may be views with
 * an offset into a larger buffer, so `.buffer` alone is not safe to hand to
 * Blob/BodyInit.
 */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/** UTF-8 byte length without depending on Buffer (keeps this module portable). */
export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new SieveError("bad_request", `${field} must be an array of strings`);
  }
  const out: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim() === "") {
      throw new SieveError("bad_request", `${field} must contain non-empty strings`);
    }
    out.push(entry);
  }
  return out;
}

function assertHttpUrl(value: string, field: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new SieveError("bad_request", `${field} is not a valid URL: ${value}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SieveError("bad_request", `${field} must be an http(s) URL: ${value}`);
  }
  return parsed.href;
}

/** UTF-8 size of a value's JSON encoding, as the 32 KB ceiling is measured. */
export function serialiseJsonSize(value: unknown): number {
  const text = JSON.stringify(value);
  if (text === undefined) return Number.POSITIVE_INFINITY;
  return utf8ByteLength(text);
}

function assertJsonWithinCeiling(value: unknown, field: string): void {
  const size = serialiseJsonSize(value);
  if (!Number.isFinite(size)) {
    throw new SieveError("bad_request", `${field} is not JSON-serialisable`);
  }
  if (size > MAX_OUTPUT_SCHEMA_BYTES) {
    throw new SieveError(
      "bad_request",
      `output_schema exceeds the ${MAX_OUTPUT_SCHEMA_BYTES} byte ceiling`,
    );
  }
}

/**
 * Validates and normalises a run body into the plain object that goes on the
 * wire. `compliance_mode` defaults to "regular" — "yolo" must be asked for.
 */
export function serializeRunInput(input: SieveRunInput): Record<string, unknown> {
  if (!isPlainObject(input)) {
    throw new SieveError("bad_request", "run input must be an object");
  }
  const instruction = typeof input.instruction === "string" ? input.instruction.trim() : "";
  if (instruction === "") {
    throw new SieveError("bad_request", "instruction is required (plain language)");
  }

  const body: Record<string, unknown> = { instruction };

  const targetUrls = assertStringArray(input.target_urls, "target_urls");
  if (targetUrls && targetUrls.length > 0) {
    body.target_urls = targetUrls.map((url, index) =>
      assertHttpUrl(url, `target_urls[${index}]`),
    );
  }

  const fields = assertStringArray(input.fields, "fields");
  if (fields) body.fields = fields;

  if (input.schema !== undefined && input.schema !== null) {
    if (!isPlainObject(input.schema) && !Array.isArray(input.schema)) {
      throw new SieveError("bad_request", "schema must be a JSON object");
    }
    body.schema = input.schema;
  }

  if (input.output_schema !== undefined && input.output_schema !== null) {
    if (!isPlainObject(input.output_schema)) {
      throw new SieveError("bad_request", "output_schema must be a JSON object");
    }
    assertJsonWithinCeiling(input.output_schema, "output_schema");
    body.output_schema = input.output_schema;
  }

  if (input.table_shape !== undefined && input.table_shape !== null) {
    if (!TABLE_SHAPES.includes(input.table_shape)) {
      throw new SieveError(
        "bad_request",
        `table_shape must be one of ${TABLE_SHAPES.join(", ")}`,
      );
    }
    body.table_shape = input.table_shape;
  }

  const mode = input.compliance_mode ?? "regular";
  if (!(COMPLIANCE_MODES as readonly string[]).includes(mode)) {
    throw new SieveError(
      "bad_request",
      `compliance_mode must be one of ${COMPLIANCE_MODES.join(", ")}`,
    );
  }
  body.compliance_mode = mode;

  return body;
}

function buildMultipart(input: SieveRunInput, body: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue;
    form.append(key, typeof value === "string" ? value : JSON.stringify(value));
  }
  const file = input.file;
  if (!file) {
    throw new SieveError("bad_request", "file upload requested without a file");
  }
  const bytes = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes);
  const blob = new Blob([toArrayBuffer(bytes)], {
    type: file.contentType ?? "application/octet-stream",
  });
  form.append("file", blob, file.filename);
  return form;
}

/** POST /api/scrapes (or .../messages) — JSON, or multipart when a file is attached. */
export function buildRunRequest(options: {
  baseUrl?: string;
  apiKey: string;
  path?: string;
  input: SieveRunInput;
}): SieveHttpRequest {
  const body = serializeRunInput(options.input);
  const url = joinUrl(options.baseUrl ?? SIEVE_BASE_URL, options.path ?? "/api/scrapes");
  if (options.input.file) {
    // No Content-Type: the runtime must add the multipart boundary itself.
    return { url, method: "POST", headers: authHeaders(options.apiKey), body: buildMultipart(options.input, body) };
  }
  return {
    url,
    method: "POST",
    headers: { ...authHeaders(options.apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function buildPollRequest(options: {
  baseUrl?: string;
  apiKey: string;
  sessionId: string;
}): SieveHttpRequest {
  return {
    url: joinUrl(options.baseUrl ?? SIEVE_BASE_URL, `/api/scrapes/${encodeURIComponent(options.sessionId)}`),
    method: "GET",
    headers: authHeaders(options.apiKey),
  };
}

export function buildMessagesRequest(options: {
  baseUrl?: string;
  apiKey: string;
  sessionId: string;
  input: SieveRunInput;
}): SieveHttpRequest {
  return buildRunRequest({
    baseUrl: options.baseUrl,
    apiKey: options.apiKey,
    path: `/api/scrapes/${encodeURIComponent(options.sessionId)}/messages`,
    input: options.input,
  });
}

export function buildCreditsRequest(options: {
  baseUrl?: string;
  apiKey: string;
}): SieveHttpRequest {
  return {
    url: joinUrl(options.baseUrl ?? SIEVE_BASE_URL, "/api/me/credits"),
    method: "GET",
    headers: authHeaders(options.apiKey),
  };
}

/**
 * Turns a `files[].url` into an absolute URL, refusing to send the bearer key
 * to a host other than the API's own origin. The contract says these URLs are
 * relative; an absolute URL is therefore already suspect, and a cross-origin
 * one is a key-exfiltration vector, not a download.
 */
export function resolveArtifactUrl(baseUrl: string, fileUrl: string): string {
  if (typeof fileUrl !== "string" || fileUrl.trim() === "") {
    throw new SieveError("contract", "file entry has no url");
  }
  let parsed: URL;
  try {
    parsed = new URL(fileUrl, joinUrl(baseUrl, "/"));
  } catch {
    throw new SieveError("contract", `file url is not a valid URL: ${fileUrl}`);
  }
  const origin = new URL(joinUrl(baseUrl, "/")).origin;
  if (parsed.origin !== origin) {
    throw new SieveError(
      "contract",
      `refusing to send the sieve API key to ${parsed.origin} for a file hosted elsewhere`,
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new SieveError("contract", `file url is not http(s): ${fileUrl}`);
  }
  return parsed.href;
}

export function buildFileRequest(options: {
  baseUrl?: string;
  apiKey: string;
  file: Pick<SieveFile, "url">;
}): SieveHttpRequest {
  const baseUrl = options.baseUrl ?? SIEVE_BASE_URL;
  return {
    url: resolveArtifactUrl(baseUrl, options.file.url),
    method: "GET",
    headers: authHeaders(options.apiKey),
  };
}

/** Pending / terminal / unknown classification of a polled status string. */
export type RunStatusClass = "pending" | "done" | "refused" | "unknown";

export function classifyRunStatus(status: unknown): RunStatusClass {
  switch (status) {
    case "queued":
    case "running":
      return "pending";
    case "done":
      return "done";
    case "refused":
      return "refused";
    default:
      return "unknown";
  }
}

/**
 * The minimum a snapshot-like value must expose for the turn check. Loose on
 * purpose: the same helpers run against raw poll bodies and typed snapshots.
 */
export interface TurnCarrier {
  status?: string;
  turns?: SieveTurn[];
}

/** Number of turns on a snapshot (0 when the API has not reported any yet). */
export function turnCount(snapshot: TurnCarrier | null | undefined): number {
  const turns = snapshot?.turns;
  return Array.isArray(turns) ? turns.length : 0;
}

/**
 * The follow-up guard: a follow-up is only readable once the run is done AND
 * the turn list has advanced past the count recorded before the message was
 * sent. Without this, the poller reads the previous answer back.
 */
export function isFollowUpComplete(
  snapshot: TurnCarrier | null | undefined,
  baselineTurns: number,
): boolean {
  if (!snapshot) return false;
  if (classifyRunStatus(snapshot.status) !== "done") return false;
  return turnCount(snapshot) > baselineTurns;
}

export interface ConformanceVerdict {
  status: SieveSchemaConformance | "unknown";
  /** True only for "pass": the validated payload can be presented as clean. */
  isClean: boolean;
  /** True when the output must never be presented as clean data. */
  mustNotPresentAsClean: boolean;
  message: string;
}

export function conformanceVerdict(
  conformance: SieveRunSnapshot["schema_conformance"],
): ConformanceVerdict {
  const status = (conformance?.status ?? "unknown") as ConformanceVerdict["status"];
  switch (status) {
    case "pass":
      return {
        status,
        isClean: true,
        mustNotPresentAsClean: false,
        message: "Validated against output_schema — the payload in `result` is clean.",
      };
    case "partial":
      return {
        status,
        isClean: true,
        mustNotPresentAsClean: false,
        message: "No schema violations, but declared columns are missing — check the summary.",
      };
    case "fail":
      return {
        status,
        isClean: false,
        mustNotPresentAsClean: true,
        message:
          "Still non-conforming after schema repair — do NOT present this output as clean data.",
      };
    case "not_checkable":
      return {
        status,
        isClean: false,
        mustNotPresentAsClean: true,
        message: "Nothing in this run was checkable — there is no verified output.",
      };
    case "no_artifact":
      return {
        status,
        isClean: false,
        mustNotPresentAsClean: true,
        message: "The run produced no artifact to check.",
      };
    default:
      return {
        status: "unknown",
        isClean: false,
        mustNotPresentAsClean: true,
        message: "Unknown schema_conformance status — treat the output as unverified.",
      };
  }
}

/**
 * Delay before the next poll: 5s, then ×1.5 up to ~30s. Pure, so the schedule
 * is pinned by a test rather than by waiting.
 */
export function nextPollDelay(currentMs: number, maxMs = 30_000): number {
  return Math.min(maxMs, Math.round(currentMs * 1.5));
}

/** Reads a 202 start body into a StartedRun, or throws a contract error. */
export function parseStartedRun(body: unknown): { sessionId: string; poll: string } {
  const record = isPlainObject(body) ? body : {};
  const sessionId = record.session_id;
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new SieveError("contract", "202 response has no session_id");
  }
  if (record.status !== undefined && record.status !== "queued") {
    throw new SieveError(
      "contract",
      `202 response carried an unexpected status: ${String(record.status)}`,
    );
  }
  return {
    sessionId,
    poll: typeof record.poll === "string" ? record.poll : `/api/scrapes/${sessionId}`,
  };
}
