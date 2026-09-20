/**
 * The Voice domain's speech worker.
 *
 * Why this exists: one engine call is a long, CPU-bound WebAssembly run whose
 * cost is set by the text, and it cannot be yielded through — the browser
 * cannot paint, respond to input or even show a "page not responding" prompt
 * mid-call without the tab looking frozen. Putting the whole pipeline here
 * moves that cost off the page entirely: the main thread sends text and
 * receives progress and finished bytes, and stays interactive throughout.
 * Multi-threaded WebAssembly (which the inference runtime uses when the page
 * is cross-origin isolated — see the /voice headers in next.config.mjs) is a
 * second, independent win: it shortens the call rather than moving it.
 *
 * This worker owns the speech library outright — the session, the model
 * download, the per-voice cache, and every storage mutation. The page never
 * imports the library, so there is exactly one copy of its state and no way
 * for the two realms to disagree about which model is loaded.
 *
 * Local storage is shared with the page (the origin private file system is
 * per-origin, not per-realm), so the cached models written here are the same
 * ones the page's cache indicator lists.
 */

import type { Progress, TtsSession as TtsSessionInstance, VoiceId } from "@mintplex-labs/piper-tts-web";
import { chunkText } from "./textChunker";
import { concatWavSamples, encodeWav } from "./wavUtils";
import {
  EMPTY_INPUT_ERROR,
  FORMAT_MIME,
  PART_MAX_CHARS,
  SEAM_GAP_MS,
  type PrefetchOutcome,
  type SpeechFormat,
  type VoiceWorkerRequest,
  type VoiceWorkerResponse,
} from "./piperProtocol";

type PiperModule = typeof import("@mintplex-labs/piper-tts-web");

// tsconfig ships the DOM lib, not the webworker one, so the worker globals are
// declared here rather than pulled in with a lib reference — which would also
// drag in a second, conflicting set of DOM declarations. This is the only
// window/worker difference the module depends on.
const scope = globalThis as unknown as {
  postMessage: (message: VoiceWorkerResponse, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<VoiceWorkerRequest>) => void) | null;
};

// ── Failure classification ──────────────────────────────────────────────
// Failures are reported with the raw text the underlying call produced; the
// page decides what a visitor reads. The classes below exist so the page can
// tell our own refusals (safe to show) from engine text (never shown) without
// having to parse any of it.

/** Our own refusal, raised before the engine is involved. */
class InputFailure extends Error {}

/** One part of a multi-part run failed; the part is carried for the console. */
class PartFailure extends Error {
  constructor(
    readonly part: number,
    readonly total: number,
    readonly reason: unknown,
  ) {
    super(reason instanceof Error ? reason.message : String(reason));
  }
}

// ── Engine ──────────────────────────────────────────────────────────────
// The library is fetched on first use, so a page that never generates never
// pays for it.

let piperModule: Promise<PiperModule> | null = null;

function loadPiper(): Promise<PiperModule> {
  piperModule ??= import("@mintplex-labs/piper-tts-web");
  return piperModule;
}

// A model that stops making progress is dead, not slow: a 60 MB download keeps
// emitting progress events even on a slow connection. Watched only during the
// load phase — a long part on a slow device is legitimate work, not a hang —
// and re-armed by every progress event. A failed load is retryable: the
// rejected promise is never cached, so the next attempt starts clean.
const MODEL_IDLE_TIMEOUT_MS = 30_000;

// The library keeps one process-wide session and swaps only the voice id on
// reuse, so a session is pinned to the voice it was created for and dropped
// when a different voice is requested. Recreating it is also what re-fetches
// the model config — a stale model would otherwise voice the new selection.
let session: TtsSessionInstance | null = null;
let sessionVoiceId: string | null = null;

// How many generations are running right now. Only the prefetch cares: it is
// the one thing here that spends bandwidth for work nobody asked for.
let generationsInFlight = 0;

// The session is constructed with a progress callback that lives as long as
// the session, while progress belongs to a single request. Reads route through
// this mutable sink so a reused session reports into the current request.
let progressSink: ((progress: Progress) => void) | null = null;

/** Drop the cached session, releasing the loaded model. */
function releaseSession(): void {
  session = null;
  sessionVoiceId = null;
}

function armIdleWatchdog(reason: string): {
  arm: () => void;
  stop: () => void;
  expired: Promise<never>;
} {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let expire: () => void = () => {};
  const expired = new Promise<never>((_, reject) => {
    expire = () =>
      reject(
        new Error(
          `${reason} stalled for ${MODEL_IDLE_TIMEOUT_MS / 1000}s with no progress. ` +
            `Check the network log for a blocked request to the voice model host, then retry.`,
        ),
      );
  });

  const arm = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(expire, MODEL_IDLE_TIMEOUT_MS);
  };
  const stop = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };

  arm();
  return { arm, stop, expired };
}

