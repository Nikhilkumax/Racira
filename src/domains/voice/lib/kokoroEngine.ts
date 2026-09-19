import type { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// Serve onnxruntime-web's .wasm from our own origin. Without this,
// transformers.js defaults wasmPaths to a jsDelivr URL
// (@huggingface/transformers/src/backends/onnx.js:211), which makes the wasm a
// cross-origin subresource — blocked by the site-wide
// Cross-Origin-Embedder-Policy: require-corp header in next.config.mjs.
// The binaries are placed here by scripts/copy-ort-wasm.cjs, which runs on
// predev/prebuild/postinstall. Trailing slash is required: ORT concatenates
// this prefix with the bare filename.
const ORT_WASM_PATH = "/ort/";

// wasm + q8 is upstream kokoro-js's own primary configuration for this model
// repo (node_modules/kokoro-js/README.md:26-30), and q8 is transformers.js's
// default dtype for the wasm device (src/utils/dtypes.js:50). q8 resolves to
// onnx/model_quantized.onnx via DEFAULT_DTYPE_SUFFIX_MAPPING.
//
// Chosen over webgpu+fp16 deliberately: it removes GPU-adapter variability and
// the fp16-on-WebGPU path, which upstream explicitly advises against —
// "If using 'webgpu', we recommend using dtype='fp32'" (same README lines).
// Slower inference is the accepted trade.
const DEVICE = "wasm" as const;
const DTYPE = "q8" as const;

// Silence budget for getKokoroEngine's from_pretrained call. ORT session
// creation never settles if the pthread worker script fails to load silently
// — the failure appears only as net::ERR_BLOCKED_BY_RESPONSE in the network
// panel — so without a deadline the /voice UI hangs at loading-model forever.
//
// This is deliberately NOT a wall-clock cap on the whole load: a 92MB q8
// model crawling in over a slow connection is alive (transformers.js keeps
// emitting progress events, which rearm the watchdog), while a silently hung
// session emits nothing. What trips the timeout is 30s of true silence,
// which is decisive evidence of a dead load, not a slow one.
const MODEL_LOAD_TIMEOUT_MS = 30_000;

let ttsInstance: KokoroTTS | null = null;
let loadingPromise: Promise<KokoroTTS> | null = null;

export async function getKokoroEngine(
  onProgress?: (info: unknown) => void,
): Promise<KokoroTTS> {
  if (ttsInstance) return ttsInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    console.log("[kokoro] getKokoroEngine: starting dynamic import of kokoro-js");

    let KokoroTTS: any;
    try {
      const mod = await import("kokoro-js");
      KokoroTTS = mod.KokoroTTS;

      // kokoro-js re-exports a setter that proxies to
      // env.backends.onnx.wasm.wasmPaths. Must be set before from_pretrained,
      // since ORT reads it at session-creation time.
      mod.env.wasmPaths = ORT_WASM_PATH;
      console.log("[kokoro] wasmPaths set to:", mod.env.wasmPaths);

      console.log("[kokoro] KokoroTTS loaded, from_pretrained:", typeof KokoroTTS?.from_pretrained);
    } catch (importErr: any) {
      console.error("[kokoro] Dynamic import failed:", importErr?.message, importErr?.stack);
      throw importErr;
    }

    try {
      console.log(`[kokoro] Attempting model load: device=${DEVICE}, dtype=${DTYPE}`);

      // from_pretrained can pend forever without erroring (silent worker
      // failure above), so race it against a watchdog that rejects after
      // MODEL_LOAD_TIMEOUT_MS without a progress event. The rejected race
      // surfaces through the same catch below and the same handleGenerate
      // error path as any other load failure — nothing is swallowed.
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      let rearmWatchdog: () => void = () => {};
      const loadTimeout = new Promise<never>((_, reject) => {
        rearmWatchdog = () => {
          if (watchdog) clearTimeout(watchdog);
          watchdog = setTimeout(
            () =>
              reject(
                new Error(
                  "Speech engine loading stalled for 30s with no progress. The ONNX runtime " +
                    "worker may have failed to load — check the network log for blocked " +
                    "/ort/ or /espeak/ requests, then retry.",
                ),
              ),
            MODEL_LOAD_TIMEOUT_MS,
          );
        };
        rearmWatchdog();
      });

      let tts: KokoroTTS;
      try {
        tts = await Promise.race([
          KokoroTTS.from_pretrained(MODEL_ID, {
            dtype: DTYPE,
            device: DEVICE,
            progress_callback: (info: any) => {
              console.log("[kokoro] progress:", JSON.stringify(info));
              rearmWatchdog();
              onProgress?.(info);
            },
          }),
          loadTimeout,
        ]);
      } finally {
        // The race settled one way or the other; stop the timer so a late
        // fire is a no-op rather than an unhandled rejection.
        if (watchdog) clearTimeout(watchdog);
      }

      // If the watchdog fired, the abandoned from_pretrained is left to
      // settle on its own — kokoro-js exposes no abort, and a retry below
      // starts a fresh attempt, which beats a permanent freeze.
      ttsInstance = tts;
      return tts;
    } catch (loadError: any) {
      // Single backend by design — there is deliberately no second attempt on
      // another device or dtype, so a failure here surfaces rather than being
      // masked by a silent retry.
      console.error(`[kokoro] Model load failed (device=${DEVICE}, dtype=${DTYPE}):`, {
        message: loadError?.message,
        stack: loadError?.stack,
        name: loadError?.name,
      });
      throw loadError;
    }
  })();

  // A rejected load must not be cached, or every later attempt replays the
  // same rejection and the user can never retry. This also makes the 30s
  // watchdog a retryable failure rather than a dead end.
  loadingPromise.catch(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

export function resetKokoroEngine(): void {
  ttsInstance = null;
  loadingPromise = null;
}
