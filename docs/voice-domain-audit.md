# Racira Voice / TTS Domain — Current-State Audit

> **Partly superseded.** Written before the voice-selector restructure. The picker is no
> longer the four Radix selects described below: the Gender select is gone, and Language /
> Voice / Format plus Generate now sit in that order. Voice labels are built in
> `src/domains/voice/lib/voicePresentation.ts` from the catalog fields (gender, quality tier,
> recommended mark). The tier words are now **Best** (`high`), **Good** (`medium`) and **Basic**
> (`low` and `x_low`), so the `qualityLabel` strings quoted below — including every Label column in
> the per-voice table — are the pre-restructure snapshot; the catalog carries `gender` / `speed` /
> `secondsPer1000Chars` with no `qualityLabel` and no model size, and generation reports progress
> and can be cancelled.
> Everything else here — the engine, the worker, storage, prefetch, the chunker — still
> describes the code as it stands.

Read-only audit of the voice/TTS domain in `racira-nextjs`, taken from the working
tree on branch `main` (no uncommitted changes under `src/domains/voice`, `src/app/voice`,
`next.config.mjs`, `package.json` or `patches/` — `git status --short` was empty for all of them).

Every claim below cites a file path. Where something could not be established from the
repo, it is marked **unclear — need to verify**.

---

## 0. Headline: the premise does not match the code

Several things the audit brief expected do not exist anywhere in this repository. They are
listed up front so nothing below reads as an omission:

| Expected | Reality |
| --- | --- |
| `DeviceGate` component | Does not exist. The gate is `VoiceSupportGate` + `lib/browserSupport.ts`; `browserSupport.ts` says it "Replaces the previous GPU-tier gate". |
| `TTS_STUDIO_ENABLED` feature flag | The string does not appear anywhere in the repo. |
| Oracle Cloud / Hetzner / RunPod tiers | No occurrence of any of those names in any source, config, script or workflow. |
| R2 audio cache | Not implemented — no R2/S3/MinIO reference anywhere. (The only `cloudflare` string in the repo is the `cdnjs.cloudflare.com` CDN the ONNX runtime wasm comes from.) |
| Queueing system for a GPU tier | None exists. |
| espeak-ng `patch-package` patch | `patches/` contains exactly one file: `patches/lamejs+1.2.1.patch`. There is no espeak patch and no `patch-package` patch for the speech library. |
| ~26 voices | **119 voices across 37 languages**, generated from the installed library's `VoiceId` union. |
| Any server-side generation path | None. All synthesis is client-side WebAssembly in a Web Worker. |

Verification method: `grep -rniE "runpod|hetzner|oracle|cloudflare|r2 bucket|workers ai|queue"`
over all non-generated files returned only unrelated calculator names (`Calculator_Database_Final.json`)
and the engine-asset regex in `e2e/voice-prefetch.test.ts:23`.

---

## 1. Engine & model

### Engine actually wired up and live

- **`@mintplex-labs/piper-tts-web`, pinned to exactly `1.0.5`** — `package.json`
  (`"@mintplex-labs/piper-tts-web": "1.0.5"`, no caret). The library describes itself as a
  "Fork of @diffusionstudio/vits-web for easier built-in PiperTTS use"
  (`node_modules/@mintplex-labs/piper-tts-web/package.json`).
- It is Piper (VITS) running as ONNX. Models are Piper voices, ids of the form
  `{lang}_{REGION}-{speaker}-{quality}` (e.g. `en_US-ryan-high` —
  `src/domains/voice/lib/voiceCatalog.ts:16`; the generator enforces that shape with an
  "Unrecognised voice id shape" check in `scripts/generate-voice-catalog.mjs`).
- It is the *only* engine. `src/domains/voice/lib/piperEngine.ts:11-16` states "There is no
  server-side generation path and no fallback tiering". No Kokoro code remains in `src/`
  (the only `kokoro` hits in the tree are historical build logs under `.freebuff/build-b*.log`,
  which still list `src/domains/voice/lib/kokoroEngine.ts` and `KokoroGenerator.tsx` — files
  that no longer exist; git log `cd985108 TTS Migrated from Kokoro to Piper`).
- The runtime is `onnxruntime-web`: `^1.18.0` in `package.json`, and a peer dependency of the
  library (`node_modules/@mintplex-labs/piper-tts-web/package.json` → `peerDependencies`).
  Both `onnxruntime-web` and `@mintplex-labs/piper-tts-web` are listed in
  `transpilePackages` (`next.config.mjs`).

### Inference settings in use

Read from the library's implementation (the app itself passes no engine options):

- **Device / execution provider: WASM only.** `ort.InferenceSession.create(await modelBlob.arrayBuffer(), { executionProviders: ["wasm"] })`
  — `node_modules/@mintplex-labs/piper-tts-web/dist/piper-tts-web.js:307-310`.
  There is no WebGPU path: `grep -riE "webgpu|executionProviders|gpu"` over
  `src/domains/voice` and `src/app/voice` matches only two prose comments in
  `src/domains/voice/lib/browserSupport.ts:4-5` (which explicitly say there is no GPU requirement).
- **Threads:** the library sets `ort.env.wasm.numThreads = navigator.hardwareConcurrency`
  (`piper-tts-web.js:296`) and `ort.env.wasm.wasmPaths` from its own `DEFAULT_WASM_PATHS`
  (`piper-tts-web.js:297`, `236-240`). Multi-threaded WASM needs cross-origin isolation, which
  is why `/voice` gets COOP/COEP `credentialless` in `next.config.mjs`
  (`{ source: '/voice', headers: [Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Embedder-Policy: credentialless] }`).
  The comment there notes the honest check is that the runtime spawns N-1 thread workers, and
  warns *not* to test it via `ort.env.wasm.numThreads`.
- **dtype / quantization:** nothing is selected in this repo. The only "quantization-like"
  knob is the model tier (`x_low` / `low` / `medium` / `high`), i.e. a different published
  model per voice, not an app-side dtype. As written, the tier *labels* (`"Very light"`, `"Light"`,
  `"Standard"`, `"High fidelity"`) came from `QUALITY_LABELS` in
  `scripts/generate-voice-catalog.mjs` and were baked into each catalog entry as `qualityLabel`
  (`src/domains/voice/lib/voiceCatalog.ts:27-29`); nothing in the app configures dtype. Both that
  mapping and the `qualityLabel` field are gone: the catalog carries the tier key alone, and the
  picker's three words — `Best` / `Good` / `Basic` — live in
  `src/domains/voice/lib/voicePresentation.ts`.
- **Per-voice inference parameters come from each model's own `.onnx.json`,** which the library
  parses at session creation (`piper-tts-web.js:301-302`) and feeds to inference
  (`piper-tts-web.js:388-391`: `speakerId = 0`, `noise_scale`, `length_scale`, `noise_w` from
  `modelConfig.inference`). The app never overrides them. No app-side rate/pitch/volume control
  is wired to the engine (see §8 — `lib/tonePresets.ts` is dead code).

  Live values for the default voice `en_US-ryan-medium`, fetched from its published config
  (`https://huggingface.co/diffusionstudio/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json`):

  ```json
  { "audio": { "sample_rate": 22050, "quality": "medium" },
    "espeak": { "voice": "en-us" },
    "inference": { "noise_scale": 0.667, "length_scale": 1, "noise_w": 0.8 },
    "phoneme_type": "espeak", "num_symbols": 256, "num_speakers": 1, "piper_version": "1.0.0" }
  ```

  Per-voice values for the other 118 voices are **unclear — need to verify** individually;
  they are fetched at runtime and are not vendored into the repo.

### Where model files are loaded from, and client-side caching

- **Model source: Hugging Face**, hardcoded in the library:
  `HF_BASE = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main"`
  (`node_modules/@mintplex-labs/piper-tts-web/dist/fixtures.d.ts:6`, `piper-tts-web.js:13`),
  with the per-voice path from `PATH_MAP` (`piper-tts-web.js:16-…`; e.g.
  `"en_US-ryan-medium": "en/en_US/ryan/medium/en_US-ryan-medium.onnx"`). Two files are fetched
  per voice: the `.onnx` and the `.onnx.json` (`piper-tts-web.js:467`).
- Real size of the default voice model, from the HF tree API for that directory:
  `en_US-ryan-medium.onnx` = **63,201,294 bytes** (~63 MB), config 4,883 bytes. This corroborates
  the "~60 MB" figures in comments (`src/domains/voice/lib/piperEngine.ts:336`,
  `e2e/voice-generator.test.ts`).
