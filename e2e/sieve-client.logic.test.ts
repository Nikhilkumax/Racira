/**
 * sieve-client.logic.test.ts — tests for the sieve scrape integration.
 *
 * Runs through the Playwright runner (this repo's TS-capable harness) exactly
 * like scale-bar-tool.logic.test.ts. Only the HTTP boundary is scripted: every
 * assertion below exercises the real modules in
 * src/domains/seo/lib/sieve, with a fake `fetch` (scripted responses) or a
 * real local HTTP server standing in for sieve.
 *
 * The rules being pinned are the ones that cost money or corrupt data:
 *   - POST /api/scrapes is never retried after a timeout or network error.
 *   - session_id is persisted before anything else happens.
 *   - a follow-up is only read when the run is done AND turns has advanced.
 *   - "fail"/unknown schema_conformance is never presented as clean data.
 */

import { test } from "@playwright/test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";

import {
  createSieveClient,
  type SieveClientOptions,
} from "../src/domains/seo/lib/sieve/client.server";
import {
  buildFileRequest,
  buildPollRequest,
  buildRunRequest,
  classifyRunStatus,
  conformanceVerdict,
  isFollowUpComplete,
  joinUrl,
  MAX_OUTPUT_SCHEMA_BYTES,
  nextPollDelay,
  parseStartedRun,
  resolveArtifactUrl,
  serialiseJsonSize,
  serializeRunInput,
  toArrayBuffer,
  turnCount,
} from "../src/domains/seo/lib/sieve/request";
import {
  SieveError,
  errorKindForStatus,
  httpStatusForSieveError,
  isRetryableRead,
  isSafeToRetryStart,
  parseRetryAfterMs,
  readErrorDetail,
  toSieveError,
} from "../src/domains/seo/lib/sieve/errors";
import {
  createMemoryRunStore,
  localStatusForSnapshot,
  refusalReason,
} from "../src/domains/seo/lib/sieve/store";
import {
  pollSieveRunOnce,
  recordFollowUpTurn,
  resumeSieveRuns,
  startSieveRun,
} from "../src/domains/seo/lib/sieve/runs.server";
import {
  pollDeviceTokenOnce,
  requestDeviceCode,
  runDeviceLogin,
  SieveDeviceLoginError,
} from "../src/domains/seo/lib/sieve/device-login";
import { maskSecret, parseEnvValue, upsertEnvVar } from "../src/domains/seo/lib/sieve/env-file";
import { adminGate } from "../src/lib/adminAuth";

import type { SieveRunSnapshot } from "../src/domains/seo/lib/sieve/types";

const BASE = "https://scrape.usesieve.com";
const KEY = "dc_sk_test_key_do_not_use";

// ── scripted HTTP boundary ──────────────────────────────────────────────────

type ScriptedResponse =
  | { kind: "json"; status?: number; body: unknown; headers?: Record<string, string> }
  | { kind: "text"; status?: number; text: string; headers?: Record<string, string> }
  | { kind: "bytes"; status?: number; bytes: Uint8Array; headers?: Record<string, string> }
  | { kind: "hang" }
  | { kind: "reject"; error: Error };

interface RecordedCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: BodyInit | null | undefined;
  bodyText: string;
}

function makeScriptedFetch(steps: ScriptedResponse[]) {
  const calls: RecordedCall[] = [];
  let index = 0;
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, name) => {
      headers[name.toLowerCase()] = value;
    });
    let bodyText = "";
    const body = init?.body;
    if (typeof body === "string") bodyText = body;
    else if (body instanceof FormData) bodyText = "[multipart]";
    calls.push({ url, method: init?.method ?? "GET", headers, body, bodyText });

    const step = steps[index];
    index += 1;
    if (!step) throw new Error(`unexpected fetch call to ${url}`);
    if (step.kind === "hang") {
      return await new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          signal.addEventListener("abort", () =>
            reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
          );
        }
      });
    }
    if (step.kind === "reject") throw step.error;
    const responseHeaders = new Headers(step.headers ?? {});
    if (step.kind === "json") {
      responseHeaders.set("content-type", "application/json");
      return new Response(JSON.stringify(step.body), {
        status: step.status ?? 200,
        headers: responseHeaders,
      });
    }
    if (step.kind === "text") {
      return new Response(step.text, { status: step.status ?? 200, headers: responseHeaders });
    }
    return new Response(toArrayBuffer(step.bytes), {
      status: step.status ?? 200,
      headers: responseHeaders,
    });
  }) as typeof fetch;
  return { fetchImpl, calls };
}

function clientFor(
  fetchImpl: typeof fetch,
  overrides: Partial<SieveClientOptions> = {},
  sleeps: number[] = [],
) {
  return createSieveClient({
    apiKey: KEY,
    baseUrl: BASE,
    fetchImpl,
    sleep: async (ms: number) => {
      sleeps.push(ms);
    },
    requestTimeoutMs: 25,
    // Poll and retry delays keep their real defaults: `sleep` is injected, so
    // the schedule is asserted without ever waiting on it.
    ...overrides,
  });
}

const doneSnapshot = (overrides: Partial<SieveRunSnapshot> = {}): SieveRunSnapshot => ({
  status: "done",
  session_id: "sess_1",
  summary: "1 row",
  files: [{ name: "quotes.csv", size: 12, ext: "csv", url: "/api/scrapes/sess_1/files/quotes.csv" }],
  turns: [{ role: "assistant", content: "done" }],
  ...overrides,
});

// ── request building ────────────────────────────────────────────────────────

