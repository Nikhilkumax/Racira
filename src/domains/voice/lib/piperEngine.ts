// Voice engine wrapper: the only module in the domain the UI talks to. It
// presents a plain `generateSpeech(request)` promise and a structured progress
// stream, and hides everything else about how speech is produced — the worker
// boundary, the inference runtime, the model cache.
//
// The actual synthesis happens in `piper.worker.ts`. This module is the client
// half of that pair: it owns the worker's lifetime, tags each request with an
// id so replies cannot cross, and turns the worker's raw failure text into
// copy a visitor can read. Nothing CPU-bound runs here.
//
// Everything runs in the browser. There is no server-side generation path and
// no fallback tiering: the engine loads once, the per-voice model is cached in
// the origin private file system (OPFS) after its first download, and every
// later generation for that voice is served entirely from the visitor's
// device. Generation is therefore unlimited and free by construction — there
// is no meter to enforce, and nothing to bill.
//
// FLAG (Nikhil) — product/monetization, deliberately unresolved here:
// Voice previously carried a 2-free-generations-per-day ad gate (rewarded
// video, AdSense interstitial on no-fill) and was cited across the roadmap as
// the platform-wide reference implementation for Phase 2 metering. Removing it
// is intended — unlimited client-side generation is the Phase 1 principle that
// shipped with this tool — but it also retires the last place AdSense fill was
// being exercised for Voice. Whether the platform needs a new reference
// metering surface, and where fill testing moves to, is a product call. Do not
// reintroduce counting, gating or ad logic here to compensate.

import {
  EMPTY_INPUT_ERROR,
  type IdentifiedRequest,
  type PrefetchOutcome,
  type SpeechFormat,
  type SpeechProgress,
  type VoiceWorkerResponse,
} from "./piperProtocol";

export { FORMAT_MIME, PART_MAX_CHARS } from "./piperProtocol";
export type { PrefetchOutcome, SpeechFormat, SpeechPhase, SpeechProgress } from "./piperProtocol";

/**
 * The only failure text this domain renders for a broken generation.
 *
 * An error message is still copy a visitor reads, so the same rule that keeps
 * engine names out of the marketing sections applies here: what the speech
 * library throws names hosts, packages and runtime internals, none of which
 * belongs on screen. Everything that fails mid-generation collapses to this.
 */
export const GENERIC_GENERATION_ERROR = "Couldn't generate speech — try again";

/**
 * Our own, actionable refusal, raised before the engine is involved — so its
 * message is written for a visitor and is safe to render unchanged.
 */
export class SpeechInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpeechInputError";
  }
}

/**
 * Raised when one part fails, carrying which part for the console.
 *
 * The message is deliberately generic (see GENERIC_GENERATION_ERROR); the real
 * error is preserved on `cause` so console.error still shows the whole story.
 */
export class SpeechPartError extends Error {
  constructor(
    readonly part: number,
    readonly total: number,
    override readonly cause: unknown,
  ) {
    super(GENERIC_GENERATION_ERROR);
    this.name = "SpeechPartError";
  }
}

/**
 * Reduce any thrown value to text that is safe to render.
 *
 * Only our own input errors pass through; every other throw — a failed model
 * fetch, a stalled load, a decode error, a worker that never started — becomes
 * the same generic message, so no engine text can reach the DOM through an
 * unexpected throw site.
 */
export function toUserFacingError(error: unknown): string {
  return error instanceof SpeechInputError ? error.message : GENERIC_GENERATION_ERROR;
}

export interface GenerateSpeechRequest {
  text: string;
  voiceId: string;
  /** Output container. Defaults to "wav", which needs no re-encoding. */
  format?: SpeechFormat;
  onProgress?: (progress: SpeechProgress) => void;
}

export interface GenerateSpeechResult {
  /** One continuous file covering the whole input, in the requested format. */
  blob: Blob;
  durationSec: number;
  /** How many engine calls the input was split into (1 = no chunking). */
  parts: number;
}

// ── Worker client ───────────────────────────────────────────────────────

// One worker for the life of the page, created on first use so a visitor who
// only reads never downloads it. It is deliberately never terminated: the
// loaded model lives in the worker, and tearing it down would make the next
// generation re-read tens of megabytes from local storage.
let worker: Worker | null = null;
let nextRequestId = 1;

interface PendingRequest {
  /** Called for each progress event; absent when the caller wants none. */
  onProgress?: (progress: SpeechProgress) => void;
  /** Called exactly once, with the final response for this request. */
  settle: (response: VoiceWorkerResponse) => void;
}

