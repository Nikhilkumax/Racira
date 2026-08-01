import type { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

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
      console.log("[kokoro] KokoroTTS loaded, from_pretrained:", typeof KokoroTTS?.from_pretrained);
    } catch (importErr: any) {
      console.error("[kokoro] Dynamic import failed:", importErr?.message, importErr?.stack);
      throw importErr;
    }

    try {
      console.log("[kokoro] Attempting model load: device=webgpu, dtype=fp16");
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "fp16",
        device: "webgpu",
        progress_callback: (info: any) => {
          console.log("[kokoro] progress:", JSON.stringify(info));
          onProgress?.(info);
        },
      });
      ttsInstance = tts;
      return tts;
    } catch (webgpuError: any) {
      console.warn("[kokoro] WebGPU failed, falling back to wasm:", webgpuError?.message);
      console.error("[kokoro] WebGPU error details:", {
        message: webgpuError?.message,
        stack: webgpuError?.stack,
        name: webgpuError?.name,
      });
      try {
        console.log("[kokoro] Attempting model load: device=wasm, dtype=fp16");
        const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "fp16",
          device: "wasm",
          progress_callback: (info: any) => {
            console.log("[kokoro] progress:", JSON.stringify(info));
            onProgress?.(info);
          },
        });
        ttsInstance = tts;
        return tts;
      } catch (wasmError: any) {
        console.error("[kokoro] WASM fallback also failed:", {
          message: wasmError?.message,
          stack: wasmError?.stack,
          name: wasmError?.name,
        });
        throw wasmError;
      }
    }
  })();

  return loadingPromise;
}

export function resetKokoroEngine(): void {
  ttsInstance = null;
  loadingPromise = null;
}