test.describe("sieve request building", () => {
  test("POST /api/scrapes: bearer header, absolute URL, JSON body, regular compliance default", () => {
    const request = buildRunRequest({
      baseUrl: BASE,
      apiKey: KEY,
      input: {
        instruction: "Extract the text and author of each quote",
        target_urls: ["https://quotes.toscrape.com/"],
        fields: ["quote", "author"],
      },
    });
    assert.equal(request.method, "POST");
    assert.equal(request.url, `${BASE}/api/scrapes`);
    assert.equal(request.headers.Authorization, `Bearer ${KEY}`);
    assert.equal(request.headers["Content-Type"], "application/json");
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;
    assert.equal(body.instruction, "Extract the text and author of each quote");
    assert.deepEqual(body.target_urls, ["https://quotes.toscrape.com/"]);
    assert.deepEqual(body.fields, ["quote", "author"]);
    // The user has to ask for anything other than "regular".
    assert.equal(body.compliance_mode, "regular");
    assert.ok(!("table_shape" in body), "unset optionals are omitted, not sent as null");
  });

  test("compliance_mode is passed through only when set, and yolo is not silently dropped", () => {
    assert.equal(serializeRunInput({ instruction: "x" }).compliance_mode, "regular");
    assert.equal(
      serializeRunInput({ instruction: "x", compliance_mode: "yolo" }).compliance_mode,
      "yolo",
    );
    assert.equal(
      serializeRunInput({ instruction: "x", compliance_mode: "conservative" }).compliance_mode,
      "conservative",
    );
  });

  test("target_urls must be public http(s) and instruction is required", () => {
    assert.throws(
      () => serializeRunInput({ instruction: "   " }),
      (error: unknown) => error instanceof SieveError && error.kind === "bad_request",
    );
    assert.throws(
      () => serializeRunInput({ instruction: "x", target_urls: ["ftp://example.com"] }),
      (error: unknown) => error instanceof SieveError && error.kind === "bad_request",
    );
    assert.throws(
      () => serializeRunInput({ instruction: "x", target_urls: ["not a url"] }),
      (error: unknown) => error instanceof SieveError && error.kind === "bad_request",
    );
  });

  test("output_schema is capped at 32 KB and must be an object", () => {
    const big = { type: "object", pad: "x".repeat(MAX_OUTPUT_SCHEMA_BYTES) };
    assert.throws(
      () => serializeRunInput({ instruction: "x", output_schema: big }),
      (error: unknown) => error instanceof SieveError && error.kind === "bad_request",
    );
    // Just under the ceiling is accepted, and the measurement is byte-exact.
    const small = { type: "object", properties: { a: { type: "string" } } };
    const size = serialiseJsonSize(small);
    assert.ok(size < MAX_OUTPUT_SCHEMA_BYTES);
    const schema = { type: "object", pad: "x".repeat(MAX_OUTPUT_SCHEMA_BYTES - size - 100) };
    assert.ok(serialiseJsonSize(schema) < MAX_OUTPUT_SCHEMA_BYTES);
    assert.deepEqual(serializeRunInput({ instruction: "x", output_schema: schema }).output_schema, schema);
  });

  test("an attached document switches to multipart with a file field and no manual content-type", () => {
    const request = buildRunRequest({
      baseUrl: BASE,
      apiKey: KEY,
      input: {
        instruction: "Extract the invoice total",
        file: {
          bytes: new Uint8Array([1, 2, 3, 4]),
          filename: "invoice.pdf",
          contentType: "application/pdf",
        },
      },
    });
    assert.ok(request.body instanceof FormData);
    assert.equal(request.headers["Content-Type"], undefined);
    assert.equal((request.body as FormData).get("instruction"), "Extract the invoice total");
    const file = (request.body as FormData).get("file");
    assert.ok(file instanceof Blob);
    assert.equal((file as File).name, "invoice.pdf");
    assert.equal((file as File).type, "application/pdf");
  });

  test("poll, message and credit URLs are built from the base URL", () => {
    assert.equal(joinUrl(`${BASE}/`, "/api/scrapes"), `${BASE}/api/scrapes`);
    assert.equal(buildPollRequest({ baseUrl: BASE, apiKey: KEY, sessionId: "abc" }).url, `${BASE}/api/scrapes/abc`);
    assert.equal(
      buildRunRequest({ baseUrl: BASE, apiKey: KEY, path: "/api/scrapes/abc/messages", input: { instruction: "hi" } }).url,
      `${BASE}/api/scrapes/abc/messages`,
    );
  });

  test("file urls are resolved against the base and never send the key cross-origin", () => {
    assert.equal(
      resolveArtifactUrl(BASE, "/api/scrapes/s1/files/out.csv"),
      `${BASE}/api/scrapes/s1/files/out.csv`,
    );
    assert.equal(resolveArtifactUrl(BASE, "files/out.csv"), `${BASE}/files/out.csv`);
    // Same-origin absolute is fine.
    assert.equal(resolveArtifactUrl(BASE, `${BASE}/api/x.csv`), `${BASE}/api/x.csv`);
    // Cross-origin is refused: the bearer key must not travel to a third party.
    assert.throws(
      () => buildFileRequest({ baseUrl: BASE, apiKey: KEY, file: { url: "https://evil.example/x.csv" } }),
      (error: unknown) => error instanceof SieveError && error.kind === "contract",
    );
  });
});

// ── status handling ─────────────────────────────────────────────────────────

