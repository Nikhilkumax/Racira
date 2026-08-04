/**
 * Lazy singleton wrapper around ffmpeg.wasm (@ffmpeg/core-mt).
 *
 * Nothing here is imported at module-evaluation time by the UI: `loadFfmpeg()`
 * dynamically imports @ffmpeg/ffmpeg on first call, so the ~31 MB core is only
 * fetched when a conversion actually needs it. Keeping the singleton in a module
 * (rather than component state) means a second tool page in the same session
 * reuses the already-loaded core.
 *
 * Requires cross-origin isolation for SharedArrayBuffer — next.config.mjs sets
 * COOP/COEP site-wide, so that precondition is already met.
 */

import type { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * Self-hosted from public/ffmpeg/, populated by scripts/copy-ffmpeg-core.cjs on
 * postinstall and again before dev/build. Same-origin, so COEP: require-corp is
 * satisfied without needing a CDN to send permissive CORS headers — require-corp
 * only constrains cross-origin subresources.
 */
const CORE_BASE_URL = "/ffmpeg";

/**
 * @ffmpeg/ffmpeg's own worker, served as a static file rather than left to
 * webpack.
 *
 * This is load-bearing, not a preference. The vendor worker loads the core with
 * `await import(coreURL)` where coreURL is a runtime variable (see
 * node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js). Left to its default, that
 * file gets bundled by webpack — classes.js even spells out that intent — and
 * webpack rewrites the unanalysable `import()` into an empty "lazy context"
 * module over dist/esm/. Every request against it throws
 * `Cannot find module '<coreURL>'`, so the core can never load.
 *
 * Pointing classWorkerURL at a copy webpack never sees keeps that `import()` a
 * native browser dynamic import.
 */
const CLASS_WORKER_URL = `${CORE_BASE_URL}/ffmpeg-worker.js`;

/** Encoder names probed from the loaded core. Parsed from `ffmpeg -encoders`. */
export const PROBED_ENCODERS = [
  "libmp3lame",
  "pcm_s16le",
  "pcm_s24le",
  "pcm_s16be",
  "pcm_s24be",
  "flac",
  "alac",
  "aac",
  "libvorbis",
  "wmav2",
  "libopus",
] as const;

export type ProbedEncoder = (typeof PROBED_ENCODERS)[number];

export type EncoderSupport = Record<string, boolean>;

interface LogEvent {
  type: string;
  message: string;
}

interface ProgressEvent {
  progress: number;
  time: number;
}

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;
let encoderSupport: EncoderSupport | null = null;

/** True once the core is fully loaded and probed — lets the UI skip the banner. */
export function isFfmpegReady(): boolean {
  return instance !== null && encoderSupport !== null;
}

/** Session-cached probe result, or null if the core has never been loaded. */
export function getEncoderSupport(): EncoderSupport | null {
  return encoderSupport;
}

/**
 * Parse `ffmpeg -encoders` output.
 *
 * Each encoder line looks like:
 *   ` A..... libmp3lame           libmp3lame MP3 (MPEG audio layer 3) (codec mp3)`
 * Six flag characters, whitespace, then the encoder name.
 */
function parseEncoderLines(lines: string[]): EncoderSupport {
  const found = new Set<string>();
  const lineRe = /^\s*[VASFXBD.]{6}\s+(\S+)/;

  for (const line of lines) {
    const match = lineRe.exec(line);
    if (match) found.add(match[1]);
  }

  const support: EncoderSupport = {};
  for (const name of PROBED_ENCODERS) {
    support[name] = found.has(name);
  }
  return support;
}

/**
 * Run the encoder probe once per session.
 *
 * `-encoders` is an info command with no input file. Some wasm builds still exit
 * non-zero on info-only invocations, so a throw is swallowed — what matters is
 * the log output captured on the way through, not the exit code.
 */
async function probeEncoders(ff: FFmpeg): Promise<EncoderSupport> {
  const lines: string[] = [];
  const collect = ({ message }: LogEvent) => {
    lines.push(message);
  };

  ff.on("log", collect);
  try {
    await ff.exec(["-hide_banner", "-encoders"]);
  } catch {
    // Intentionally ignored — see doc comment.
  } finally {
    ff.off("log", collect);
  }

  return parseEncoderLines(lines);
}

/**
 * Load the core (once) and probe its encoders (once).
 *
 * Concurrent callers share a single in-flight promise, so two files converting
 * back-to-back can never trigger two downloads.
 */
export async function loadFfmpeg(onProgress?: (ratio: number) => void): Promise<FFmpeg> {
  if (instance && encoderSupport) return instance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [{ FFmpeg: FFmpegCtor }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);

    const ff = new FFmpegCtor();

    // Only the wasm goes through toBlobURL, and only for its progress callback:
    // it is the one file big enough for the ~31 MB banner to be worth showing
    // real bytes for. The two scripts stay plain same-origin URLs so the core's
    // own `import()` and `new Worker()` resolve them natively.
    const wasmURL = await toBlobURL(
      `${CORE_BASE_URL}/ffmpeg-core.wasm`,
      "application/wasm",
      true,
      ({ received, total }) => {
        // total is -1 when the server sends no Content-Length; leave the bar
        // where it is rather than reporting a nonsense ratio.
        if (total > 0) onProgress?.(Math.min(0.9, (received / total) * 0.9));
      },
    );

    try {
      await ff.load({
        coreURL: `${CORE_BASE_URL}/ffmpeg-core.js`,
        wasmURL,
        workerURL: `${CORE_BASE_URL}/ffmpeg-core.worker.js`,
        classWorkerURL: CLASS_WORKER_URL,
      });
      onProgress?.(0.95);

      encoderSupport = await probeEncoders(ff);
      instance = ff;
      onProgress?.(1);
      return ff;
    } catch (err) {
      // Kill the spawned worker so a retry starts from a clean slate instead of
      // leaving an orphan thread behind for every failed attempt.
      try {
        ff.terminate();
      } catch {
        /* no-op */
      }
      throw err;
    } finally {
      // The blob was only a transport for the download; the core has compiled
      // the bytes it needs by now, so holding ~31 MB of it is pure waste.
      URL.revokeObjectURL(wasmURL);
    }
  })();

  try {
    return await loadPromise;
  } catch (err) {
    // Reset so a transient network failure can be retried by the next convert.
    loadPromise = null;
    instance = null;
    encoderSupport = null;
    throw err;
  }
}

