/**
 * The sieve API client.
 *
 * Server-only by construction: it takes the key as a parameter, never reads
 * env, and never logs a request. It uses the platform `fetch` (the pattern
 * already used by /api/timestamp and /api/ca-chain) rather than adding another
 * HTTP library, and its clock/sleep are injectable so the backoff schedule and
 * the retry policy are asserted in tests instead of waited on.
 *
 * Contract rules encoded here, deliberately:
 *   - POST /api/scrapes is one attempt. It is repeated only after a 429 or a
 *     5xx (no run was created). A timeout or network failure is AMBIGUOUS: the
 *     error is flagged and never resent, because the first call may have been
 *     accepted and accepted calls spend credits.
 *   - GETs are safe to retry with exponential backoff, honouring Retry-After.
 *   - Polling starts at 5s and backs off to ~30s. There is no short overall
 *     deadline: runs take minutes.
 *   - A follow-up is only read once the run is "done" AND its turn list has
 *     grown past the count recorded before the message was sent.
 */

import {
  SieveError,
  errorKindForStatus,
  isRetryableRead,
  isSafeToRetryStart,
  parseRetryAfterMs,
  readErrorDetail,
  toSieveError,
} from "./errors";
import {
  SIEVE_BASE_URL,
  buildCreditsRequest,
  buildFileRequest,
  buildMessagesRequest,
  buildPollRequest,
  buildRunRequest,
  classifyRunStatus,
  isFollowUpComplete,
  nextPollDelay,
  parseStartedRun,
  turnCount,
  type SieveHttpRequest,
} from "./request";
import type {
  SieveCredits,
  SieveFile,
  SieveRunInput,
  SieveRunSnapshot,
} from "./types";

export interface SieveClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  /** Injected so tests never wait on a wall clock. */
  sleep?: (ms: number) => Promise<void>;
  /** Used for Retry-After (HTTP-date) parsing. */
  now?: () => number;
  /** Per-request timeout. A response is required within this window. */
  requestTimeoutMs?: number;
  /** First poll delay; grows by ~1.5× up to pollMaxDelayMs. */
  pollInitialDelayMs?: number;
  pollMaxDelayMs?: number;
  /** Extra attempts for POST /api/scrapes after a 429/5xx. Never after a timeout. */
  maxSafeStartRetries?: number;
  /** Extra attempts for GETs. */
  maxReadRetries?: number;
  /** How many times a 409 on a follow-up is tolerated before giving up. */
  maxTurnInFlightRetries?: number;
  baseRetryDelayMs?: number;
}

export interface WaitForRunOptions {
  onSnapshot?: (snapshot: SieveRunSnapshot) => void | Promise<void>;
  /** Follow-up gate: keep polling while this returns false on a done run. */
  isComplete?: (snapshot: SieveRunSnapshot) => boolean;
  /** Hard cap on elapsed time; undefined means "run to completion". */
  maxWaitMs?: number;
}

export interface SieveClient {
  readonly baseUrl: string;
  startRun(input: SieveRunInput): Promise<{ sessionId: string; poll: string }>;
  getRun(sessionId: string): Promise<SieveRunSnapshot>;
  waitForRun(sessionId: string, options?: WaitForRunOptions): Promise<SieveRunSnapshot>;
  sendMessage(sessionId: string, input: SieveRunInput): Promise<SieveRunSnapshot>;
  followUp(
    sessionId: string,
    input: SieveRunInput,
    options?: { onSnapshot?: (snapshot: SieveRunSnapshot) => void | Promise<void> },
  ): Promise<SieveRunSnapshot>;
  downloadFile(file: Pick<SieveFile, "url">): Promise<Uint8Array>;
  getCredits(): Promise<SieveCredits>;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const decoder = new TextDecoder("utf-8");

interface Fetched {
  status: number;
  headers: Headers;
  bytes: Uint8Array;
  text: string;
}

export function createSieveClient(options: SieveClientOptions): SieveClient {
  const apiKey = options.apiKey;
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new SieveError("not_configured", "SIEVE_API_KEY is not set");
  }
  const baseUrl = options.baseUrl ?? SIEVE_BASE_URL;
  const doFetch = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const now = options.now ?? (() => Date.now());
  const requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  const pollInitialDelayMs = options.pollInitialDelayMs ?? 5_000;
  const pollMaxDelayMs = options.pollMaxDelayMs ?? 30_000;
  const maxSafeStartRetries = options.maxSafeStartRetries ?? 2;
  const maxReadRetries = options.maxReadRetries ?? 3;
  const maxTurnInFlightRetries = options.maxTurnInFlightRetries ?? 5;
  const baseRetryDelayMs = options.baseRetryDelayMs ?? 1_000;

