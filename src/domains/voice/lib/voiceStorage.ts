/**
 * Read-only view of the Voice domain's model cache.
 *
 * The cache itself belongs to the speech library, which writes each voice
 * model into the origin private file system (OPFS) under a `piper` directory
 * and names each file after the model URL's basename. This module only looks —
 * every write and every delete goes through the library's own storage API,
 * from the worker, so there is one owner of the cache and no second
 * implementation of it anywhere.
 *
 * Why not read it through the library too: this is what draws the "saved on
 * this device" line when the page loads, and routing it through the worker
 * would mean fetching the whole speech engine, and spawning a worker, purely
 * to render a one-line hint — including on a connection where the idle
 * prefetch deliberately skips downloading anything at all. Enumerating a
 * directory costs nothing and needs no engine.
 *
 * Everything here is best-effort. OPFS is missing in a few configurations
 * (private windows, old browsers) and unreadable in others; in all of them the
 * tool still generates, it simply cannot say what is already cached — so a
 * failure returns an empty list rather than an error.
 */

/** The library's cache directory inside the OPFS root. */
const CACHE_DIRECTORY = "piper";

/** Extension of a voice model file; the file is named `<voiceId>.onnx`. */
const MODEL_EXTENSION = ".onnx";

/**
 * Directory iteration is part of the File System Access spec but is declared in
 * a lib file this project does not include (`dom.asynciterable`), so the one
 * method used here is described locally rather than by widening the project's
 * global types for a single call site.
 */
interface KeyedDirectoryHandle {
  keys(): AsyncIterableIterator<string>;
}

/**
 * Voices already downloaded to this device.
 *
 * Names are reported the way the library reports them: the file name with its
 * extension dropped, which is the voice id the rest of the domain speaks in.
 */
export async function listStoredVoices(): Promise<string[]> {
  const storage = typeof navigator === "undefined" ? undefined : navigator.storage;
  if (!storage || typeof storage.getDirectory !== "function") return [];

  try {
    const root = await storage.getDirectory();
    const directory = await root.getDirectoryHandle(CACHE_DIRECTORY, { create: true });

    const stored: string[] = [];
    for await (const name of (directory as unknown as KeyedDirectoryHandle).keys()) {
      if (!name.endsWith(MODEL_EXTENSION)) continue;
      stored.push(name.slice(0, -MODEL_EXTENSION.length));
    }
    return stored;
  } catch {
    return [];
  }
}
