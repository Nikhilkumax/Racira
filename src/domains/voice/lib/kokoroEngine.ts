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
    const { KokoroTTS } = await import("kokoro-js");

    try {
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "webgpu",
        progress_callback: onProgress as any,
      });
      ttsInstance = tts;
      return tts;
    } catch (webgpuError) {
      console.warn("WebGPU unavailable, falling back to wasm", webgpuError);
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: onProgress as any,
      });
      ttsInstance = tts;
      return tts;
    }
  })();

  return loadingPromise;
}

export function resetKokoroEngine(): void {
  ttsInstance = null;
  loadingPromise = null;
}