async function getSession(
  voiceId: string,
  onLoadProgress: (fraction: number) => void,
): Promise<TtsSessionInstance> {
  if (session && sessionVoiceId === voiceId) return session;

  releaseSession();

  const { TtsSession, INFERENCE_PROGRESS_URL } = await loadPiper();

  const watchdog = armIdleWatchdog("Voice model loading");

  // Progress events arrive for two different things, and only one is a
  // download: byte counts from the model host, and the library's own
  // part-splitting counter once inference starts. The latter should never fire
  // (parts stay under the library's cap), but treating it as a download would
  // show a phantom "0%" during synthesis, so it is filtered out.
  //
  // Every byte that does arrive re-arms the watchdog, which is what makes it a
  // test for a *stalled* load rather than a slow one: a 60 MB model on a slow
  // connection keeps reporting progress and must not be timed out for it.
  progressSink = (progress) => {
    if (progress.url === INFERENCE_PROGRESS_URL) return;
    watchdog.arm();
    if (progress.total > 0) onLoadProgress(progress.loaded / progress.total);
  };

  try {
    const created = await Promise.race([
      TtsSession.create({ voiceId: voiceId as VoiceId, progress: (p) => progressSink?.(p) }),
      watchdog.expired,
    ]);
    session = created;
    sessionVoiceId = voiceId;
    return created;
  } finally {
    watchdog.stop();
    progressSink = null;
  }
}

/**
 * Encode mono samples as MP3.
 *
 * The engine only emits WAV, so the compressed option is a client-side
 * re-encode of the same merged samples the WAV path writes. It lives here
 * rather than on the page so the encoder never loads on the main thread — MP3
 * is the default format, and encoding a long clip is exactly the kind of work
 * that must not sit between the page and its next paint.
 */
async function encodeMp3(samples: Float32Array, sampleRate: number): Promise<ArrayBuffer> {
  const lamejs = (await import("lamejs")).default;
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);

  // lamejs takes signed 16-bit input one MPEG frame (1152 samples) at a time.
  const frameSize = 1152;
  const chunks: Uint8Array[] = [];

  // lamejs hands back an Int8Array whose buffer type is only known as
  // ArrayBufferLike. Re-wrapping the same bytes as an unsigned view
  // (two's-complement values map to the identical octets) gives a
  // transferable, exact ArrayBuffer without a cast.
  const asBytes = (encoded: Int8Array) => Uint8Array.from(encoded);

  for (let at = 0; at < samples.length; at += frameSize) {
    const frame = samples.subarray(at, at + frameSize);
    const pcm = new Int16Array(frame.length);
    for (let i = 0; i < frame.length; i++) {
      const value = frame[i];
      pcm[i] = value >= 1 ? 32767 : value <= -1 ? -32768 : (value * 32768) | 0;
    }
    const encoded = encoder.encodeBuffer(pcm);
    if (encoded.length > 0) chunks.push(asBytes(encoded));
  }

  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(asBytes(tail));

  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged.buffer;
}

// ── Requests ────────────────────────────────────────────────────────────

async function runGeneration(request: {
  id: number;
  voiceId: string;
  text: string;
  format: SpeechFormat;
}): Promise<void> {
  const { id, voiceId } = request;
  const trimmed = request.text.trim();
  if (!trimmed) throw new InputFailure(EMPTY_INPUT_ERROR);

  const parts = chunkText(trimmed, PART_MAX_CHARS);
  if (parts.length === 0) throw new InputFailure(EMPTY_INPUT_ERROR);

  generationsInFlight++;
  try {
    await synthesizeParts({ id, voiceId, parts, format: request.format });
  } finally {
    generationsInFlight--;
  }
}