const pending = new Map<number, PendingRequest>();

function failAllPending(message: string): void {
  const entries = [...pending.values()];
  pending.clear();
  // Rejected through the normal path so callers see the same generic copy they
  // would from any other failure; the raw text goes to the console.
  for (const entry of entries) {
    entry.settle({ type: "failed", id: -1, kind: "other", message });
  }
}

/**
 * Tear the worker down after it failed at the realm level — a bundled chunk
 * that would not load, or an uncaught throw outside any request.
 *
 * Dropping the instance is what makes a retry possible: the next generation
 * builds a fresh worker rather than posting into a dead one.
 */
function abandonWorker(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  worker?.terminate();
  worker = null;
  console.error("[voice] speech worker failed:", error);
  failAllPending(message);
}

function getWorker(): Worker {
  if (worker) return worker;
  if (typeof Worker === "undefined") {
    throw new Error("This browser cannot run the speech engine (no worker support).");
  }

  const created = new Worker(new URL("./piper.worker.ts", import.meta.url));
  created.onmessage = (event: MessageEvent<VoiceWorkerResponse>) => {
    const response = event.data;
    const entry = pending.get(response.id);

    if (response.type === "progress") {
      entry?.onProgress?.(response.progress);
      return;
    }

    if (!entry) return;
    pending.delete(response.id);
    entry.settle(response);
  };
  created.onerror = (event) => abandonWorker(event.error ?? event.message);
  created.onmessageerror = () => abandonWorker(new Error("Malformed worker message."));

  worker = created;
  return created;
}

/**
 * Post a request and hand its responses to `onProgress` / `settle`.
 *
 * Returns whether the request was handed to a live worker: a worker that
 * cannot even be created leaves the caller to settle its own promise, so no
 * request can be left waiting forever.
 */
function dispatch(request: IdentifiedRequest, entry: PendingRequest): boolean {
  let target: Worker;
  try {
    target = getWorker();
  } catch (error) {
    console.error("[voice] speech worker unavailable:", error);
    return false;
  }

  pending.set(request.id, entry);
  target.postMessage(request);
  return true;
}

/** Turn a failed response into the error a caller should see. */
function errorFor(response: VoiceWorkerResponse): unknown {
  if (response.type !== "failed") {
    // A success response the caller did not expect — treated as a failure
    // rather than silently resolving with nothing.
    return new Error(GENERIC_GENERATION_ERROR);
  }

  if (response.kind === "input") return new SpeechInputError(response.message);
  if (response.kind === "part") {
    return new SpeechPartError(response.part ?? 1, response.total ?? 1, new Error(response.message));
  }
  return new Error(response.message);
}

/** Run a request that has a payload of its own (`audio` or `ok`). */
function postRequest<T extends VoiceWorkerResponse["type"]>(
  build: (id: number) => IdentifiedRequest,
  accept: T,
  onProgress?: (progress: SpeechProgress) => void,
): Promise<Extract<VoiceWorkerResponse, { type: T }>> {
  const id = nextRequestId++;
  const message = build(id);

  return new Promise((resolve, reject) => {
    const started = dispatch(message, {
      onProgress,
      settle: (response) => {
        if (response.type === accept) {
          resolve(response as Extract<VoiceWorkerResponse, { type: T }>);
          return;
        }
        reject(errorFor(response));
      },
    });

    if (!started) reject(new Error(GENERIC_GENERATION_ERROR));
  });
}

// ── Generation ──────────────────────────────────────────────────────────

/**
 * Synthesize `request.text` into one continuous audio file.
 *
 * The splitting, the per-part inference and the joining all happen in the
 * worker; what comes back is the finished file as bytes, transferred rather
 * than copied. `onProgress` is the engine's phase stream, relayed unchanged so
 * the UI's status machine keeps working exactly as it did when this ran on the
 * page.
 */
export async function generateSpeech(
  request: GenerateSpeechRequest,
): Promise<GenerateSpeechResult> {
  const trimmed = request.text.trim();
  if (!trimmed) throw new SpeechInputError(EMPTY_INPUT_ERROR);

  const response = await postRequest(
    (id) => ({
      type: "generate",
      id,
      voiceId: request.voiceId,
      text: trimmed,
      format: request.format ?? "wav",
    }),
    "audio",
    request.onProgress,
  );

  return {
    blob: new Blob([response.bytes], { type: response.mime }),
    durationSec: response.durationSec,
    parts: response.parts,
  };
}