- **Supporting WASM is fetched from public CDNs, not bundled** (library defaults, never
  overridden — the app passes no `wasmPaths`):
  - `WASM_BASE = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize"`
    (`fixtures.d.ts:14`) → `piper_phonemize.wasm` + `piper_phonemize.data`
    (`piper-tts-web.js:236-240`).
  - `ONNX_BASE = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/"`
    (`fixtures.d.ts:10`) → the onnxruntime WASM binaries.
  - These three hosts are exactly the ones the e2e suite treats as "engine traffic"
    (`e2e/voice-prefetch.test.ts:23`).
- **Client-side cache: OPFS** (origin private file system), directory `piper`, written by the
  library only:
  - `getBlob` → `navigator.storage.getDirectory()` → `getDirectoryHandle("piper", { create: true })`,
    file name = last segment of the model URL (`piper-tts-web.js:144-157`), i.e. `<voiceId>.onnx`
    and `<voiceId>.onnx.json`.
  - `writeBlob` / `removeBlob` / `stored()` / `flush()` — `piper-tts-web.js:159-177`, `477-497`.
  - The app's read-only mirror for the "Saved on this device" line is
    `src/domains/voice/lib/voiceStorage.ts` (`CACHE_DIRECTORY = "piper"`,
    `MODEL_EXTENSION = ".onnx"`, `listStoredVoices()`), which deliberately does *not* load the
    engine just to list a directory (`voiceStorage.ts:1-22`; constants at `:25-28`; `listStoredVoices` at `:46`).
- **No Cache API, no IndexedDB, no service worker, no Web Storage** is used by this domain:
  `grep` for `caches.open|indexedDB` in `src/domains/voice` returns nothing.

---

## 2. Client architecture

### File/folder map (all 23 files under `src/domains/voice`, plus routes and scripts)

Routes (`src/app/voice/`):

| File | What it is |
| --- | --- |
| `layout.tsx` | Route layout: `theme-voice` wrapper, shared `Header` (`mode="category"`), `Footer`. |
| `page.tsx` | The live page at `/voice`: `TTSHero` → `#studio` (`VoiceSupportGate` → `SpeechStudio`) → features/why/FAQ/SEO sections. Builds `DESCRIPTION` from `VOICE_COUNT`/`LANGUAGE_COUNT`. |
| `[slug]/page.tsx` | Polymorphic category/tool route driven by `CATEGORIES` from `../registry`. Added `generateStaticParams`, breadcrumbs, a `ComingSoon` view, and `robots: { index:false }` via `isComingSoonToolPage` for non-live tools. **Currently unreachable with real content — the registry's `CATEGORIES` is `[]` (see §8).** |

Domain code (`src/domains/voice/`):

| File | One-line description |
| --- | --- |
| `registry.ts` | Category/tool registry for the domain. `CATEGORIES: VoiceCategory[] = []`, `TOTAL_TOOLS = 0`; `SEARCH_REGISTRY` derives from it (so it is empty). |
| `site.ts` | Single source of truth for user/SEO-facing brand strings: `VOICE_SITE` (title, `copyrightName: "Racira TTS"`). |
| `components/VoiceSupportGate.tsx` | Client gate: shows the studio when `checkVoiceSupport()` passes, else a "Browser Not Supported" notice; renders a 600px skeleton while checking. |
| `components/tts/SpeechStudio.tsx` (642 lines) | The whole live UI: language/gender/voice/format pickers, text area, char counter + limit warning, chunk estimate, progress states, `<audio>` player, download link, OPFS cache indicator (remove one / clear all). |
| `components/tts/TextPanel.tsx` | Text panel with clear button. **Not imported anywhere** (dead — the studio inlines its own textarea). |
| `components/tts/GenerateButton.tsx` | Generate/Update/Loading button. **Not imported anywhere** (dead — the studio inlines its own buttons). |
| `components/tts/TonePresets.tsx` | Pill row of 8 tone presets. **Not imported anywhere** (dead). |
| `components/tts/TTSLogo.tsx` | "Racira TTS" wordmark. **Not imported anywhere** (dead). |
| `components/tts-sections/TTSHero.tsx` | `<h1>` hero only. |
| `components/tts-sections/TTSFeatures.tsx` | 8-card feature grid; titles read `VOICE_COUNT`/`LANGUAGE_COUNT`. |
| `components/tts-sections/TTSWhyRacira.tsx` | Pros/cons comparison + 4 stat tiles (`∞` generations, `0` API cost), counts from the catalog. |
| `components/tts-sections/TTSFAQ.tsx` | Accordion FAQ + `FAQPage` JSON-LD; counts from the catalog. |
| `components/tts-sections/TTSSeoContent.tsx` | Long-form SEO article; counts from the catalog. |
| `lib/piperEngine.ts` (401) | Main-thread client of the worker: one worker per page, request ids, `generateSpeech`, `deleteStoredVoice`, `clearStoredVoices`, `releaseVoiceSession`, error→visitor-copy mapping, `scheduleVoicePrefetch`/`shouldSkipPrefetch`. |
| `lib/piper.worker.ts` (572) | The worker. Owns the library import, the `TtsSession` singleton, model download, chunking, per-part inference, WAV concat, MP3 encode, and every OPFS mutation. |
| `lib/piperProtocol.ts` (188) | Types + compile-time constants shared by both realms (`SpeechProgress`, `VoiceWorkerRequest/Response`, `FORMAT_MIME`, `PART_MAX_CHARS = 400`, `SEAM_GAP_MS = 120`, `EMPTY_INPUT_ERROR`). |
| `lib/textChunker.ts` (232) | Pure sentence-aware chunker (see §6). |
| `lib/wavUtils.ts` (267) | RIFF/WAVE parse (PCM 8/16/24/32 + float32, multi-channel averaged to mono), canonical 16-bit mono encode, and `concatWavSamples` with seam gaps. |
| `lib/voiceCatalog.ts` (242) | **AUTO-GENERATED** catalog: `VOICE_CATALOG` (119 entries), `VOICE_LANGUAGES` (37), `FEATURED_VOICE_IDS` (11), `VOICE_COUNT`, `LANGUAGE_COUNT`, `DEFAULT_VOICE_ID`, `voicesForLanguage`, `findVoice`, `isFeaturedVoice`. |
| `lib/voiceNames.ts` (153) | Curated human names + gender per `lang|speaker` key, typed as `Record<\`${CountryCode}|${string}\`, VoiceNameEntry>`. |
| `lib/voiceStorage.ts` (63) | Read-only OPFS listing (`listStoredVoices`) for the cache indicator. |
| `lib/browserSupport.ts` (29) | `checkVoiceSupport()` → `{supported:true}` | `{supported:false, reason:"no-wasm"|"no-storage"}`. |
| `lib/tonePresets.ts` (66) | `TONE_PRESETS` (rate/pitch/volume) + `getPreset` + `parseCustomTone`. **Not imported anywhere** (dead), and the presets are not passed to the engine at all. |

Supporting scripts and tests outside the domain:

| File | What it is |
| --- | --- |
| `scripts/generate-voice-catalog.mjs` | Regenerates `voiceCatalog.ts` from `node_modules/@mintplex-labs/piper-tts-web/dist/types.d.ts` (`VoiceId` + `CountryCode` unions) and parses `voiceNames.ts` structurally. Hard-fails on any gap. `npm run gen:voices`. |
| `scripts/verify_voice.mjs` | Stale HTTP check: expects `href="/voice/tools/…"` links on `/voice` and a `/voice/tools/text-to-speech-generator` page. Neither exists today (see §8). |
| `scripts/tts-probe.mjs` | Playwright diagnostic that logs engine requests/console/PCM stats. Still launches Chromium with WebGPU flags and a `\.bin|onnx|wasm` asset regex (Kokoro-era leftovers); run with a dev server up. |
| `e2e/voice-generator.test.ts` | Playwright: studio renders; defaults are English (US)/Male/Ryan/WAV; single-gender fallback (Georgian → Natia); WAV generate+download asserts `RIFF`/`WAVE`; MP3 asserts MPEG frame sync; long input asserts the chunk estimate + stepped bar + one file. |
| `e2e/voice-switch.test.ts` | Regression for the stale-audio bug: patches `Worker.prototype.postMessage` to record `{voiceId,text}`, asserts the two sends are `en_US-ryan-medium` then `en_US-amy-medium`, that Amy's `.onnx` is fetched, and that the cache indicator flips. |
| `e2e/voice-prefetch.test.ts` | Asserts (a) a failed generation renders exactly `"Couldn't generate speech — try again"` with no host/package/runtime text and does log to console, (b) no engine request on `saveData`/2g, (c) the featured default voice *is* prefetched on a normal connection (aborted on sight). |

### Web Worker setup: what runs where