test.describe("sieve status handling", () => {
  test("queued/running are pending, done and refused are terminal, anything else is unknown", () => {
    assert.equal(classifyRunStatus("queued"), "pending");
    assert.equal(classifyRunStatus("running"), "pending");
    assert.equal(classifyRunStatus("done"), "done");
    assert.equal(classifyRunStatus("refused"), "refused");
    assert.equal(classifyRunStatus("cancelled"), "unknown");
    assert.equal(classifyRunStatus(undefined), "unknown");
  });

  test("polling keeps going while running and stops on done", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", body: { status: "queued" } },
      { kind: "json", body: { status: "running" } },
      { kind: "json", body: { status: "running" } },
      { kind: "json", body: doneSnapshot() },
    ]);
    const sleeps: number[] = [];
    const client = clientFor(fetchImpl, {}, sleeps);
    const snapshot = await client.waitForRun("sess_1");
    assert.equal(snapshot.status, "done");
    assert.equal(calls.length, 4);
    // One sleep before each poll: 5s → 7.5s → 11.25s → 16.875s, capped at
    // ~30s. The documented backoff, with no short overall deadline.
    assert.deepEqual(sleeps, [5_000, 7_500, 11_250, 16_875]);
    assert.deepEqual(
      [5_000, 7_500, 11_250].map((ms) => nextPollDelay(ms)),
      [7_500, 11_250, 16_875],
    );
    assert.equal(nextPollDelay(25_000), 30_000);
  });

  test("refused is terminal and carries the refusal code (quota included)", async () => {
    const { fetchImpl } = makeScriptedFetch([
      { kind: "json", body: { status: "refused", refusal: { code: "quota", quota: { limit: 100 } } } },
    ]);
    const client = clientFor(fetchImpl);
    const snapshot = await client.waitForRun("sess_1");
    assert.equal(snapshot.status, "refused");
    assert.equal(snapshot.refusal?.code, "quota");
    assert.match(String(refusalReason(snapshot)), /credit\/quota/);
  });

  test("an unrecognised status is an error, not a success", async () => {
    const { fetchImpl } = makeScriptedFetch([{ kind: "json", body: { status: "paused" } }]);
    const client = clientFor(fetchImpl);
    await assert.rejects(
      () => client.waitForRun("sess_1"),
      (error: unknown) => error instanceof SieveError && error.kind === "unexpected_status",
    );
  });

  test("a poll body without a status is a contract error", async () => {
    const { fetchImpl } = makeScriptedFetch([{ kind: "json", body: { summary: "hi" } }]);
    const client = clientFor(fetchImpl);
    await assert.rejects(
      () => client.getRun("sess_1"),
      (error: unknown) => error instanceof SieveError && error.kind === "contract",
    );
  });

  test("schema_conformance: only 'pass' is clean, 'fail' must never be presented as clean", () => {
    assert.equal(conformanceVerdict({ status: "pass" }).isClean, true);
    assert.equal(conformanceVerdict({ status: "pass" }).mustNotPresentAsClean, false);
    assert.equal(conformanceVerdict({ status: "partial" }).isClean, true);
    assert.equal(conformanceVerdict({ status: "partial" }).mustNotPresentAsClean, false);
    for (const status of ["fail", "not_checkable", "no_artifact", "something_new"]) {
      const verdict = conformanceVerdict({ status });
      assert.equal(verdict.isClean, false, `${status} must not be clean`);
      assert.equal(verdict.mustNotPresentAsClean, true, `${status} must be flagged`);
    }
    assert.equal(conformanceVerdict(null).status, "unknown");
    assert.equal(conformanceVerdict(null).mustNotPresentAsClean, true);
  });

  test("local status mirrors the snapshot so a resume never restarts a live run", () => {
    assert.equal(localStatusForSnapshot({ status: "queued" }), "queued");
    assert.equal(localStatusForSnapshot({ status: "running" }), "running");
    assert.equal(localStatusForSnapshot(doneSnapshot()), "done");
    assert.equal(localStatusForSnapshot({ status: "refused" }), "refused");
    assert.equal(localStatusForSnapshot({ status: "??" }), "error");
  });
});

// ── error mapping ──────────────────────────────────────────────────────────