export interface FfmpegRunOptions {
  file: File;
  inputName: string;
  outputName: string;
  args: string[];
  /** Retried without these if the first attempt fails (album-art passthrough). */
  optionalArgs?: string[];
  onProgress?: (pct: number) => void;
}

/**
 * Write → exec → read → cleanup for a single file.
 *
 * `optionalArgs` exist because carrying album art across containers is
 * best-effort: if `-map 0 -c:v copy` makes the target format reject the stream,
 * we retry once without it rather than failing the file outright.
 */
export async function runFfmpeg(ff: FFmpeg, opts: FfmpegRunOptions): Promise<Uint8Array> {
  const { fetchFile } = await import("@ffmpeg/util");

  const handleProgress = ({ progress }: ProgressEvent) => {
    const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
    opts.onProgress?.(pct);
  };
  ff.on("progress", handleProgress);

  try {
    await ff.writeFile(opts.inputName, await fetchFile(opts.file));

    const withOptional = opts.optionalArgs?.length
      ? [...opts.args.slice(0, -1), ...opts.optionalArgs, opts.args[opts.args.length - 1]]
      : opts.args;

    try {
      await ff.exec(withOptional);
    } catch (err) {
      if (!opts.optionalArgs?.length) throw err;
      await ff.exec(opts.args);
    }

    const data = await ff.readFile(opts.outputName);
    if (typeof data === "string") {
      throw new Error("ffmpeg returned text instead of binary output");
    }
    return data;
  } finally {
    ff.off("progress", handleProgress);
    // Best-effort cleanup — a missing file on an errored run must not mask the
    // original error.
    try {
      await ff.deleteFile(opts.inputName);
    } catch {
      /* no-op */
    }
    try {
      await ff.deleteFile(opts.outputName);
    } catch {
      /* no-op */
    }
  }
}