- **In the worker (`lib/piper.worker.ts`):** dynamic `import("@mintplex-labs/piper-tts-web")`;
  session creation and the library's process-wide `_instance` juggling
  (`clearSession()` at `:148`, `releaseSession()` at `:162`, `sessionGeneration` at `:120`); the model download
  and its 30 s idle watchdog (`MODEL_IDLE_TIMEOUT_MS`, lines 96-104); `chunkText`; the
  per-part `predict()` loop; `concatWavSamples`; `encodeWav`; the lamejs MP3 encode
  (dynamic `import("lamejs")`, `Mp3Encoder(1, sampleRate, 128)`, lines 311-350); prefetch
  (`download`/`stored`); `remove`/`flush` of cached voices. All OPFS writes/deletes happen here.
- **On the main thread (`lib/piperEngine.ts`):** worker lifetime, request-id correlation,
  progress relaying, failure→copy mapping, blob/object-URL creation (in `SpeechStudio`),
  idle-prefetch scheduling, and the OPFS *read* for the cache indicator.
- Explicit design rule: "This worker owns the speech library outright … The page never imports
  the library, so there is exactly one copy of its state" (`piper.worker.ts:14-19`), and the
  MP3 encoder "never loads on the main thread" (`piper.worker.ts:296-311`).
- Transfer of the finished bytes: `scope.postMessage({... bytes}, [bytes])` — transferred, not
  copied (`piper.worker.ts:452-467`).
- Worker is never terminated by design; only a realm-level failure replaces it
  (`piperEngine.ts:104-152`).

### DeviceGate

**There is no `DeviceGate` in this repo.** The equivalent is `VoiceSupportGate`
(`src/domains/voice/components/VoiceSupportGate.tsx`) calling `checkVoiceSupport`
(`src/domains/voice/lib/browserSupport.ts`). The real logic, verbatim:

```ts
// src/domains/voice/lib/browserSupport.ts
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
```

The decision made from it (`VoiceSupportGate.tsx`): while the promise is pending it renders a
pulsing 600px placeholder ("Checking your browser...") so the page does not jump; on
`{supported:false}` it renders `<UnsupportedNotice reason={...} />` with one of two
visitor-facing messages (no WebAssembly; no site storage) and a "What works" list; otherwise it
renders the studio. There is no hardware probing, no GPU check and no browser-version matrix
(`browserSupport.ts:1-8`, `VoiceSupportGate.tsx:9-14`).

### Client-side caching

- **What:** voice models only — `<voiceId>.onnx` plus `<voiceId>.onnx.json` in OPFS under
  `piper/` (library writer; see §1 for the exact call sites; app-side reader
  `voiceStorage.ts`).
- **Cache key:** the voice id, because the library names each file after the model URL's
  basename (`piper-tts-web.js:144-157`, `voiceStorage.ts:25-28`). Effectively
  `piper/<voiceId>.onnx[.json]` — one entry per voice, no request/params dimension, since
  generation is not parameterized.
- **Eviction / expiry:** **none automatically.** No TTL, no LRU, no size cap:
  - the only removals are user-driven — `deleteStoredVoice(voiceId)` / `clearStoredVoices()`
    from the studio's "Remove" and "Clear all saved voices (n)" controls
    (`SpeechStudio.tsx:221-229`, `:417-456`; `piperEngine.ts:285-293`), which delegate to the
    library's `remove`/`flush` (`piper.worker.ts:501-513`; `piper-tts-web.js:472-497`).
  - `flush()` does `dir.remove({ recursive: true })` on the whole `piper` directory.
  - the browser itself may still evict under storage pressure: the app never calls
    `navigator.storage.persist()` or `estimate()` (`grep` over `src/` finds neither).
- **In-memory session cache:** the worker keeps one `TtsSession` pinned to `sessionVoiceId`;
  a request for a different voice bumps `sessionGeneration`, clears both its own handle and the
  library's `_instance`, and reloads — the fix for the stale-audio bug
  (`piper.worker.ts:106-300`, regression test `e2e/voice-switch.test.ts`).
- **Generated audio is never cached** — no Cache API/IndexedDB; the result is a `Blob` behind an
  object URL that is revoked on the next generation / clear (`SpeechStudio.tsx:73-82`,
  `:183-186`, `:248-262`).

---

## 3. Server / infra architecture

### Oracle Cloud, Hetzner, RunPod

**None of the three is wired up, configured, or referenced anywhere in the repository.** Not
"planned but inactive" — there is no trace at all: no endpoint URLs, no API keys, no
`.env` entries, no client code, no infrastructure files.

Evidence:

- `grep -rniE "runpod|hetzner|oracle"` over the whole tree (excluding `node_modules`, `.next*`)
  returns nothing but unrelated calculator names in `Calculator_Database_Final.json`.
- `src/app/api/` contains exactly two routes — `ca-chain/route.ts` and `timestamp/route.ts` —
  neither referenced by the voice domain.