test.describe("sieve error mapping", () => {
  test("status → kind follows the documented table", () => {
    assert.equal(errorKindForStatus(400), "bad_request");
    assert.equal(errorKindForStatus(401), "unauthorized");
    assert.equal(errorKindForStatus(402), "payment_required");
    assert.equal(errorKindForStatus(404), "not_found");
    assert.equal(errorKindForStatus(409), "turn_in_flight");
    assert.equal(errorKindForStatus(429), "rate_limited");
    assert.equal(errorKindForStatus(500), "server");
    assert.equal(errorKindForStatus(503), "server");
    assert.equal(errorKindForStatus(418), "unexpected_status");
  });

  test("retry policy: 429/5xx on start are safe, a timeout is not", () => {
    assert.equal(isSafeToRetryStart("rate_limited"), true);
    assert.equal(isSafeToRetryStart("server"), true);
    assert.equal(isSafeToRetryStart("timeout"), false);
    assert.equal(isSafeToRetryStart("network"), false);
    assert.equal(isSafeToRetryStart("bad_request"), false);
    assert.equal(isSafeToRetryStart("unauthorized"), false);
    assert.equal(isSafeToRetryStart("payment_required"), false);
    // Reads are always safe to repeat.
    for (const kind of ["rate_limited", "server", "network", "timeout"] as const) {
      assert.equal(isRetryableRead(kind), true, kind);
    }
    assert.equal(isRetryableRead("not_found"), false);
  });

  test("each kind maps to the HTTP status our own routes answer with", () => {
    assert.equal(httpStatusForSieveError("bad_request"), 400);
    assert.equal(httpStatusForSieveError("unauthorized"), 401);
    assert.equal(httpStatusForSieveError("payment_required"), 402);
    assert.equal(httpStatusForSieveError("not_found"), 404);
    assert.equal(httpStatusForSieveError("turn_in_flight"), 409);
    assert.equal(httpStatusForSieveError("rate_limited"), 429);
    assert.equal(httpStatusForSieveError("server"), 502);
    assert.equal(httpStatusForSieveError("timeout"), 504);
    assert.equal(httpStatusForSieveError("network"), 504);
    assert.equal(httpStatusForSieveError("not_configured"), 503);
  });

  test("Retry-After is honoured in both formats", () => {
    assert.equal(parseRetryAfterMs("30", 0), 30_000);
    const date = new Date(10_000).toUTCString();
    assert.equal(parseRetryAfterMs(date, 0), 10_000);
    assert.equal(parseRetryAfterMs("later", 0), null);
    assert.equal(parseRetryAfterMs(null, 0), null);
  });

  test("error details are read from body shapes and truncated", () => {
    assert.equal(readErrorDetail('{"error":"access_denied"}'), "access_denied");
    assert.equal(readErrorDetail('{"message":"nope"}'), "nope");
    assert.equal(readErrorDetail("plain text"), "plain text");
    assert.equal(readErrorDetail(""), null);
    assert.equal(readErrorDetail(null), null);
    assert.equal(readErrorDetail("x".repeat(900))?.length, 500);
  });

  test("AbortError becomes a timeout, anything else a network error", () => {
    const timeout = toSieveError(Object.assign(new Error("stop"), { name: "AbortError" }));
    assert.equal(timeout.kind, "timeout");
    assert.equal(toSieveError(new TypeError("fetch failed")).kind, "network");
    assert.equal(toSieveError(timeout).kind, "timeout");
  });

  test("401/402/404/409/5xx bodies surface as their kinds with Retry-After", async () => {
    const cases: Array<[number, string, Record<string, string>?]> = [
      [400, "bad_request"],
      [401, "unauthorized"],
      [402, "payment_required"],
      [404, "not_found"],
      [409, "turn_in_flight"],
      [429, "rate_limited", { "retry-after": "12" }],
      [500, "server"],
    ];
    const { fetchImpl } = makeScriptedFetch(
      cases.map(([status, kind, headers]) => ({
        kind: "json" as const,
        status,
        body: { error: kind },
        headers,
      })),
    );
    const client = clientFor(fetchImpl, { maxReadRetries: 0 });
    for (const [status, kind, headers] of cases) {
      await assert.rejects(
        () => client.getRun("sess_1"),
        (error: unknown) => {
          assert.ok(error instanceof SieveError, `${status} should be a SieveError`);
          assert.equal(error.kind, kind);
          assert.equal(error.status, status);
          if (headers?.["retry-after"]) assert.equal(error.retryAfterMs, 12_000);
          return true;
        },
      );
    }
  });

  test("5xx and network GETs are retried; a 404 is not", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", status: 500, body: { error: "boom" } },
      { kind: "reject", error: new TypeError("fetch failed") },
      { kind: "json", body: doneSnapshot() },
    ]);
    const sleeps: number[] = [];
    const client = clientFor(fetchImpl, {}, sleeps);
    const snapshot = await client.getRun("sess_1");
    assert.equal(snapshot.status, "done");
    assert.equal(calls.length, 3);
    assert.equal(sleeps.length, 2);

    const notFound = makeScriptedFetch([{ kind: "json", status: 404, body: { error: "nope" } }]);
    const client2 = clientFor(notFound.fetchImpl);
    await assert.rejects(() => client2.getRun("sess_1"));
    assert.equal(notFound.calls.length, 1);
  });
});

// ── never retry POST /api/scrapes on an ambiguous failure ───────────────────

test.describe("start POST is never retried when its outcome is unknown", () => {
  test("a timeout sends exactly one request and reports the run as ambiguous", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([{ kind: "hang" }]);
    const sleeps: number[] = [];
    const client = clientFor(fetchImpl, { maxSafeStartRetries: 5 }, sleeps);
    await assert.rejects(
      () => client.startRun({ instruction: "Extract quotes" }),
      (error: unknown) => {
        assert.ok(error instanceof SieveError);
        assert.equal(error.kind, "timeout");
        assert.equal(error.ambiguous, true, "an unknown outcome must be flagged");
        return true;
      },
    );
    assert.equal(calls.length, 1, "the start POST must be attempted exactly once");
    assert.deepEqual(sleeps, [], "no backoff sleep between retries that must not happen");
  });

  test("a network failure is also single-attempt and ambiguous", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "reject", error: new TypeError("fetch failed") },
    ]);
    const client = clientFor(fetchImpl, { maxSafeStartRetries: 5 });
    await assert.rejects(
      () => client.startRun({ instruction: "Extract quotes" }),
      (error: unknown) =>
        error instanceof SieveError && error.kind === "network" && error.ambiguous === true,
    );
    assert.equal(calls.length, 1);
  });

  test("a 400 is not retried either (fix the request, don't repeat it)", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", status: 400, body: { error: "instruction is required" } },
    ]);
    const client = clientFor(fetchImpl);
    await assert.rejects(
      () => client.startRun({ instruction: "x" }),
      (error: unknown) =>
        error instanceof SieveError && error.kind === "bad_request" && error.ambiguous === false,
    );
    assert.equal(calls.length, 1);
  });

  test("429 and 5xx ARE retried, because no run was created", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", status: 429, body: { error: "slow down" }, headers: { "retry-after": "3" } },
      { kind: "json", status: 503, body: { error: "unavailable" } },
      { kind: "json", status: 202, body: { status: "queued", session_id: "sess_9", poll: "/api/scrapes/sess_9" } },
    ]);
    const sleeps: number[] = [];
    const client = clientFor(fetchImpl, {}, sleeps);
    const started = await client.startRun({ instruction: "Extract quotes" });
    assert.equal(started.sessionId, "sess_9");
    assert.equal(calls.length, 3);
    assert.deepEqual(sleeps, [3_000, 2_000], "Retry-After first, then exponential backoff");
  });

  test("a 202 without a session_id is a contract error, not a silent success", async () => {
    const { fetchImpl } = makeScriptedFetch([{ kind: "json", status: 202, body: { status: "queued" } }]);
    const client = clientFor(fetchImpl);
    await assert.rejects(
      () => client.startRun({ instruction: "x" }),
      (error: unknown) => error instanceof SieveError && error.kind === "contract",
    );
    assert.equal(parseStartedRun({ status: "queued", session_id: "s" }).poll, "/api/scrapes/s");
  });
});

// ── follow-up turn check ────────────────────────────────────────────────────