async function synthesizeParts({
  id,
  voiceId,
  parts,
  format,
}: {
  id: number;
  voiceId: string;
  parts: string[];
  format: SpeechFormat;
}): Promise<void> {
  let modelFraction: number | null = null;

  scope.postMessage({
    type: "progress",
    id,
    progress: {
      phase: "loading",
      part: 0,
      totalParts: parts.length,
      fraction: 0,
      modelFraction: null,
    },
  });

  const speechSession = await getSession(voiceId, (fraction) => {
    modelFraction = fraction;
    scope.postMessage({
      type: "progress",
      id,
      progress: {
        phase: "loading",
        part: 0,
        totalParts: parts.length,
        fraction,
        modelFraction: fraction,
      },
    });
  });

  const blobs: Blob[] = [];

  for (let i = 0; i < parts.length; i++) {
    scope.postMessage({
      type: "progress",
      id,
      progress: {
        phase: "synthesizing",
        part: i + 1,
        totalParts: parts.length,
        fraction: parts.length === 1 ? 0 : i / parts.length,
        modelFraction,
      },
    });

    try {
      blobs.push(await speechSession.predict(parts[i]));
    } catch (error) {
      throw new PartFailure(i + 1, parts.length, error);
    }
  }

  scope.postMessage({
    type: "progress",
    id,
    progress: {
      phase: "assembling",
      part: parts.length,
      totalParts: parts.length,
      fraction: 1,
      modelFraction,
    },
  });

  const { samples, sampleRate } = await concatWavSamples(blobs, { gapMs: SEAM_GAP_MS });

  // Duration comes from the merged buffer rather than from re-decoding the
  // finished file: the sample count is already exact, and re-reading a long
  // clip to recover it would be pure waste.
  const durationSec = samples.length / sampleRate;
  const bytes =
    format === "mp3" ? await encodeMp3(samples, sampleRate) : encodeWav(samples, sampleRate);

  // Transferred, not copied: a long clip is handed to the page without a
  // second full-size buffer existing at any point.
  scope.postMessage(
    {
      type: "audio",
      id,
      bytes,
      mime: FORMAT_MIME[format],
      durationSec,
      parts: parts.length,
    },
    [bytes],
  );
}

/**
 * Put `voiceId`'s model in the same cache the page's indicator lists, using the
 * library's own download path — there is exactly one cache, and removing the
 * voice later goes through the library too.
 *
 * Never throws: a prefetch that fails or is interrupted costs the visitor
 * nothing but a normal on-demand download later.
 */
async function prefetchModel(voiceId: string): Promise<PrefetchOutcome> {
  // A generation already under way means the visitor is using the tool, not
  // idling — and if it is generating the featured voice (the common case, since
  // that is the default), a prefetch here would fetch the very model that
  // download is already streaming, splitting the connection between two copies
  // of the same 60 MB file and slowing the run the visitor is waiting on. Their
  // run warms the same cache anyway.
  if (generationsInFlight > 0) return "skipped-busy";

  try {
    const { download, stored } = await loadPiper();
    const cached = (await stored()) as string[];
    if (cached.includes(voiceId)) return "already-stored";

    await download(voiceId as VoiceId);
    return "prefetched";
  } catch (error) {
    console.error("[voice] background voice prefetch failed:", error);
    return "failed";
  }
}

async function removeModel(voiceId: string): Promise<void> {
  const { remove } = await loadPiper();
  await remove(voiceId as VoiceId);
  if (sessionVoiceId === voiceId) releaseSession();
}

async function flushModels(): Promise<void> {
  const { flush } = await loadPiper();
  await flush();
  releaseSession();
}

async function handleRequest(request: VoiceWorkerRequest): Promise<void> {
  switch (request.type) {
    case "generate":
      await runGeneration(request);
      return;
    case "prefetch":
      scope.postMessage({ type: "ok", id: request.id, value: await prefetchModel(request.voiceId) });
      return;
    case "remove-voice":
      await removeModel(request.voiceId);
      scope.postMessage({ type: "ok", id: request.id });
      return;
    case "flush-voices":
      await flushModels();
      scope.postMessage({ type: "ok", id: request.id });
      return;
    case "release":
      releaseSession();
      return;
  }
}

function failureResponse(id: number, error: unknown) {
  if (error instanceof PartFailure) {
    return {
      type: "failed" as const,
      id,
      kind: "part" as const,
      message: error.message,
      part: error.part,
      total: error.total,
    };
  }
  const kind = error instanceof InputFailure ? ("input" as const) : ("other" as const);
  return {
    type: "failed" as const,
    id,
    kind,
    message: error instanceof Error ? error.message : String(error),
  };
}

scope.onmessage = (event: MessageEvent<VoiceWorkerRequest>) => {
  const request = event.data;
  void handleRequest(request).catch((error) => {
    console.error(`[voice] worker request "${request.type}" failed:`, error);
    // "release" is the one request with nothing to answer; everything else
    // carries the id that ties this failure back to its caller.
    if (request.type === "release") return;
    scope.postMessage(failureResponse(request.id, error));
  });
};