- `.env.example` lists only `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, and the three
  Supabase variables. The voice domain uses **no env vars at all**
  (`grep -rn "process\.env|NEXT_PUBLIC" src/domains/voice src/app/voice` → nothing).
- No `Dockerfile`, `docker-compose*`, `terraform*`, `ansible*`, or deploy script exists
  (`ls` for each); `scripts/` has no `*deploy*` file.
- Deployment is Vercel-only: `vercel.json` = `{ version: 2, framework: nextjs, regions: ["sfo1"], cleanUrls: true }`.
  The only workflow is `.github/workflows/visual-qa.yml` (a Playwright overflow sweep; nothing
  voice-specific).

### How a request routes between tiers

There is no tiering. The decision structure today is:

1. **Client-side by construction** — there is no "send to server" option to decide between.
   `piperEngine.ts:11-15`: "Everything runs in the browser. There is no server-side generation
   path and no fallback tiering … Generation is therefore unlimited and free by construction."
2. **Capability gate** (`VoiceSupportGate` → `checkVoiceSupport`, §2) decides whether the studio
   is offered at all.
3. **Size gates, all client-side:** `MAX_INPUT_CHARS = 5000` in the studio (over-limit input is
   refused with the "Too long by N characters" alert, `SpeechStudio.tsx:33`, `:325-350`), and
   400 characters per engine call in the worker (`PART_MAX_CHARS`, §6).
4. **Prefetch policy** decides whether speculative model traffic happens:
   `shouldSkipPrefetch()` returns true for `saveData === true` or `effectiveType` of `slow-2g`/`2g`
   (`piperEngine.ts:345-350`), and the worker additionally returns `"skipped-busy"` when a
   generation is already in flight (`piper.worker.ts:479-488`).
5. Within one request there is no scheduling decision: parts are synthesized strictly
   sequentially (`piper.worker.ts:397-421`).

### R2 audio cache

**Not implemented.** There is no R2/S3/Cloudflare reference in the domain or in any config, no
cache-key logic for audio, and no hit/miss path — because generated audio never leaves the page:
the worker returns bytes to the main thread, which wraps them in a `Blob` and an object URL
(`piper.worker.ts:458-470`, `piperEngine.ts:248-271`, `SpeechStudio.tsx:183-190`). The only
"cache" in this domain is the OPFS *model* cache described in §2.

### Queueing for the GPU tier

**No queueing system exists**, and there is no GPU tier to queue for. The only serialization is
the worker's `for` loop over chunks, plus a `generationsInFlight` counter whose sole consumer is
the prefetch busy-check (`piper.worker.ts:128-130`, `:364-370`, `:479-488`). There is no abort,
cancel or re-ordering: `releaseVoiceSession()` exists but nothing in the UI calls it (see §8).

---

## 4. Voice catalog

**119 voices across 37 languages.** (Not ~26.) `VOICE_COUNT = 119`, `LANGUAGE_COUNT = 37`
are derived in `src/domains/voice/lib/voiceCatalog.ts` and consumed by the copy.

### Where the list is defined — and what is duplicated

- **Single runtime source of truth:** `src/domains/voice/lib/voiceCatalog.ts` is auto-generated
  ("AUTO-GENERATED — do not edit by hand") from the installed library's `VoiceId` union
  (`node_modules/@mintplex-labs/piper-tts-web/dist/types.d.ts`) by
  `scripts/generate-voice-catalog.mjs`; regenerate with `npm run gen:voices`. The picker, the SEO
  copy, the sitemap-adjacent data and the tests all read from it.
- **Curated metadata source:** `src/domains/voice/lib/voiceNames.ts` holds display name + gender
  per `lang|speaker`; the generator hard-fails if a voice is missing, if an override is stale, or
  if two speakers in one language share a name.
- **Duplication flags:**
  1. `scripts/generate-voice-catalog.mjs` embeds its own copy of `FEATURED_VOICE_IDS` and
     `LANGUAGE_LABELS` — these are the generator's inputs, so they are upstream rather than a
     drift risk, but they are a second copy of the same facts.
  2. The counts `119` / `37` are hardcoded as literals, deliberately and with a comment, in
     `src/components/Categories.tsx:12-16` (`voice: ["119 Voices", "37 Languages"]` — "Deliberately
     literals: importing the catalog here would pull all 119 entries into the home page bundle")
     and in `src/data/tools.ts:154-155` (`highlights: ["119 Voices", "37 Languages", …]`).
     These two must be updated by hand if the catalog changes.
  3. The tone-preset list is duplicated between `lib/tonePresets.ts` and
     `components/tts/TonePresets.tsx` (8 identical ids/labels) — both dead code (§8).
- `src/lib/sitemap/sitemapSources.ts:22,241-250` imports `CATEGORIES as VOICE_CATS` from
  `src/domains/voice/registry.ts`; with `CATEGORIES = []` it currently emits nothing (§8).

### The complete current list

Format: **id** — display name / speaker slug / language / gender / quality (`qualityLabel`).
Source: `src/domains/voice/lib/voiceCatalog.ts` (generated), names+gender from `lib/voiceNames.ts`.

| Voice id | Display name | Speaker slug | Lang | Language | Gender | Quality | Label |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `en_US-ryan-medium` | Ryan | ryan | en_US | English (United States) | male | medium | Standard |
| `en_US-ryan-high` | Ryan | ryan | en_US | English (United States) | male | high | High fidelity |
| `en_US-amy-medium` | Amy | amy | en_US | English (United States) | female | medium | Standard |
| `en_US-lessac-medium` | James | lessac | en_US | English (United States) | male | medium | Standard |
| `en_US-hfc_female-medium` | Sophia | hfc_female | en_US | English (United States) | female | medium | Standard |
| `en_US-joe-medium` | Joe | joe | en_US | English (United States) | male | medium | Standard |
| `en_US-libritts_r-medium` | Aiden | libritts_r | en_US | English (United States) | male | medium | Standard |
| `en_US-amy-low` | Amy | amy | en_US | English (United States) | female | low | Light |
| `en_US-ljspeech-high` | Ava | ljspeech | en_US | English (United States) | female | high | High fidelity |
| `en_US-ljspeech-medium` | Ava | ljspeech | en_US | English (United States) | female | medium | Standard |
| `en_US-danny-low` | Danny | danny | en_US | English (United States) | male | low | Light |
| `en_US-libritts-high` | Emma | libritts | en_US | English (United States) | female | high | High fidelity |
| `en_US-hfc_male-medium` | Ethan | hfc_male | en_US | English (United States) | male | medium | Standard |
| `en_US-lessac-high` | James | lessac | en_US | English (United States) | male | high | High fidelity |
| `en_US-lessac-low` | James | lessac | en_US | English (United States) | male | low | Light |
| `en_US-kathleen-low` | Kathleen | kathleen | en_US | English (United States) | female | low | Light |
| `en_US-kristin-medium` | Kristin | kristin | en_US | English (United States) | female | medium | Standard |
| `en_US-l2arctic-medium` | Leo | l2arctic | en_US | English (United States) | male | medium | Standard |
| `en_US-kusal-medium` | Marcus | kusal | en_US | English (United States) | male | medium | Standard |
| `en_US-arctic-medium` | Nathan | arctic | en_US | English (United States) | male | medium | Standard |
| `en_US-ryan-low` | Ryan | ryan | en_US | English (United States) | male | low | Light |
| `en_GB-alba-medium` | Alba | alba | en_GB | English (United Kingdom) | female | medium | Standard |
| `en_GB-cori-high` | Cori | cori | en_GB | English (United Kingdom) | female | high | High fidelity |
| `en_GB-jenny_dioco-medium` | Jenny | jenny_dioco | en_GB | English (United Kingdom) | female | medium | Standard |
| `en_GB-northern_english_male-medium` | Oliver | northern_english_male | en_GB | English (United Kingdom) | male | medium | Standard |
| `en_GB-alan-low` | Alan | alan | en_GB | English (United Kingdom) | male | low | Light |
| `en_GB-alan-medium` | Alan | alan | en_GB | English (United Kingdom) | male | medium | Standard |
| `en_GB-cori-medium` | Cori | cori | en_GB | English (United Kingdom) | female | medium | Standard |
| `en_GB-aru-medium` | Freddie | aru | en_GB | English (United Kingdom) | male | medium | Standard |
| `en_GB-vctk-medium` | Henry | vctk | en_GB | English (United Kingdom) | male | medium | Standard |
| `en_GB-semaine-medium` | Isla | semaine | en_GB | English (United Kingdom) | female | medium | Standard |
| `en_GB-southern_english_female-low` | Poppy | southern_english_female | en_GB | English (United Kingdom) | female | low | Light |
| `ar_JO-kareem-low` | Kareem | kareem | ar_JO | Arabic (Jordan) | male | low | Light |
| `ar_JO-kareem-medium` | Kareem | kareem | ar_JO | Arabic (Jordan) | male | medium | Standard |
| `ca_ES-upc_ona-medium` | Ona | upc_ona | ca_ES | Catalan (Spain) | female | medium | Standard |
| `ca_ES-upc_ona-x_low` | Ona | upc_ona | ca_ES | Catalan (Spain) | female | x_low | Very light |
| `ca_ES-upc_pau-x_low` | Pau | upc_pau | ca_ES | Catalan (Spain) | male | x_low | Very light |
| `zh_CN-huayan-medium` | Mei | huayan | zh_CN | Chinese (China) | female | medium | Standard |
| `zh_CN-huayan-x_low` | Mei | huayan | zh_CN | Chinese (China) | female | x_low | Very light |
| `cs_CZ-jirka-low` | Jirka | jirka | cs_CZ | Czech (Czechia) | male | low | Light |
| `cs_CZ-jirka-medium` | Jirka | jirka | cs_CZ | Czech (Czechia) | male | medium | Standard |
| `da_DK-talesyntese-medium` | Freja | talesyntese | da_DK | Danish (Denmark) | female | medium | Standard |
| `nl_BE-rdh-medium` | Bram | rdh | nl_BE | Dutch (Belgium) | male | medium | Standard |
| `nl_BE-rdh-x_low` | Bram | rdh | nl_BE | Dutch (Belgium) | male | x_low | Very light |
| `nl_BE-nathalie-medium` | Nathalie | nathalie | nl_BE | Dutch (Belgium) | female | medium | Standard |
| `nl_BE-nathalie-x_low` | Nathalie | nathalie | nl_BE | Dutch (Belgium) | female | x_low | Very light |
| `nl_NL-mls-medium` | Daan | mls | nl_NL | Dutch (Netherlands) | male | medium | Standard |
| `nl_NL-mls_7432-low` | Lars | mls_7432 | nl_NL | Dutch (Netherlands) | male | low | Light |
| `nl_NL-mls_5809-low` | Sanne | mls_5809 | nl_NL | Dutch (Netherlands) | female | low | Light |
| `fi_FI-harri-low` | Harri | harri | fi_FI | Finnish (Finland) | male | low | Light |
| `fi_FI-harri-medium` | Harri | harri | fi_FI | Finnish (Finland) | male | medium | Standard |
| `fr_FR-upmc-medium` | Antoine | upmc | fr_FR | French (France) | male | medium | Standard |
| `fr_FR-mls-medium` | Camille | mls | fr_FR | French (France) | female | medium | Standard |
| `fr_FR-siwis-low` | Élodie | siwis | fr_FR | French (France) | female | low | Light |
| `fr_FR-siwis-medium` | Élodie | siwis | fr_FR | French (France) | female | medium | Standard |
| `fr_FR-gilles-low` | Gilles | gilles | fr_FR | French (France) | male | low | Light |
| `fr_FR-mls_1840-low` | Julien | mls_1840 | fr_FR | French (France) | male | low | Light |
| `fr_FR-tom-medium` | Tom | tom | fr_FR | French (France) | male | medium | Standard |
| `ka_GE-natia-medium` | Natia | natia | ka_GE | Georgian (Georgia) | female | medium | Standard |
| `de_DE-mls-medium` | Anna | mls | de_DE | German (Germany) | female | medium | Standard |
| `de_DE-eva_k-x_low` | Eva | eva_k | de_DE | German (Germany) | female | x_low | Very light |
| `de_DE-pavoque-low` | Felix | pavoque | de_DE | German (Germany) | male | low | Light |
| `de_DE-kerstin-low` | Kerstin | kerstin | de_DE | German (Germany) | female | low | Light |
| `de_DE-karlsson-low` | Lukas | karlsson | de_DE | German (Germany) | male | low | Light |
| `de_DE-ramona-low` | Ramona | ramona | de_DE | German (Germany) | female | low | Light |
| `de_DE-thorsten-high` | Thorsten | thorsten | de_DE | German (Germany) | male | high | High fidelity |
| `de_DE-thorsten-low` | Thorsten | thorsten | de_DE | German (Germany) | male | low | Light |
| `de_DE-thorsten-medium` | Thorsten | thorsten | de_DE | German (Germany) | male | medium | Standard |
| `de_DE-thorsten_emotional-medium` | Thorsten (Emotional) | thorsten_emotional | de_DE | German (Germany) | male | medium | Standard |
| `el_GR-rapunzelina-low` | Elena | rapunzelina | el_GR | Greek (Greece) | female | low | Light |
| `hu_HU-anna-medium` | Anna | anna | hu_HU | Hungarian (Hungary) | female | medium | Standard |
| `hu_HU-berta-medium` | Berta | berta | hu_HU | Hungarian (Hungary) | female | medium | Standard |
| `hu_HU-imre-medium` | Imre | imre | hu_HU | Hungarian (Hungary) | male | medium | Standard |
| `is_IS-bui-medium` | Búi | bui | is_IS | Icelandic (Iceland) | male | medium | Standard |
| `is_IS-salka-medium` | Salka | salka | is_IS | Icelandic (Iceland) | female | medium | Standard |
| `is_IS-steinn-medium` | Steinn | steinn | is_IS | Icelandic (Iceland) | male | medium | Standard |
| `is_IS-ugla-medium` | Ugla | ugla | is_IS | Icelandic (Iceland) | female | medium | Standard |
| `it_IT-riccardo-x_low` | Riccardo | riccardo | it_IT | Italian (Italy) | male | x_low | Very light |
| `kk_KZ-issai-high` | Aigerim | issai | kk_KZ | Kazakh (Kazakhstan) | female | high | High fidelity |
| `kk_KZ-iseke-x_low` | Iseke | iseke | kk_KZ | Kazakh (Kazakhstan) | male | x_low | Very light |
| `kk_KZ-raya-x_low` | Raya | raya | kk_KZ | Kazakh (Kazakhstan) | female | x_low | Very light |
| `lb_LU-marylux-medium` | Tessy | marylux | lb_LU | Luxembourgish (Luxembourg) | female | medium | Standard |
| `ne_NP-google-medium` | Sita | google | ne_NP | Nepali (Nepal) | female | medium | Standard |
| `ne_NP-google-x_low` | Sita | google | ne_NP | Nepali (Nepal) | female | x_low | Very light |
| `no_NO-talesyntese-medium` | Magnus | talesyntese | no_NO | Norwegian (Norway) | male | medium | Standard |
| `fa_IR-amir-medium` | Amir | amir | fa_IR | Persian (Iran) | male | medium | Standard |
| `fa_IR-gyro-medium` | Yasmin | gyro | fa_IR | Persian (Iran) | female | medium | Standard |
| `pl_PL-gosia-medium` | Gosia | gosia | pl_PL | Polish (Poland) | female | medium | Standard |
| `pl_PL-darkman-medium` | Marek | darkman | pl_PL | Polish (Poland) | male | medium | Standard |
| `pl_PL-mls_6892-low` | Ola | mls_6892 | pl_PL | Polish (Poland) | female | low | Light |
| `pl_PL-mc_speech-medium` | Tomasz | mc_speech | pl_PL | Polish (Poland) | male | medium | Standard |
| `pt_BR-faber-medium` | Camila | faber | pt_BR | Portuguese (Brazil) | female | medium | Standard |
| `pt_BR-edresson-low` | Edresson | edresson | pt_BR | Portuguese (Brazil) | male | low | Light |
| `pt_PT-tugão-medium` | Tiago | tugão | pt_PT | Portuguese (Portugal) | male | medium | Standard |
| `ro_RO-mihai-medium` | Mihai | mihai | ro_RO | Romanian (Romania) | male | medium | Standard |
| `ru_RU-denis-medium` | Denis | denis | ru_RU | Russian (Russia) | male | medium | Standard |
| `ru_RU-dmitri-medium` | Dmitri | dmitri | ru_RU | Russian (Russia) | male | medium | Standard |
| `ru_RU-irina-medium` | Irina | irina | ru_RU | Russian (Russia) | female | medium | Standard |
| `ru_RU-ruslan-medium` | Ruslan | ruslan | ru_RU | Russian (Russia) | male | medium | Standard |
| `sr_RS-serbski_institut-medium` | Milica | serbski_institut | sr_RS | Serbian (Serbia) | female | medium | Standard |
| `sk_SK-lili-medium` | Lili | lili | sk_SK | Slovak (Slovakia) | female | medium | Standard |
| `sl_SI-artur-medium` | Artur | artur | sl_SI | Slovenian (Slovenia) | male | medium | Standard |
| `es_MX-claude-high` | Santiago | claude | es_MX | Spanish (Mexico) | male | high | High fidelity |
| `es_MX-ald-medium` | Valentina | ald | es_MX | Spanish (Mexico) | female | medium | Standard |
| `es_ES-carlfm-x_low` | Carlos | carlfm | es_ES | Spanish (Spain) | male | x_low | Very light |
| `es_ES-mls_9972-low` | Elena | mls_9972 | es_ES | Spanish (Spain) | female | low | Light |
| `es_ES-mls_10246-low` | Javier | mls_10246 | es_ES | Spanish (Spain) | male | low | Light |
| `es_ES-davefx-medium` | Lucía | davefx | es_ES | Spanish (Spain) | female | medium | Standard |
| `es_ES-sharvard-medium` | Mateo | sharvard | es_ES | Spanish (Spain) | male | medium | Standard |
| `sw_CD-lanfrica-medium` | Amani | lanfrica | sw_CD | Swahili (DR Congo) | female | medium | Standard |
| `sv_SE-nst-medium` | Erik | nst | sv_SE | Swedish (Sweden) | male | medium | Standard |
| `tr_TR-dfki-medium` | Elif | dfki | tr_TR | Turkish (Türkiye) | female | medium | Standard |
| `tr_TR-fahrettin-medium` | Fahrettin | fahrettin | tr_TR | Turkish (Türkiye) | male | medium | Standard |
| `tr_TR-fettah-medium` | Fettah | fettah | tr_TR | Turkish (Türkiye) | male | medium | Standard |
| `uk_UA-ukrainian_tts-medium` | Andriy | ukrainian_tts | uk_UA | Ukrainian (Ukraine) | male | medium | Standard |
| `uk_UA-lada-x_low` | Lada | lada | uk_UA | Ukrainian (Ukraine) | female | x_low | Very light |
| `vi_VN-vivos-x_low` | Hoa | vivos | vi_VN | Vietnamese (Vietnam) | female | x_low | Very light |
| `vi_VN-25hours_single-low` | Linh | 25hours_single | vi_VN | Vietnamese (Vietnam) | female | low | Light |
| `vi_VN-vais1000-medium` | Minh | vais1000 | vi_VN | Vietnamese (Vietnam) | male | medium | Standard |

Per-language counts (`VOICE_LANGUAGES` in the same file): en_US 21, en_GB 11, es_ES 5, de_DE 10,
fr_FR 7, nl_BE 4, nl_NL 3, ru_RU 4, pl_PL 4, is_IS 4, ca_ES 3, hu_HU 3, kk_KZ 3, tr_TR 3, vi_VN 3,
ar_JO 2, zh_CN 2, cs_CZ 2, fi_FI 2, ne_NP 2, fa_IR 2, pt_BR 2, uk_UA 2, and one each for da_DK,
ka_GE, el_GR, it_IT, lb_LU, no_NO, pt_PT, ro_RO, sr_RS, sk_SK, sl_SI, sw_CD, sv_SE, es_MX — 37 codes, summing to 119.

`FEATURED_VOICE_IDS` (the ★ shortlist, 11 ids): `en_US-ryan-medium` (also `DEFAULT_VOICE_ID`),
`en_US-ryan-high`, `en_US-amy-medium`, `en_US-lessac-medium`, `en_US-hfc_female-medium`,
`en_US-joe-medium`, `en_US-libritts_r-medium`, `en_GB-alba-medium`, `en_GB-cori-high`,
`en_GB-jenny_dioco-medium`, `en_GB-northern_english_male-medium`.

### How the picker uses the metadata

`SpeechStudio.tsx` defaults to language `en_US`, gender `male`, voice `DEFAULT_VOICE_ID`, format
`wav` (`:48-56`); gender filters the language's voices, falling back to all of them when a
language has none of the selected gender so the dropdown is never empty (`:112-116`); a language
change re-picks a voice and flips gender when the new language lacks it (`:124-141`); featured
voices get a `★` suffix (`:409`).

---

## 5. Multilingual support

### Languages actually live today

All **37 languages / 119 voices** in `voiceCatalog.ts` are live and selectable — the catalog is
generated from the installed library's `VoiceId` union, which is "the same set of ids the
library's PATH_MAP can fetch" (`voiceCatalog.ts:3-8`, `scripts/generate-voice-catalog.mjs`), and
each entry has a real `PATH_MAP` path in `piper-tts-web.js:16-…`. Nothing in the code marks any
language as planned, beta or disabled; the picker renders `VOICE_LANGUAGES` in full
(`SpeechStudio.tsx:373-380`).

The languages are: en_US, en_GB, ar_JO, ca_ES, zh_CN, cs_CZ, da_DK, nl_BE, nl_NL, fi_FI, fr_FR,
ka_GE, de_DE, el_GR, hu_HU, is_IS, it_IT, kk_KZ, lb_LU, ne_NP, no_NO, fa_IR, pl_PL, pt_BR, pt_PT,
ro_RO, ru_RU, sr_RS, sk_SK, sl_SI, es_MX, es_ES, sw_CD, sv_SE, tr_TR, uk_UA, vi_VN.

There is no language *subset* configured anywhere, and no per-language availability check — the
only thing that would remove a language is a library bump that changes the union.

### How the espeak-ng routing actually works

Read from the library source, because **this repo's `patch-package` involvement has nothing to do
with espeak**:

1. `patches/` contains exactly one patch, `patches/lamejs+1.2.1.patch`, which only appends
   `module.exports = lamejs;` to `node_modules/lamejs/lame.all.js` so the MP3 encoder can be
   imported. `package.json` `postinstall` is `patch-package && node scripts/patch-lamejs.cjs &&
   node scripts/copy-ffmpeg-core.cjs`. There is no espeak patch, and nothing patches
   `@mintplex-labs/piper-tts-web`.
2. espeak-ng is compiled into the library's own WASM: `piper_phonemize.wasm` plus
   `piper_phonemize.data`, fetched from
   `https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/...`
   (`fixtures.d.ts:14`, consumed at `piper-tts-web.js:236-240`, `:373-377`). The `.data` bundle is
   an Emscripten filesystem image containing `/espeak-ng-data` and its language directories
   (`piper-o91UDS6e.js:102-126` create `espeak-ng-data/lang/{aav,art,bat,…}` inside the virtual FS).
3. **Per-voice routing is data-driven, not code-driven.** Each voice's `.onnx.json` declares an
   espeak voice, and the library passes that straight to the phonemizer binary:

   ```js
   // node_modules/@mintplex-labs/piper-tts-web/dist/piper-tts-web.js:379-386
   module.callMain([
     "-l", __privateGet(this, _modelConfig).espeak.voice,
     "--input", input,
     "--espeak_data", "/espeak-ng-data"
   ]);
   ```

   Verified live for the default voice: `en_US-ryan-medium.onnx.json` → `"espeak": { "voice": "en-us" }`.
   So "which espeak-ng language" is chosen entirely by the model config we fetch, one file per
   voice; there is no app-level mapping, no language switch in our code, and no way for the app to
   override the espeak voice. Phoneme ids then come from `phoneme_id_map` in the same JSON
   (`phoneme_type: "espeak"`, 256 symbols for ryan-medium) and are fed to the ONNX session.
4. Consequence worth knowing: the `phonemizer` npm package (`^1.2.1` in `package.json`) is a
   **direct dependency that nothing in the repo imports** — `grep -rn "phonemizer"` over
   `src`, `scripts`, `e2e` and `package.json` matches only a prose comment in
   `e2e/voice-prefetch.test.ts:16`. The actual phonemizer is the one bundled in the piper WASM.
   (Git history: `package.json` also has no `kokoro-js`/`@huggingface/transformers` entry, yet
   stale copies exist under `node_modules` and are named in `.freebuff/build-b26.log` — leftover
   from the Kokoro era.)

### Known limitations / partially-broken languages

- **The chunker is language-agnostic by design and runs before any language check.** The
  terminator/clause sets include Devanagari danda (।॥), CJK and fullwidth forms, the Arabic comma
  and fullwidth colon/period (`textChunker.ts:24-31`), and the comment states "the splitter runs
  before any language check" (`textChunker.ts:20-23`). Its blind-slice fallback explicitly accepts that
  "Devanagari matras can still be separated from their base consonant" (`textChunker.ts:139-149`).
- **Nothing validates that the typed text matches the selected voice's language.** A visitor can
  type Cyrillic with an English voice selected; the espeak voice is whatever the model config
  says, so pronunciation will be wrong with no warning. This is the one real multilingual failure
  mode I can see in the code — it is not documented as a known bug anywhere.
- **Hinglish / mixed-script input is not handled.** The abbreviation list and the
  "period followed by a lowercase word" rule are cased-script heuristics; the comment notes
  Devanagari has no case so "Hindi is unaffected either way" (`textChunker.ts:63-71`).
- No language is marked as broken or partial in any file, in copy, or in the tests. Any claim
  that specific languages are "partially broken" today is **unclear — need to verify** by
  running the engine per language; nothing in the repo asserts it.
- `public/espeak` does not exist, and the pre-dev scripts that used to populate it
  (`scripts/copy-espeak-core.cjs`, `scripts/copy-ort-wasm.cjs`) are gone from `scripts/`, though
  they still appear in older logs (`scratch/voice-audit-dev.log:3-9`,
  `.freebuff/build-b25.log`) — see §8.

---

## 6. Chunking

All of this is `src/domains/voice/lib/textChunker.ts`, with the seam handling in
`src/domains/voice/lib/wavUtils.ts` and the call site in `src/domains/voice/lib/piper.worker.ts`.

**Max chunk length — two different numbers, one in use:**

- `textChunker.ts:19` — `export const DEFAULT_MAX_CHARS = 500` (the default parameter of
  `chunkText`). Nothing in the app uses this default: the worker always passes its own limit, so
  `500` is effectively unreachable in production.
- `piperProtocol.ts:55-63` — `export const PART_MAX_CHARS = 400`, described as "one engine call per
  part. Deliberately just under the 400-character cap the speech library's own internal splitter
  uses (its `MAX_CHUNK_LENGTH`)". The library's own cap really is 400
  (`piper-tts-web.js:416: const MAX_CHUNK_LENGTH = 400`), so "just under" is inaccurate — it is
  *equal*. It behaves correctly anyway, because the library only splits when
  `trimmed.length > maxLength` (`:420`), so a 400-char part passes through untouched.
- The worker calls `chunkText(trimmed, PART_MAX_CHARS)` (`piper.worker.ts:362`), and the UI calls
  the same function with the same constant to display "Generates in N parts."
  (`SpeechStudio.tsx:150-158`) — the constant is shared deliberately so the estimate cannot drift
  from the work.

**How it splits — sentence boundary first, never raw character count until the last resort:**
`chunkText(text, maxLen)` (`:220-229`):

1. `trim()`; blank → `[]`; `limit = Math.max(1, Math.floor(maxLen))`; if
   `trimmed.length <= limit` → `[trimmed]` (a length-1 result means "no chunking happened").
2. `splitIntoSentences` (`:85-116`) on **whole sentences**, keeping each sentence's terminating
   punctuation and any trailing closing quote/bracket:
   - terminators: `.!?…。？！।॥` (`:24`);
   - closing marks absorbed into the previous sentence: `"'’”)]}»›」』` (`:27`);
   - newlines are hard boundaries — a heading or list item with no punctuation is still its own
     "sentence" (`:82-84`);
   - `"."` is protected when decorative: decimal points (`3.14`), a 50-entry abbreviation list
     (`mr, mrs, … fri, sat`, `:34`), single-letter initials (`J. K. Rowling`), and a period
     followed by a lowercase word (all in `isProtectedPeriod`, `:51`).