test.describe("follow-up turns", () => {
  test("isFollowUpComplete needs done AND turn growth", () => {
    assert.equal(isFollowUpComplete({ status: "running", turns: [{}, {}] }, 1), false);
    assert.equal(isFollowUpComplete({ status: "done", turns: [{}] }, 1), false);
    assert.equal(isFollowUpComplete({ status: "done", turns: [{}, {}] }, 1), true);
    assert.equal(isFollowUpComplete({ status: "done" }, 1), false);
    assert.equal(isFollowUpComplete(null, 0), false);
    assert.equal(turnCount({ turns: [{}, {}, {}] }), 3);
    assert.equal(turnCount({}), 0);
    assert.equal(turnCount(null), 0);
  });

  test("followUp records the baseline before sending, then waits for done + growth", async () => {
    const oldAnswer = doneSnapshot({ summary: "old answer", turns: [{}, {}] });
    const newAnswer = doneSnapshot({ summary: "new answer", turns: [{}, {}, {}] });
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", body: oldAnswer }, // baseline GET
      { kind: "json", status: 202, body: { status: "queued" } }, // messages POST
      { kind: "json", body: { status: "running", turns: [{}, {}] } },
      // Still the previous answer: done, but turns have not advanced.
      { kind: "json", body: oldAnswer },
      { kind: "json", body: newAnswer },
    ]);
    const snapshots: string[] = [];
    const client = clientFor(fetchImpl, {});
    const snapshot = await client.followUp(
      "sess_1",
      { instruction: "Also include the tags" },
      { onSnapshot: (s) => void snapshots.push(`${s.status}/${s.summary ?? "none"}`) },
    );
    assert.equal(snapshot.summary, "new answer");
    assert.equal(calls.length, 5);
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[1].method, "POST");
    assert.match(calls[1].url, /\/api\/scrapes\/sess_1\/messages$/);
    // The stale "done with the old turns" snapshot was observed but NOT returned.
    assert.deepEqual(snapshots, ["running/none", "done/old answer", "done/new answer"]);
  });

  test("a 409 is waited out and resent, because that POST may be repeated", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", body: doneSnapshot({ turns: [{}] }) },
      { kind: "json", status: 409, body: { error: "turn in flight" }, headers: { "retry-after": "2" } },
      { kind: "json", status: 202, body: { status: "queued" } },
      { kind: "json", body: doneSnapshot({ turns: [{}, {}] }) },
    ]);
    const sleeps: number[] = [];
    const client = clientFor(fetchImpl, {}, sleeps);
    const snapshot = await client.followUp("sess_1", { instruction: "more" });
    assert.equal(snapshot.status, "done");
    assert.equal(calls.length, 4);
    assert.deepEqual(sleeps, [2_000, 5_000], "Retry-After, then the first poll delay");
  });

  test("recordFollowUpTurn stores the baseline before the message is sent", async () => {
    const store = createMemoryRunStore();
    const record = await store.createStarting({ instruction: "first" });
    await store.attachSession(record.id, "sess_1");
    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", body: doneSnapshot({ turns: [{}, {}, {}] }) },
      { kind: "json", status: 202, body: { status: "queued" } },
    ]);
    const client = clientFor(fetchImpl);
    const result = await recordFollowUpTurn({ client, store }, "sess_1", { instruction: "next" });
    assert.equal(result.baselineTurns, 3);
    assert.equal((await store.getBySessionId("sess_1"))?.baselineTurns, 3);
    assert.equal(calls.length, 2);
  });
});

// ── durability ──────────────────────────────────────────────────────────────

test.describe("durable runs", () => {
  test("the intent row exists before the start POST is sent, and session_id lands immediately after", async () => {
    const store = createMemoryRunStore();
    // What the store holds at POST time is exactly what a crash would leave
    // behind, so this is the state a resume has to be able to trust.
    let storeStateAtPost: string | null = null;
    const scripter = makeScriptedFetch([
      { kind: "json", status: 202, body: { status: "queued", session_id: "sess_42", poll: "/api/scrapes/sess_42" } },
    ]);
    const probingFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const rows = [...(await store.listResumable(10)), ...(await store.listNeedingAttention(10))];
      storeStateAtPost = rows.map((row) => row.status).join(",");
      return scripter.fetchImpl(input, init);
    }) as typeof fetch;
    const client = clientFor(probingFetch);

    const record = await startSieveRun({ client, store }, { instruction: "Extract quotes" });
    assert.equal(storeStateAtPost, "starting", "the row must exist, and be marked starting, at POST time");
    assert.equal(record.sessionId, "sess_42");
    assert.equal(record.status, "queued");
  });

  test("an ambiguous start is recorded as such and never re-POSTed by a resume", async () => {
    const store = createMemoryRunStore();
    const { fetchImpl, calls } = makeScriptedFetch([{ kind: "hang" }]);
    const client = clientFor(fetchImpl, { requestTimeoutMs: 10 });
    await assert.rejects(() => startSieveRun({ client, store }, { instruction: "Extract quotes" }));
    assert.equal(calls.length, 1);

    const attention = await store.listNeedingAttention();
    assert.equal(attention.length, 1);
    assert.equal(attention[0].status, "ambiguous");
    assert.equal(attention[0].sessionId, null);
    assert.ok(attention[0].lastError);

    const summary = await resumeSieveRuns({ client, store });
    assert.equal(summary.polled, 0, "a run with no session_id must not be polled");
    assert.equal(summary.needsAttention.length, 1);
    assert.equal(calls.length, 1, "resume must never resend the start POST");
  });

  test("resume polls only records with a session_id and reports terminal outcomes", async () => {
    const store = createMemoryRunStore();
    const first = await store.createStarting({ instruction: "a" });
    await store.attachSession(first.id, "sess_a");
    const second = await store.createStarting({ instruction: "b" });
    await store.attachSession(second.id, "sess_b");
    const third = await store.createStarting({ instruction: "c" });
    await store.attachSession(third.id, "sess_c");

    const { fetchImpl, calls } = makeScriptedFetch([
      { kind: "json", body: { status: "running" } },
      { kind: "json", body: doneSnapshot({ session_id: "sess_b" }) },
      { kind: "json", body: { status: "refused", refusal: { code: "quota" } } },
    ]);
    const client = clientFor(fetchImpl);
    const summary = await resumeSieveRuns({ client, store });
    assert.equal(summary.polled, 3);
    assert.equal(summary.running, 1);
    assert.equal(summary.done, 1);
    assert.equal(summary.refused, 1);
    assert.equal(calls.length, 3);

    // Terminal records are no longer resumable.
    const resumable = await store.listResumable();
    assert.deepEqual(resumable.map((r) => r.sessionId), ["sess_a"]);
  });

  test("one poll step persists the snapshot and maps it onto the local status", async () => {
    const store = createMemoryRunStore();
    const record = await store.createStarting({ instruction: "a" });
    await store.attachSession(record.id, "sess_a");
    const { fetchImpl } = makeScriptedFetch([{ kind: "json", body: doneSnapshot({ session_id: "sess_a" }) }]);
    const client = clientFor(fetchImpl);
    const { record: updated, snapshot } = await pollSieveRunOnce({ client, store }, "sess_a");
    assert.equal(snapshot.status, "done");
    assert.equal(updated.status, "done");
    assert.equal(updated.snapshot?.files?.length, 1);
  });

  test("polling an unknown session is a not_found, not a new run", async () => {
    const store = createMemoryRunStore();
    const { fetchImpl, calls } = makeScriptedFetch([]);
    const client = clientFor(fetchImpl);
    await assert.rejects(
      () => pollSieveRunOnce({ client, store }, "nope"),
      (error: unknown) => error instanceof SieveError && error.kind === "not_found",
    );
    assert.equal(calls.length, 0, "no HTTP call for a run we have no record of");
  });

  test("stored requests never carry upload bytes", async () => {
    const store = createMemoryRunStore();
    const record = await store.createStarting({
      instruction: "Extract the total",
      file: { bytes: new Uint8Array([1, 2, 3]), filename: "invoice.pdf", contentType: "application/pdf" },
    });
    assert.equal(record.request.file?.bytes.byteLength, 0);
    assert.equal(record.request.file?.filename, "invoice.pdf");
  });
});