  /**
   * One HTTP round trip. Reads the body as bytes (files are binary) and
   * decodes a text view for JSON and error details.
   */
  async function performFetch(request: SieveHttpRequest): Promise<Fetched> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await doFetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
        cache: "no-store",
      });
      const bytes = new Uint8Array(await response.arrayBuffer());
      return {
        status: response.status,
        headers: response.headers,
        bytes,
        text: decoder.decode(bytes),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function toHttpError(response: Fetched, context: string): SieveError {
    return new SieveError(
      errorKindForStatus(response.status),
      `sieve ${context} failed with HTTP ${response.status}`,
      {
        status: response.status,
        detail: readErrorDetail(response.text),
        retryAfterMs: parseRetryAfterMs(response.headers.get("retry-after"), now()),
      },
    );
  }

  function parseJsonBody(response: Fetched): unknown {
    if (response.text.trim() === "") return {};
    try {
      return JSON.parse(response.text) as unknown;
    } catch {
      throw new SieveError("contract", "sieve returned a body that is not JSON", {
        status: response.status,
        detail: readErrorDetail(response.text),
      });
    }
  }

  function retryDelayFor(error: SieveError, attempt: number): number {
    if (error.retryAfterMs !== null) return error.retryAfterMs;
    return Math.min(pollMaxDelayMs, baseRetryDelayMs * 2 ** attempt);
  }

  /** GET with the read-retry policy. Never applied to POST /api/scrapes. */
  async function sendRead(request: SieveHttpRequest, context: string): Promise<Fetched> {
    let attempt = 0;
    for (;;) {
      let response: Fetched;
      try {
        response = await performFetch(request);
      } catch (error) {
        const mapped = toSieveError(error, context);
        if (attempt < maxReadRetries && isRetryableRead(mapped.kind)) {
          await sleep(retryDelayFor(mapped, attempt));
          attempt += 1;
          continue;
        }
        throw mapped;
      }
      if (response.status >= 200 && response.status < 300) return response;
      const mapped = toHttpError(response, context);
      if (attempt < maxReadRetries && isRetryableRead(mapped.kind)) {
        await sleep(retryDelayFor(mapped, attempt));
        attempt += 1;
        continue;
      }
      throw mapped;
    }
  }

  /**
   * POST /api/scrapes. Retried only when it is provably cheap to retry: no run
   * can have been created on a 429 or a 5xx. A timeout or network failure
   * returns an ambiguous error with no second attempt.
   */
  async function postStart(request: SieveHttpRequest): Promise<SieveRunSnapshot> {
    let attempt = 0;
    for (;;) {
      let response: Fetched;
      try {
        response = await performFetch(request);
      } catch (error) {
        const mapped = toSieveError(error, "POST /api/scrapes");
        throw new SieveError(
          mapped.kind,
          `${mapped.message} — the run may have been created, so this is not retried automatically`,
          { cause: mapped, ambiguous: true },
        );
      }
      if (response.status >= 200 && response.status < 300) {
        return (parseJsonBody(response) ?? {}) as SieveRunSnapshot;
      }
      const mapped = toHttpError(response, "POST /api/scrapes");
      if (attempt < maxSafeStartRetries && isSafeToRetryStart(mapped.kind)) {
        await sleep(retryDelayFor(mapped, attempt));
        attempt += 1;
        continue;
      }
      throw mapped;
    }
  }

  async function getRun(sessionId: string): Promise<SieveRunSnapshot> {
    if (!sessionId) throw new SieveError("bad_request", "sessionId is required");
    const response = await sendRead(
      buildPollRequest({ baseUrl, apiKey, sessionId }),
      "GET run",
    );
    const body = parseJsonBody(response);
    if (!body || typeof body !== "object") {
      throw new SieveError("contract", "sieve returned a non-object run body", {
        status: response.status,
      });
    }
    const snapshot = body as SieveRunSnapshot;
    if (typeof snapshot.status !== "string") {
      throw new SieveError("contract", "sieve run body has no status", {
        status: response.status,
      });
    }
    return snapshot;
  }

  async function waitForRun(
    sessionId: string,
    waitOptions?: WaitForRunOptions,
  ): Promise<SieveRunSnapshot> {
    let delay = pollInitialDelayMs;
    const startedAt = now();
    let polls = 0;
    for (;;) {
      if (
        polls > 0 &&
        waitOptions?.maxWaitMs !== undefined &&
        now() - startedAt >= waitOptions.maxWaitMs
      ) {
        throw new SieveError(
          "timeout",
          `run ${sessionId} was still running after ${waitOptions.maxWaitMs}ms`,
        );
      }
      await sleep(delay);
      polls += 1;
      const snapshot = await getRun(sessionId);
      await waitOptions?.onSnapshot?.(snapshot);
      const statusClass = classifyRunStatus(snapshot.status);
      if (statusClass === "unknown") {
        throw new SieveError(
          "unexpected_status",
          `sieve reported an unrecognised run status: ${String(snapshot.status)}`,
          { detail: typeof snapshot.error === "string" ? snapshot.error : null },
        );
      }
      if (statusClass === "refused") return snapshot;
      if (statusClass === "done") {
        const complete = waitOptions?.isComplete;
        if (!complete || complete(snapshot)) return snapshot;
      }
      delay = nextPollDelay(delay, pollMaxDelayMs);
    }
  }

  async function sendMessage(
    sessionId: string,
    input: SieveRunInput,
  ): Promise<SieveRunSnapshot> {
    const request = buildMessagesRequest({ baseUrl, apiKey, sessionId, input });
    let response: Fetched;
    try {
      response = await performFetch(request);
    } catch (error) {
      const mapped = toSieveError(error, "POST messages");
      throw new SieveError(
        mapped.kind,
        `${mapped.message} — the turn may have been created, so this is not retried automatically`,
        { cause: mapped, ambiguous: true },
      );
    }
    if (response.status >= 200 && response.status < 300) {
      return (parseJsonBody(response) ?? {}) as SieveRunSnapshot;
    }
    throw toHttpError(response, "POST messages");
  }

  async function followUp(
    sessionId: string,
    input: SieveRunInput,
    followOptions?: { onSnapshot?: (snapshot: SieveRunSnapshot) => void | Promise<void> },
  ): Promise<SieveRunSnapshot> {
    // Record the turn count BEFORE sending, so a "done" snapshot that still
    // carries the previous answer cannot be mistaken for the new one.
    const before = await getRun(sessionId);
    const baselineTurns = turnCount(before);

    let attempt = 0;
    for (;;) {
      try {
        await sendMessage(sessionId, input);
        break;
      } catch (error) {
        if (
          error instanceof SieveError &&
          error.kind === "turn_in_flight" &&
          attempt < maxTurnInFlightRetries
        ) {
          await sleep(error.retryAfterMs ?? retryDelayFor(error, attempt));
          attempt += 1;
          continue;
        }
        throw error;
      }
    }

    return waitForRun(sessionId, {
      onSnapshot: followOptions?.onSnapshot,
      isComplete: (snapshot) => isFollowUpComplete(snapshot, baselineTurns),
    });
  }

  async function downloadFile(file: Pick<SieveFile, "url">): Promise<Uint8Array> {
    const response = await sendRead(
      buildFileRequest({ baseUrl, apiKey, file }),
      "GET file",
    );
    return response.bytes;
  }

  async function getCredits(): Promise<SieveCredits> {
    const response = await sendRead(
      buildCreditsRequest({ baseUrl, apiKey }),
      "GET credits",
    );
    return (parseJsonBody(response) ?? {}) as SieveCredits;
  }

  async function startRun(
    input: SieveRunInput,
  ): Promise<{ sessionId: string; poll: string }> {
    const body = await postStart(buildRunRequest({ baseUrl, apiKey, input }));
    return parseStartedRun(body);
  }

  return {
    baseUrl,
    startRun,
    getRun,
    waitForRun,
    sendMessage,
    followUp,
    downloadFile,
    getCredits,
  };
}