3. Any sentence longer than `limit` goes through `explodeSentence` (`:172`), degrading in
   order: clause marks `,;:،、，；：—` (`:31`), then whitespace (whole words), then — only for a
   single unbroken run with no space or comma, e.g. a URL or hash — `sliceToLimit` (`:150`),
   a blind slice that accumulates whole code points so it cannot cut a surrogate pair, and is
   what guarantees termination.
4. `pack` (`:184`) greedily fills chunks with consecutive units joined by a single space,
   starting a new chunk when `current.length + 1 + unit.length > limit`.

Invariant: every returned chunk is `<= maxLen` characters (`:206-209`).

**Stitching / gap insertion on the audio side:**

- The worker collects one WAV `Blob` per part (`speechSession.predict(parts[i])`,
  `piper.worker.ts:397-421`), then calls
  `concatWavSamples(blobs, { gapMs: SEAM_GAP_MS })` with `SEAM_GAP_MS = 120`
  (`piperProtocol.ts:66`, `piper.worker.ts:447`).
- `concatWavSamples` (`wavUtils.ts:211-249`) parses each WAV to mono float samples
  (`parseWav`, handlers for PCM 8/16/24/32 and float32, unknown chunks skipped, multi-channel
  averaged down), throws if sample rates differ, and inserts `round(sampleRate * 120 / 1000)`
  zero samples **between** parts only — `max(0, …)`, and a single part returns the samples
  untouched with no gap at all (`:230-232`).