// ── the real client over real HTTP against a fake sieve ─────────────────────

interface FakeSieve {
  baseUrl: string;
  requests: { method: string; url: string; authorization: string; contentType: string; body: string }[];
  close: () => Promise<void>;
}

async function startFakeSieve(
  handler: (call: { method: string; url: string; body: string }, hits: number) => {
    status: number;
    body?: string;
    contentType?: string;
    bytes?: Uint8Array;
  },
): Promise<FakeSieve> {
  const requests: FakeSieve["requests"] = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += String(chunk);
    });
    req.on("end", () => {
      requests.push({
        method: req.method ?? "GET",
        url: req.url ?? "",
        authorization: req.headers.authorization ?? "",
        contentType: req.headers["content-type"] ?? "",
        body,
      });
      const reply = handler({ method: req.method ?? "GET", url: req.url ?? "", body }, requests.length);
      res.statusCode = reply.status;
      if (reply.contentType) res.setHeader("content-type", reply.contentType);
      if (reply.bytes) res.end(Buffer.from(toArrayBuffer(reply.bytes)));
      else res.end(reply.body ?? "");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

test.describe("sieve client over real HTTP", () => {
  test("202 → poll to done → download the delivered file, with the bearer header on every call", async () => {
    const csv = Buffer.from("quote,author\nbe yourself,oscar wilde\n");
    const fake = await startFakeSieve((call, hits) => {
      if (call.method === "POST" && call.url === "/api/scrapes") {
        return {
          status: 202,
          contentType: "application/json",
          body: JSON.stringify({ status: "queued", session_id: "sess_live", poll: "/api/scrapes/sess_live" }),
        };
      }
      if (call.url === "/api/scrapes/sess_live") {
        // The first poll sees a running run, the second sees it finished — the
        // caller has to keep going through the first one.
        return {
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            hits < 3
              ? { status: "running" }
              : {
                  status: "done",
                  session_id: "sess_live",
                  summary: "1 row",
                  files: [{ name: "quotes.csv", size: csv.byteLength, ext: "csv", url: "/api/scrapes/sess_live/files/quotes.csv" }],
                },
          ),
        };
      }
      if (call.url === "/api/scrapes/sess_live/files/quotes.csv") {
        return { status: 200, contentType: "text/csv", bytes: new Uint8Array(csv) };
      }
      return { status: 404, body: "{}" };
    });

    const client = createSieveClient({
      apiKey: KEY,
      baseUrl: fake.baseUrl,
      sleep: async () => {},
      requestTimeoutMs: 5_000,
    });
    try {
      const started = await client.startRun({
        instruction: "Extract the text and author of each quote",
        target_urls: ["https://quotes.toscrape.com/"],
      });
      assert.equal(started.sessionId, "sess_live");

      const snapshot = await client.waitForRun(started.sessionId, {
        maxWaitMs: 10_000,
      });
      assert.equal(snapshot.status, "done");
      const file = snapshot.files?.[0];
      assert.ok(file);
      const bytes = await client.downloadFile(file);
      assert.equal(Buffer.from(bytes).toString("utf8"), csv.toString("utf8"));

      // Wire-level assertions: one origin, bearer auth, JSON start body.
      assert.ok(fake.requests.length >= 4, `expected several calls, saw ${fake.requests.length}`);
      for (const request of fake.requests) {
        assert.equal(request.authorization, `Bearer ${KEY}`, `${request.url} carried the key`);
      }
      const start = fake.requests[0];
      assert.equal(start.method, "POST");
      assert.equal(start.contentType, "application/json");
      assert.deepEqual(JSON.parse(start.body), {
        instruction: "Extract the text and author of each quote",
        target_urls: ["https://quotes.toscrape.com/"],
        compliance_mode: "regular",
      });
      const download = fake.requests[fake.requests.length - 1];
      assert.equal(download.url, "/api/scrapes/sess_live/files/quotes.csv");
    } finally {
      await fake.close();
    }
  });

  test("a document upload arrives as multipart with a file field", async () => {
    const fake = await startFakeSieve(() => ({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ status: "queued", session_id: "sess_up", poll: "/api/scrapes/sess_up" }),
    }));
    const client = createSieveClient({
      apiKey: KEY,
      baseUrl: fake.baseUrl,
      sleep: async () => {},
      requestTimeoutMs: 5_000,
    });
    try {
      await client.startRun({
        instruction: "Extract the invoice total",
        file: {
          bytes: new TextEncoder().encode("%PDF-1.4 fake"),
          filename: "invoice.pdf",
          contentType: "application/pdf",
        },
      });
      const request = fake.requests[0];
      assert.match(request.contentType, /^multipart\/form-data; boundary=/);
      assert.match(request.body, /name="file"; filename="invoice.pdf"/);
      assert.match(request.body, /name="instruction"/);
      assert.match(request.body, /Extract the invoice total/);
    } finally {
      await fake.close();
    }
  });

  test("a follow-up over real HTTP waits for the new turn, not the old answer", async () => {
    const turns = [{ role: "user" }, { role: "assistant" }];
    let messageSent = false;
    const polls: string[] = [];
    const fake = await startFakeSieve((call) => {
      if (call.method === "POST" && call.url.endsWith("/messages")) {
        messageSent = true;
        return { status: 202, contentType: "application/json", body: JSON.stringify({ status: "queued" }) };
      }
      if (call.url === "/api/scrapes/sess_f") {
        if (!messageSent) {
          // Baseline read: the run is already done with two turns.
          return {
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ status: "done", summary: "old answer", turns }),
          };
        }
        polls.push("poll");
        // The first post-message poll re-reports "done" with the SAME two
        // turns — reading here would hand back the previous answer. Only the
        // second poll has advanced past the baseline of two.
        const advanced = polls.length > 1 ? [...turns, { role: "assistant" }] : turns;
        return {
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ status: "done", summary: advanced.length > 2 ? "new answer" : "old answer", turns: advanced }),
        };
      }
      return { status: 404, body: "{}" };
    });
    const client = createSieveClient({
      apiKey: KEY,
      baseUrl: fake.baseUrl,
      sleep: async () => {},
      requestTimeoutMs: 5_000,
    });
    try {
      const snapshot = await client.followUp("sess_f", { instruction: "also include tags" });
      assert.equal(snapshot.status, "done");
      assert.equal(snapshot.summary, "new answer", "the stale answer must not be returned");
      assert.equal(polls.length, 2, "the stale done-with-old-turns snapshot was polled again");
    } finally {
      await fake.close();
    }
  });

  test("401 and 402 are reported as such and never retried", async () => {
    const fake = await startFakeSieve(() => ({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({ error: "out of credits" }),
    }));
    const client = createSieveClient({
      apiKey: KEY,
      baseUrl: fake.baseUrl,
      sleep: async () => {},
      requestTimeoutMs: 5_000,
      maxSafeStartRetries: 3,
    });
    try {
      await assert.rejects(
        () => client.startRun({ instruction: "x" }),
        (error: unknown) =>
          error instanceof SieveError && error.kind === "payment_required",
      );
      assert.equal(fake.requests.length, 1);
    } finally {
      await fake.close();
    }
  });
});