// ── Local storage (OPFS) ────────────────────────────────────────────────
// Voice models are the only thing this domain persists. Nothing else about a
// request is stored, and nothing is uploaded. Reading what is cached lives in
// voiceStorage.ts, which does not need the engine loaded to answer.

/**
 * Delete one cached voice, reclaiming its storage.
 *
 * Goes through the worker because the worker is what owns the cache: deleting
 * from a second place would leave a loaded model in memory that the page no
 * longer believes exists.
 */
export async function deleteStoredVoice(voiceId: string): Promise<void> {
  await postRequest((id) => ({ type: "remove-voice", id, voiceId }), "ok");
}

/** Delete every cached voice. */
export async function clearStoredVoices(): Promise<void> {
  await postRequest((id) => ({ type: "flush-voices", id }), "ok");
}

/**
 * Drop the loaded model without deleting it from storage.
 *
 * Fire-and-forget: the next generation rebuilds the session from the cached
 * copy, so there is nothing to report and nothing to wait for. A no-op when no
 * worker has been created yet, since there is then no session to drop.
 */
export function releaseVoiceSession(): void {
  worker?.postMessage({ type: "release" });
}

// ── Idle prefetch ───────────────────────────────────────────────────────
// The featured default voice is what most visitors generate first, so its
// model is fetched in the background while the page sits idle. The point is to
// remove the one slow moment from the first run without adding a spinner, a
// progress bar or an error state — the first generation either finds the model
// already on the device, or downloads it on demand exactly as it does today.
//
// Held back until the browser reports an idle moment (and bounded, so it still
// happens on a page nobody interacts with), because this is worth precisely
// nothing if it competes with the first render.
const PREFETCH_IDLE_TIMEOUT_MS = 3_000;

// Safari has no requestIdleCallback, so it gets a plain delay long enough to
// clear the initial render and the hero images.
const PREFETCH_FALLBACK_DELAY_MS = 2_500;

/** The subset of the Network Information API this module cares about. */
interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

function networkInformation(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

/**
 * Whether the visitor's connection says "don't spend this on something they
 * may never use".
 *
 * A data-saver or a 2G link is exactly the case where a speculative 60 MB
 * download is harmful rather than helpful — the on-demand path still works,
 * it just waits to be asked. An unknown connection (the API is Chromium-only)
 * is treated as a normal one: absence of information is not evidence of a slow
 * link, and every other browser simply prefetches.
 *
 * Checked on the page rather than in the worker because it is a policy about
 * the visitor's connection, decided before any work is handed off.
 */
export function shouldSkipPrefetch(): boolean {
  const connection = networkInformation();
  if (!connection) return false;
  if (connection.saveData === true) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

/**
 * Put `voiceId`'s model in the same cache the page's cache indicator lists —
 * the library's own download path, run in the worker, so there is exactly one
 * cache and one writer.
 *
 * Never rejects: a prefetch that fails, is interrupted, or is skipped costs
 * the visitor nothing but a normal on-demand download later.
 */
export async function prefetchVoiceModel(voiceId: string): Promise<PrefetchOutcome> {
  if (shouldSkipPrefetch()) return "skipped-connection";

  try {
    const response = await postRequest((id) => ({ type: "prefetch", id, voiceId }), "ok");
    return (response.value as PrefetchOutcome) ?? "failed";
  } catch (error) {
    // Console only. Nothing about this belongs on screen.
    console.error("[voice] background voice prefetch failed:", error);
    return "failed";
  }
}

/**
 * Prefetch `voiceId` at the next idle moment.
 *
 * @returns A cleanup that cancels a prefetch which has not started yet (a
 *          download already in flight is left to finish — it is nearly free
 *          to let it land, and aborting would only risk a half-written model).
 */
export function scheduleVoicePrefetch(voiceId: string): () => void {
  if (typeof window === "undefined") return () => {};

  const run = () => {
    // Deliberately not awaited: the contract is fire-and-forget, and the
    // promise never rejects.
    void prefetchVoiceModel(voiceId);
  };

  const idle = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof idle.requestIdleCallback === "function") {
    const handle = idle.requestIdleCallback(run, { timeout: PREFETCH_IDLE_TIMEOUT_MS });
    return () => idle.cancelIdleCallback?.(handle);
  }

  const timer = setTimeout(run, PREFETCH_FALLBACK_DELAY_MS);
  return () => clearTimeout(timer);
}