- The merged buffer is then encoded as one canonical **16-bit mono WAV** (`encodeWav`, `wavUtils.ts:154`)
  or as MP3 via lamejs at 128 kbps mono (`piper.worker.ts:311-350`). Duration is computed from the
  sample count, not by re-decoding (`piper.worker.ts:452`).
- Default duplication: `wavUtils.ts:188` defines its own `DEFAULT_GAP_MS = 120`, the same value as
  `SEAM_GAP_MS` — two constants for one number.
- `concatWavBlobs` (`wavUtils.ts:259-267`) is the older WAV-only joiner; **it has no callers** (see §8).

Input ceiling: the studio refuses to submit more than `MAX_INPUT_CHARS = 5000` characters
(`SpeechStudio.tsx:42`, `:327-340`), so a run is at most ~13 parts at 400 chars each.

---

## 7. Feature flags & config

### `TTS_STUDIO_ENABLED` and other flags

- **`TTS_STUDIO_ENABLED` does not exist.** The string appears nowhere in the repository — not in
  code, `.env.example`, `next.config.mjs`, `vercel.json`, or any workflow.
- **There is no feature-flag system in this domain at all.** No `process.env` read and no
  `NEXT_PUBLIC_*` reference exists under `src/domains/voice` or `src/app/voice`
  (verified by grep). The only gates are runtime checks:

| Gate | Where | What it decides |
| --- | --- | --- |
| Browser capability | `lib/browserSupport.ts` + `components/VoiceSupportGate.tsx` | WebAssembly defined **and** `navigator.storage.getDirectory` present → render studio, else a notice. |
| Input ceiling | `components/tts/SpeechStudio.tsx:42` (`MAX_INPUT_CHARS = 5000`) | Refuse generate; render "Too long by N characters". |
| Prefetch policy | `lib/piperEngine.ts:345-350` (`shouldSkipPrefetch`) | Skip the idle model download on `saveData` or 2g/slow-2g. |
| Prefetch busy-check | `lib/piper.worker.ts:479-488` | `"skipped-busy"` when a generation is already running. |
| Chunk estimate | `SpeechStudio.tsx:150-158` | Shows "Generates in N parts." when N > 1. |
| Tool-page indexing | `src/app/voice/[slug]/page.tsx` → `isComingSoonToolPage` (`src/lib/tools/liveToolFilters.ts`) | `robots: { index:false, follow:false }` for non-live tools; `"voice"` is not in `COMPONENT_GATED_DOMAINS` or `ALWAYS_COMING_SOON_DOMAINS`, so the decision falls to the registry entry's `status`. |

### Env vars required for the voice domain

**None.** The domain reads no environment variable and holds no keys; it needs three public CDN
hosts and one model host reachable from the browser (`huggingface.co`, `cdn.jsdelivr.net`,
`cdnjs.cloudflare.com` — `e2e/voice-prefetch.test.ts:23`), plus OPFS and WebAssembly.

`.env.example` (the full contents, tagged `[TEMPLATE]`) contains only:

```
NEXT_PUBLIC_SITE_URL=https://racira.com
NEXT_PUBLIC_SITE_NAME=Racira
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

So in a fresh environment: every voice-domain requirement is already satisfied by "npm install +
`npm run dev`"; the Supabase values being blank is irrelevant to voice (they belong to the Finance
blog/admin, per the comments in `.env.example`).

Build-time config that touches the domain (`next.config.mjs`):

- `transpilePackages: ['onnxruntime-web', '@mintplex-labs/piper-tts-web']`
- headers: `{ source: '/voice', headers: [COOP: same-origin, COEP: credentialless] }`, plus a
  `/_next/static/chunks/:path*` rule (`CORP: same-origin`, `COEP: credentialless`) so the module
  worker Next emits is not blocked. `/audio/:path*` and the LibreOffice slugs get `require-corp`
  instead. The rationale comment warns not to verify multithreading by reading
  `ort.env.wasm.numThreads` (the library sets it unconditionally); the honest check is that the
  runtime spawns `hardwareConcurrency - 1` thread workers.
- `distDir: process.env.RACIRA_DIST_DIR || '.next'` — a build-output override for running a second
  dev server on the same checkout; not voice-specific but it does affect local voice testing.
- `webpack`: `resolve.fallback` sets `fs`/`path`/`fs/promises` to false and disables URL parsing.

---

## 8. Known issues

### Duplication / self-inconsistency

1. **`src/domains/voice/registry.ts` is empty (`CATEGORIES = []`) while everything around it still
   assumes tools exist.** Consequences:
   - `/voice/[slug]` calls `notFound()` for every slug (`src/app/voice/[slug]/page.tsx`), so the
     route is dead weight (it is still built and exported via `generateStaticParams`, which
     returns only the empty list's contents).
   - `src/lib/sitemap/sitemapSources.ts:241-250` still iterates `VOICE_CATS` and would emit
     `/voice/<slug>` URLs — currently it emits none, which is fine but is a live dependency on an
     empty array.
   - `scripts/verify_voice.mjs` is stale: it greps `/voice` for `href="/voice/tools/…"` links and
     then fetches `/voice/tools/text-to-speech-generator`; neither pattern exists on the current
     page (`src/app/voice/page.tsx` renders the studio inline). Its "coming soon" expectations no
     longer describe reality.
2. **Voice counts are hardcoded in two more places** as `"119 Voices"` / `"37 Languages"` —
   `src/components/Categories.tsx:12-16` and `src/data/tools.ts:154-155`. Both carry comments
   acknowledging they mirror the catalog, so this is a deliberate trade (bundle size) rather than
   an oversight, but a library bump will silently stale them while every other surface updates.
3. **The 8 tone presets are duplicated** between `lib/tonePresets.ts` (with rate/pitch/volume
   settings) and `components/tts/TonePresets.tsx` (labels only), and neither is used.
4. **`SEAM_GAP_MS = 120` (`piperProtocol.ts:66`) and `DEFAULT_GAP_MS = 120` (`wavUtils.ts:188`)**
   are the same number in two modules.
5. **Two MP3 patch mechanisms do the same thing**: `patches/lamejs+1.2.1.patch` (via the
   `patch-package` step) and `scripts/patch-lamejs.cjs` (via `postinstall`) both rewrite
   `node_modules/lamejs` so `require("lamejs")` works — the script additionally sets
   `package.json#main` to `lame.all.js` and self-tests the encoder.

### Dead code paths

Nothing in the domain has a `TODO`, `FIXME`, `HACK` or `XXX` (`grep -rniE "todo|fixme|hack|xxx|unclear"`
over `src/domains/voice` and `src/app/voice` → no matches). The dead code instead:

- Never-imported components: `components/tts/TextPanel.tsx`, `components/tts/GenerateButton.tsx`,
  `components/tts/TonePresets.tsx`, `components/tts/TTSLogo.tsx`
  (grep for each export returns only its own definition; `SpeechStudio.tsx` inlines equivalents).
- Never-imported lib: `lib/tonePresets.ts` (`TONE_PRESETS`, `getPreset`, `parseCustomTone`).
  This one is user-visible in a subtle way: the template and the tone pills exist in the codebase
  but there is **no rate/pitch/volume control in the live UI and nothing is passed to the engine**
  — the only things a visitor can change are language, gender, voice id, format, and text.
- Exported but uncalled: `concatWavBlobs` (`wavUtils.ts:259`) — superseded by `concatWavSamples`;
  `releaseVoiceSession` (`piperEngine.ts:301-303`) — no caller, so the loaded model is never
  dropped from memory by the UI; `splitIntoSentences`/`DEFAULT_MAX_CHARS` are only reachable
  internally (the worker passes 400 explicitly); `FORMAT_MIME` is used only inside the worker.
- `lib/browserSupport.ts`'s `SupportResult` `"no-storage"` branch renders copy about offline
  generation, but generation still works without OPFS — the gate chooses to refuse rather than
  offer-with-a-cost, which the comment states explicitly, so this is intentional rather than a bug.
- No abort/cancel anywhere: there is no Stop button, and `busy` deliberately freezes the textarea
  and all pickers during a run (`SpeechStudio.tsx:274-279`, with `disabled={busy}` on the textarea and each picker). A superseded voice load is ignored
  via `SupersededFailure`, not cancelled.