// ── device login ────────────────────────────────────────────────────────────

test.describe("sieve device login", () => {
  test("the code request returns the URL and code the user must see", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      {
        kind: "json",
        body: {
          device_code: "dev_1",
          user_code: "WDJB-MJHT",
          verification_uri: `${BASE}/device`,
          verification_uri_complete: `${BASE}/device?code=WDJB-MJHT`,
          expires_in: 600,
          interval: 5,
        },
      },
    ]);
    const code = await requestDeviceCode({ baseUrl: BASE, clientName: "Racira", fetchImpl });
    assert.equal(code.user_code, "WDJB-MJHT");
    assert.equal(code.expires_in, 600);
    assert.equal(code.interval, 5);
    assert.equal(calls[0].url, `${BASE}/api/auth/device/code`);
    assert.deepEqual(JSON.parse(calls[0].bodyText), { client_name: "Racira" });
  });

  test("pending keeps polling, slow_down adds 5s, denied stops, expired restarts once", async () => {
    const pending = await pollDeviceTokenOnce({
      baseUrl: BASE,
      deviceCode: "dev_1",
      fetchImpl: makeScriptedFetch([
        { kind: "json", status: 400, body: { error: "authorization_pending" } },
      ]).fetchImpl,
    });
    assert.equal(pending.state, "pending");

    const slow = await pollDeviceTokenOnce({
      baseUrl: BASE,
      deviceCode: "dev_1",
      fetchImpl: makeScriptedFetch([{ kind: "json", status: 400, body: { error: "slow_down" } }]).fetchImpl,
    });
    assert.equal(slow.state, "slow_down");

    await assert.rejects(
      () =>
        pollDeviceTokenOnce({
          baseUrl: BASE,
          deviceCode: "dev_1",
          fetchImpl: makeScriptedFetch([{ kind: "json", status: 400, body: { error: "access_denied" } }])
            .fetchImpl,
        }),
      (error: unknown) =>
        error instanceof SieveDeviceLoginError && error.code === "access_denied",
    );

    await assert.rejects(
      () =>
        pollDeviceTokenOnce({
          baseUrl: BASE,
          deviceCode: "dev_1",
          fetchImpl: makeScriptedFetch([{ kind: "json", status: 400, body: { error: "expired_token" } }])
            .fetchImpl,
        }),
      (error: unknown) =>
        error instanceof SieveDeviceLoginError && error.code === "expired_token",
    );

    // 5xx is transient: nobody created a key, so keep polling.
    const transient = await pollDeviceTokenOnce({
      baseUrl: BASE,
      deviceCode: "dev_1",
      fetchImpl: makeScriptedFetch([{ kind: "json", status: 503, body: {} }]).fetchImpl,
    });
    assert.equal(transient.state, "transient");

    // Success returns the key exactly once.
    const approved = await pollDeviceTokenOnce({
      baseUrl: BASE,
      deviceCode: "dev_1",
      fetchImpl: makeScriptedFetch([
        { kind: "json", body: { api_key: "dc_sk_abc123", token_type: "Bearer", key_name: "cli" } },
      ]).fetchImpl,
    });
    assert.equal(approved.state, "approved");
    if (approved.state === "approved") {
      assert.equal(approved.api_key, "dc_sk_abc123");
      assert.equal(approved.key_name, "cli");
    }
  });

  test("runDeviceLogin polls at the interval, adds 5s on slow_down, and restarts after expiry", async () => {
    const { fetchImpl, calls } = makeScriptedFetch([
      // 1st attempt: code, pending, slow_down, expired
      { kind: "json", body: { device_code: "d1", user_code: "AAAA-AAAA", verification_uri_complete: "u", expires_in: 600, interval: 5 } },
      { kind: "json", status: 400, body: { error: "authorization_pending" } },
      { kind: "json", status: 400, body: { error: "slow_down" } },
      { kind: "json", status: 400, body: { error: "expired_token" } },
      // 2nd attempt succeeds
      { kind: "json", body: { device_code: "d2", user_code: "BBBB-BBBB", verification_uri_complete: "u2", expires_in: 600, interval: 5 } },
      { kind: "json", body: { api_key: "dc_sk_second", token_type: "Bearer", key_name: "cli" } },
    ]);
    const sleeps: number[] = [];
    const seen: string[] = [];
    const result = await runDeviceLogin({
      baseUrl: BASE,
      clientName: "Racira",
      fetchImpl,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      maxRestarts: 1,
      onDeviceCode: (code) => void seen.push(code.user_code),
    });
    assert.equal(result.apiKey, "dc_sk_second");
    assert.deepEqual(seen, ["AAAA-AAAA", "BBBB-BBBB"], "expiry restarts the flow and shows a new code");
    // 5s (pending), 5s again then slow_down raises the interval to 10s, 10s
    // (expired), 1s restart pause, 5s (approved).
    assert.deepEqual(sleeps, [5_000, 5_000, 10_000, 1_000, 5_000]);
    assert.equal(calls.length, 6);
  });
});

