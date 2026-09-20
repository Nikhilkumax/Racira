/**
 * Capability check for /voice.
 *
 * Replaces the previous GPU-tier gate. Speech is synthesized in WebAssembly on
 * the page, so there is no GPU requirement and no "advanced engine" tier to
 * detect: any browser that can run WebAssembly and keep the voice models in
 * local storage can run generation. That is essentially every modern browser,
 * which is why the gate is now two checks and no hardware probing.
 */

export type SupportResult =
  | { supported: true }
  | { supported: false; reason: "no-wasm" | "no-storage" };

export async function checkVoiceSupport(): Promise<SupportResult> {
  if (typeof WebAssembly === "undefined") {
    return { supported: false, reason: "no-wasm" };
  }

  // Origin private file system. Generation still works without it, but every
  // run would re-download the voice and nothing would be available offline, so
  // the tool is not offered rather than offered with a hidden cost per run.
  const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
  if (!storage || typeof storage.getDirectory !== "function") {
    return { supported: false, reason: "no-storage" };
  }

  return { supported: true };
}