### Stale artifacts and comments that no longer match the tree

- Build/dev logs under `.freebuff/`, `_scripts/` and `scratch/` still reference a Kokoro-era
  pipeline: `src/domains/voice/lib/kokoroEngine.ts`, `src/domains/voice/components/tts/KokoroGenerator.tsx`,
  `scripts/copy-espeak-core.cjs`, `scripts/copy-ort-wasm.cjs`, `public/espeak`, `public/ort`,
  and `@huggingface/transformers` (`scratch/voice-audit-dev.log:3-9`, `.freebuff/build-b26.log:54-65`,
  `dev-server-audit.log:3-6`). None of those files or directories exist now
  (`ls scripts/copy-*` → only `copy-ffmpeg-core.cjs`; there is no `public/espeak`).
  The current `predev`/`presbuild`/`postinstall` scripts in `package.json` touch only
  `copy-ffmpeg-core.cjs` and `patch-lamejs.cjs`.
- `scripts/tts-probe.mjs` is a dev diagnostic still written for the old stack: it launches
  Chromium with `--enable-unsafe-webgpu` and treats `.bin|.onnx|.wasm|.mjs` responses as voice
  assets.
- `package.json` still lists `phonemizer` (`^1.2.1`) as a direct dependency though nothing imports
  it; `node_modules` also carries stale `kokoro-js` / `@huggingface/transformers` trees that no
  longer appear in `package.json`.
- Comment vs code: `PART_MAX_CHARS` is documented as "just under the 400-character cap" but equals
  400 (`piperProtocol.ts:55-63` vs `piper-tts-web.js:416`) — harmless, since the library only
  splits above the cap, but the comment is wrong.
- Comment placement in `next.config.mjs`: the paragraph explaining `/voice`'s `credentialless`
  choice sits inside the `/audio/:path*` entry's comment block, and the "Do not verify this by
  reading `ort.env.wasm.numThreads`" note is wedged between the `/audio` and `/voice` entries. The
  code itself is correct (`/audio` → `require-corp`, `/voice` → `credentialless`), but anyone
  reading the header list top-down will misattribute the rationale.
- `src/domains/voice/lib/piperEngine.ts:18-36` carries a flagged product decision (the removed
  "2 free generations/day + rewarded ad" gate) with an explicit instruction: "Do not reintroduce
  counting, gating or ad logic here to compensate." No ad/metering code remains anywhere in the
  domain — this is an open *product* question, not a code defect.

### Operational gaps I can see but that are not flagged in the code

- **No storage-quota handling.** The app never calls `navigator.storage.persist()` or
  `estimate()`, and the cache indicator can only remove voices one at a time or all at once.
  Downloading many of the larger voices (~63 MB for the default) has no budget check, and OPFS
  writes are best-effort (the library's `writeBlob` swallows errors — `piper-tts-web.js:159-177`),
  so a quota failure could look like "the voice downloaded but isn't saved".
- **No download-safety net beyond a 30 s idle watchdog** (`MODEL_IDLE_TIMEOUT_MS`,
  `piper.worker.ts:96-104`), armed only during the load phase and re-armed by progress.
- **Unverified:** that every one of the 119 `PATH_MAP` entries still resolves on the Hugging Face
  repo, and the real per-voice download sizes (only `en_US-ryan-medium` was checked, at
  63,201,294 bytes). Anything else here would be a guess.

---

## 9. Conventions to preserve

These are rules stated in code/comments (and, where noted, enforced by tests). They are listed
with the place each one lives so a future change cannot quietly break them.

1. **No engine, host, package or runtime names in user-facing copy.** Enforced in three layers:
   - `piperEngine.ts:48-88` — one exported constant `GENERIC_GENERATION_ERROR = "Couldn't generate speech — try again"`, and `toUserFacingError()` passes *only* `SpeechInputError` through; every other throw collapses to the generic string. The comment says engine text "names hosts, packages and runtime internals, none of which belongs on screen".
   - `piperProtocol.ts:168-180` — `FailedResponse.message` is documented as "kept for the console only".
   - `e2e/voice-prefetch.test.ts` — asserts the rendered error text equals exactly the generic
     sentence and matches none of `/huggingface|cdnjs|jsdelivr|piper|onnx|ort\b|wasm|https?:|part \d/i`,
     and that the raw error *is* logged to the console as `[voice] generation failed`.
2. **No hardware tiers, no GPU language, no browser-version matrix in the gate.** `browserSupport.ts:1-8`
   ("the gate is now two checks and no hardware probing") and `VoiceSupportGate.tsx:9-13`. The
   only GPU occurrences in the domain are the comments that say there is no GPU requirement.
3. **No metering, counting, gating or ad logic in this domain.** `piperEngine.ts:18-36` — the
   explicit "Do not reintroduce counting, gating or ad logic here to compensate." Unlimited
   client-side generation is the shipped Phase 1 principle (and is echoed in the FAQ copy:
   "Is there any usage limit? — No.").
4. **Every number shown in copy comes from the catalog, not from prose.** `src/app/voice/page.tsx`
   (`DESCRIPTION`), `TTSFeatures.tsx`, `TTSWhyRacira.tsx`, `TTSFAQ.tsx`, `TTSSeoContent.tsx` all
   import `VOICE_COUNT`/`LANGUAGE_COUNT` with comments saying so. The two exceptions —
   `src/components/Categories.tsx:12-16` and `src/data/tools.ts:154` — are literal on purpose
   (bundle size) and must be updated by hand.
5. **`voiceCatalog.ts` is generated; never hand-edit it.** Header says "AUTO-GENERATED — do not
   edit by hand"; regenerate with `npm run gen:voices`; curated names/gender go in `voiceNames.ts`
   and the generator hard-fails on a missing, stale or name-colliding entry
   (`scripts/generate-voice-catalog.mjs`).
6. **One owner for the model cache.** The worker + the library are the only writers/deleters;
   `voiceStorage.ts:1-22` and `piperEngine.ts:277-296` both state the rule ("every write and
   every delete goes through the library's own storage API, from the worker, so there is one owner
   of the cache and no second implementation of it anywhere").
7. **Only the worker imports the speech library.** `piper.worker.ts:14-19` — "the page never
   imports the library, so there is exactly one copy of its state"; `verify_voice`-style checks
   aside, `piperEngine.ts` imports types only.
8. **No CPU-bound work on the main thread.** Inference, WAV concat and the lamejs MP3 encode all
   live in the worker (`piper.worker.ts:296-311`), and the finished bytes are transferred, not
   copied.
9. **Shared constants, never duplicated values in the hot path.** `PART_MAX_CHARS` is deliberately
   shared between the UI's "Generates in N parts" estimate and the worker's actual splitting
   (`piperProtocol.ts:55-75`); the empty-input message is shared so the pre-flight gate and the
   worker backstop cannot drift (`piperProtocol.ts:70-75`).
10. **Progress must be honest.** The worker emits a real phase stream (`loading` → `synthesizing`
    per part → `assembling`) and the UI renders a stepped bar rather than an indeterminate
    animation for multi-part runs (`SpeechStudio.tsx:503-536`); a failed run clears any previous
    clip so it cannot be mistaken for a partial result (`SpeechStudio.tsx:202-220`).
11. **`data-testid` names are part of the contract.** The e2e suite depends on:
    `language-select`, `gender-select`, `voice-select`, `format-select`, `tts-char-count`,
    `tts-limit-warning`, `tts-chunk-estimate`, `tts-chunk-progress`, `tts-generate-error`,
    `tts-stored-voices`, `tts-audio`, `tts-download` (all in `SpeechStudio.tsx`, lines cited in §2).
12. **Defaults are a product decision with a stated rationale.** `en_US-ryan-medium` + WAV are the
    defaults because the high tier is "twice the download and roughly four times the synthesis
    time per part" and MP3 adds "a flat several seconds to every run"
    (`scripts/generate-voice-catalog.mjs` comment on `FEATURED_VOICE_IDS`, `SpeechStudio.tsx:41-45`).
    The featured shortlist is English-first for the same reason.
13. **The studio's geometry is load-bearing.** `TTSHero` owns both vertical gaps and the studio
    contributes `pt-0` (`TTSHero.tsx:4-6`, `SpeechStudio.tsx:282-285`); `#studio` lives on the
    page wrapper, not the studio, so the anchor resolves while the capability check runs
    (`src/app/voice/page.tsx:41-45`).
14. **All generation copy is "on your device".** The FAQ/SEO sections commit to privacy claims
    ("Your text never leaves your device — it's turned into speech locally in your browser",
    `TTSFAQ.tsx`) — a claim that is currently true by construction (no API route, no env var, no
    server path) and must stay true for the copy to remain honest.