// ── the gate that protects the routes from spending credits anonymously ─────

test.describe("admin gate (shared with /finance/admin)", () => {
  const request = (headers: Record<string, string> = {}, cookie?: string) => ({
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    cookies: { get: (name: string) => (name === "racira_admin" && cookie ? { value: cookie } : undefined) },
  });

  test("fails closed when ADMIN_SECRET is unset, 401 when it is set but not presented", () => {
    assert.equal(adminGate(request(), undefined).status, 403);
    assert.equal(adminGate(request(), undefined).ok, false);
    assert.equal(adminGate(request(), "secret").status, 401);
    assert.equal(adminGate(request({ authorization: "Bearer wrong" }, ), "secret").ok, false);
  });

  test("accepts the bearer token or the cookie, and only a real match", () => {
    assert.equal(adminGate(request({ authorization: "Bearer secret" }), "secret").ok, true);
    assert.equal(adminGate(request({}, "secret"), "secret").ok, true);
    // Neither the raw value nor an empty header is accepted in place of the scheme.
    assert.equal(adminGate(request({ authorization: "secret" }), "secret").ok, false);
    assert.equal(adminGate(request({ authorization: "Bearer " }), "secret").ok, false);
    assert.equal(adminGate(request({}, "not-the-secret"), "secret").ok, false);
  });
});

// ── .env handling ───────────────────────────────────────────────────────────

test.describe("env file handling", () => {
  test("reads existing values, including quoted ones, and ignores lookalikes", () => {
    const content = ["# comment", "SIEVE_API_KEY=dc_sk_one", 'OTHER="quoted"', "MY_SIEVE_API_KEY=nope"].join("\n");
    assert.equal(parseEnvValue(content, "SIEVE_API_KEY"), "dc_sk_one");
    assert.equal(parseEnvValue(content, "OTHER"), "quoted");
    assert.equal(parseEnvValue(content, "MISSING"), null);
  });

  test("replaces in place and appends without disturbing other lines", () => {
    const original = ["A=1", "SIEVE_API_KEY=old", "B=2", ""].join("\n");
    const updated = upsertEnvVar(original, "SIEVE_API_KEY", "dc_sk_new");
    assert.match(updated, /SIEVE_API_KEY=dc_sk_new/);
    assert.ok(!updated.includes("dc_sk_newSIEVE_API_KEY"));
    assert.ok(updated.includes("A=1"));
    assert.ok(updated.includes("B=2"));
    assert.equal(updated.split(/\r?\n/).filter((line) => line.startsWith("SIEVE_API_KEY=")).length, 1);

    const appended = upsertEnvVar("A=1\n", "SIEVE_API_KEY", "dc_sk_new");
    assert.equal(appended, "A=1\nSIEVE_API_KEY=dc_sk_new\n");

    const fromScratch = upsertEnvVar("", "SIEVE_API_KEY", "dc_sk_new");
    assert.equal(fromScratch, "SIEVE_API_KEY=dc_sk_new\n");
  });

  test("a key is never printed in full", () => {
    assert.equal(maskSecret("dc_sk_1234567890abcd"), "dc_sk_…abcd");
    assert.ok(!maskSecret("dc_sk_1234567890abcd").includes("1234567890"));
    assert.equal(maskSecret("abc"), "•••");
  });
});
