/**
 * The contract between the Voice domain's main thread and its speech worker.
 *
 * Inference is a long, CPU-bound WebAssembly call that cannot be interrupted
 * once it starts, so it runs in a worker: the page stays responsive and the
 * only thing that crosses the boundary is a request, a progress stream, and
 * the finished bytes. Everything the two sides agree on lives here so a
 * change to either side is a compile error on the other.
 *
 * Types and compile-time constants only — no runtime imports, so this module
 * is safe to pull into the worker bundle and the page bundle alike.
 */

export type SpeechPhase = "loading" | "synthesizing" | "assembling";

export interface SpeechProgress {
  phase: SpeechPhase;
  /** 1-based part being synthesized; 0 while the voice is loading. */
  part: number;
  /** Parts this request was split into; 0 until chunking has run. */
  totalParts: number;
  /**
   * Completion of the current phase in [0, 1]: model download during "loading"
   * (null when the model came from cache), then part progress, then 1 while
   * the parts are joined.
   */
  fraction: number;
  /** Model download completion in [0, 1], or null when nothing was fetched. */
  modelFraction: number | null;
}

export type SpeechFormat = "wav" | "mp3";

/**
 * How a background prefetch ended. Reported to the page so the outcome can be
 * asserted and logged, and never shown to a visitor.
 */
export type PrefetchOutcome =
  | "prefetched"
  | "already-stored"
  /** The visitor was already generating, so the fetch would compete with it. */
  | "skipped-busy"
  | "skipped-connection"
  | "failed";

/** MIME type per output container. */
export const FORMAT_MIME: Record<SpeechFormat, string> = {
  wav: "audio/wav",
  mp3: "audio/mpeg",
};

/**
 * One engine call per part, in characters.
 *
 * Kept at — never above — the cap the speech library's own splitter applies to
 * a single inference pass (its `MAX_CHUNK_LENGTH`, also 400). The library
 * splits only when a part exceeds that cap, so a part this size is passed
 * through untouched; a larger one is silently cut mid-sentence into
 * library-chosen sub-chunks that are joined with *no* seam silence and emit no
 * progress event. Staying at the cap is therefore what keeps every boundary in
 * the finished audio a boundary this domain chose, each with its own 120 ms
 * seam, and keeps the per-part progress bar matching the work actually done.
 *
 * Do not raise it to get "fewer parts". A larger value does not reduce
 * inference work — the library still splits the same text — it only moves part
 * boundaries out of our sight, so the reported part count undercounts the real
 * engine calls and the seams stop being ours. Fewer reported parts is not the
 * same as fewer engine passes.
 *
 * Shared rather than duplicated: the UI sizes its "generates in N parts"
 * estimate from this number while the worker does the actual splitting, so a
 * second constant would eventually disagree with it.
 */
export const PART_MAX_CHARS = 400;

/** Silence written at each seam, in milliseconds. */
export const SEAM_GAP_MS = 120;

/**
 * Our own refusal for empty input, raised before any engine work.
 *
 * Shared because both sides guard it — the page so the visitor gets the answer
 * without a round trip, the worker as the backstop — and the two must not
 * drift into saying the same thing two different ways.
 */
export const EMPTY_INPUT_ERROR = "Enter some text to generate speech.";

// ── Main thread → worker ────────────────────────────────────────────────
// Every request carries an id and the worker echoes it back, so a reply can
// never be mistaken for the answer to an earlier request.

/** Synthesize `text` as one continuous file and return its bytes. */
export interface GenerateRequest {
  type: "generate";
  id: number;
  voiceId: string;
  text: string;
  format: SpeechFormat;
}

/**
 * Fetch `voiceId`'s model into the local cache, with no UI attached. Sent at
 * idle by the page; the worker answers with which of the four outcomes it hit.
 */
export interface PrefetchRequest {
  type: "prefetch";
  id: number;
  voiceId: string;
}

/** Delete one cached voice. Mutations go through the library's own storage API. */
export interface RemoveVoiceRequest {
  type: "remove-voice";
  id: number;
  voiceId: string;
}

/** Delete every cached voice. */
export interface FlushVoicesRequest {
  type: "flush-voices";
  id: number;
}

/**
 * Stop the generate request with `id` at its next part boundary.
 *
 * A single engine call cannot be interrupted once it has started, so a cancel
 * is cooperative: the worker stops before starting the next part and drops the
 * request. The page does not wait for that to unlock — it settles its own
 * promise at once and stops listening for `id` — so the reply this may or may
 * not produce is ignored either way.
 */
export interface CancelRequest {
  type: "cancel";
  id: number;
}

/**
 * Drop the in-memory model. Fire-and-forget: nothing waits on it, and there is
 * nothing to report — the next generation rebuilds the session from the copy
 * already in local storage.
 */
export interface ReleaseRequest {
  type: "release";
}

export type VoiceWorkerRequest =
  | GenerateRequest
  | PrefetchRequest
  | RemoveVoiceRequest
  | FlushVoicesRequest
  | CancelRequest
  | ReleaseRequest;

/**
 * Every request except `release` — the ones that carry an id. The client
 * resolves only these; `release` has nothing to address, and `cancel` names
 * another request's id rather than its own reply.
 */
export type IdentifiedRequest = Exclude<VoiceWorkerRequest, ReleaseRequest>;

// ── Worker → main thread ────────────────────────────────────────────────

/** Progress for one in-flight generate request. */
export interface ProgressResponse {
  type: "progress";
  id: number;
  progress: SpeechProgress;
}

/**
 * The finished file. `bytes` is transferred, not cloned, so a long clip is
 * handed over without a second copy of it ever existing.
 */
export interface AudioResponse {
  type: "audio";
  id: number;
  bytes: ArrayBuffer;
  mime: string;
  durationSec: number;
  parts: number;
}

/** A completed request with no payload of its own. */
export interface OkResponse {
  type: "ok";
  id: number;
  /** Present for prefetch: which outcome occurred. */
  value?: string;
}

/**
 * A failed request.
 *
 * `message` is the raw text the failure produced, kept for the console only —
 * it can name the library, a model host or a runtime internal, none of which
 * belongs on screen. The main thread is what decides the copy a visitor sees
 * (see `toUserFacingError`); the worker's job is to say what happened and let
 * the page decide how to say it.
 */
export interface FailedResponse {
  type: "failed";
  id: number;
  /**
   * "cancelled" is raised by the worker after a CancelRequest; it exists so the
   * page can tell a deliberate stop (nothing to report) from a real failure
   * without parsing any text.
   */
  kind: "input" | "part" | "other" | "cancelled";
  message: string;
  /** Set for kind "part": which part failed, and out of how many. */
  part?: number;
  total?: number;
}

export type VoiceWorkerResponse =
  | ProgressResponse
  | AudioResponse
  | OkResponse
  | FailedResponse;
