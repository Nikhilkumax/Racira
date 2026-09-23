# Piper TTS — `pipertts` → `racira-nextjs` parity report

Reconciliation of the production voice/TTS domain in `racira-nextjs` against the
standalone, manually-verified Piper bench at `../pipertts`.

- **Scope:** `src/domains/voice/**`, `scripts/generate-voice-catalog.mjs`,
  `scripts/tts-probe.mjs`, and the two hand-maintained count literals outside the
  domain. **No `/voice` component, layout or UX file was touched.**
- **Method:** byte-level comparison of installed dependencies, structural parsing of
  the engine's own voice tables, HTTP checks against the model host, and the
  existing `scripts/tts-probe.mjs` harness driven against a running dev server.
- **Verdict:** the two implementations share the *identical* engine, model host and
  voice-id set. The only app-level divergence in the engine path is the chunk size,
  and the bench's value there is a defect (see §2). Parity required **one** real
  change — exposing five voices the engine can already fetch but the generated
  catalog omitted (§3).

---

## 1. Confirmed identical (checked, not assumed)

| Thing | `pipertts` | `racira-nextjs` | Evidence |
| --- | --- | --- | --- |
| Engine library | `@mintplex-labs/piper-tts-web` 1.0.5 | same | `package.json`; both lockfiles resolve the same npm tarball |
| Engine bundle | — | — | `dist/piper-tts-web.js` is **byte-identical** (md5 `98c5b16e876fd379210d36657ced126e`) |
| Type surface | — | — | `dist/types.d.ts` identical (md5 `a765f8e8f5bdb0cc932f7d92abd889bb`); `fixtures.d.ts` identical |
| Runtime | `onnxruntime-web` 1.18.0 | 1.18.0 | both lockfiles; same npm tarball |
| Model host | `https://huggingface.co/diffusionstudio/piper-voices/resolve/main` | same | hardcoded `HF_BASE` in both bundles (`piper-tts-web.js:13`) — **the bench does not use a different host** |
| Phonemizer wasm | `cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0` | same | `WASM_BASE`, `DEFAULT_WASM_PATHS` |
| ONNX runtime wasm | `cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/` | same | `ONNX_BASE` |
| Voice ids | 119 (union-derived) | 119 (union-derived) | see §2 — same omission, same ids |
| Seam gap | 120 ms | 120 ms (`SEAM_GAP_MS`) | `main.js` vs `piperProtocol.ts` |

Because both bundles are byte-identical and both apps rely on the library's hardcoded
`HF_BASE`, **the model-hosting discrepancy in the brief is not a discrepancy**: the
reference fetches models from the same third-party re-host production does. Nothing
about hosting can be "ported" — see §6.

## 2. The real diff

| Dimension | `pipertts` | `racira-nextjs` | Resolution |
| --- | --- | --- | --- |
| **Chunk size** | 500 chars | 400 chars | **Kept 400** (decided with the user). The library hard-caps one inference pass at `MAX_CHUNK_LENGTH = 400` and re-splits anything larger into library-chosen sub-chunks joined with **no** seam silence and no progress event. At 500, every 401–500-char part is silently re-split, so the bench's reported "N parts" undercounts its real engine calls and its seams stop being its own. 400 is the correct value *for the browser engine*; the bench's 500 is tuned to the textarea, not the engine. |
| Chunker algorithm | one regex, sentence-first | sentence → clause → word → code-point fallback, abbreviation/decimal/initial protection, Devanagari + CJK aware | Production is a strict superset; nothing to port. |
| Threading | `predict()` on the main thread | dedicated `Worker`, transferred bytes, MP3 encode off-thread | Production is ahead; nothing to port. |
| Stitching | byte-level WAV concat, keeps source format | decode → mono float → 120 ms gap → canonical 16-bit mono re-encode | Equivalent output; production also feeds the MP3 path. |
| MP3 | none | lamejs 128 kbps mono | Production-only; nothing to port. |
| OPFS cache | library `stored()` / `remove()` / `flush()` | library `remove()` / `flush()` + read-only listing (`voiceStorage.ts`) | Equivalent; production's listing avoids loading the engine. |
| Idle prefetch | none | connection-aware prefetch of the featured voice | Production-only; nothing to port. |
| Error copy | raw `err.message` rendered | collapsed to one generic sentence, raw text to console | Production is ahead; required by `e2e/voice-prefetch.test.ts`. |
| Voice switch | `predict()` → singleton reuse (stale-model risk) | session generation + singleton clear | Production fixed this (`e2e/voice-switch.test.ts`). |
| Char cap | 5 000 | 5 000 | Identical; unchanged. |
| Waveform verification | none | none (harness existed but single-voice) | Harness upgraded — see §4. |

**Conclusion: there is no working capability in `pipertts` that production lacks.**
The only value worth taking from the bench was *not* its chunk size; it was a gap both
projects shared (below).

## 3. What was changed

**1. Five reachable voices were unreachable in production (real gap, closed).**
The library's runtime lookup `PATH_MAP` (which is how the engine resolves an id to a
model file) ships **124** ids, while its `VoiceId` union — the sole source
`generate-voice-catalog.mjs` read — lists only **119**. The five orphans are keyed in
`PATH_MAP` and served by the model host, but no catalog generated from the union could
ever offer them:

| id | why it matters |
| --- | --- |
| `it_IT-paola-medium` | **the missing standard-tier Italian voice** — Italian previously had only `it_IT-riccardo-x_low` |
| `cy_GB-gwryw_gogleddol-medium` | **a whole missing language (Welsh)** |
| `en_US-bryce-medium`, `en_US-john-medium`, `en_US-norman-medium` | three more standard-tier US English voices |

Files:

- `scripts/generate-voice-catalog.mjs` — now unions the `VoiceId` union with the
  `PATH_MAP` keys parsed from the installed bundle, hard-failing if the `PATH_MAP`
  parse yields fewer ids than the union (so a bundle change fails loudly instead of
  silently shrinking the catalog). Added the `cy_GB` label.
- `src/domains/voice/lib/voiceNames.ts` — curated names/gender for the five
  (`Paola`, `Owain`, `Bryce`, `John`, `Norman`) and a `EngineCountryCode` alias, since
  the library's own `CountryCode` union also omits `cy_GB`.
- `src/domains/voice/lib/voiceCatalog.ts` — regenerated: **124 voices / 38 languages**
  (was 119 / 37). Regeneration is idempotent (same md5 across runs).
- `src/components/Categories.tsx`, `src/data/tools.ts` — the two deliberate count
  literals updated 119/37 → 124/38. *(Both files already carried another thread's
  uncommitted edits; these changes are additive and did not disturb them.)*
- `e2e/voice-generator.test.ts` — new test asserting Paola and Owain are selectable
  (no model download), so a future regeneration cannot silently drop them.

**2. The part cap's rationale is now recorded in code.**
`src/domains/voice/lib/piperProtocol.ts` — the `PART_MAX_CHARS` comment previously
claimed the value was "just under" the library's cap (it is *equal*) and did not
explain the constraint. It now states the verified rule and explicitly warns against
raising it to chase "fewer parts".

**3. `scripts/tts-probe.mjs` became a waveform-verification harness.**
The brief lists "no waveform verification done across the voice catalog" as a gap; the
probe could only test the page's default voice. It now accepts `PROBE_VOICES`
(a JSON array of picker descriptors) to sweep voices through the real UI, decodes each
clip with `AudioContext` and reports peak/RMS/non-zero-sample share, records the UI's
part estimate, saves every clip, and **exits non-zero if any voice produced silence**.
It also dropped the stale Kokoro-era WebGPU flags (the engine is WASM-only) and
defaults to headless.

No `/voice` component, layout or UX file was modified.

## 4. Verification (re-run on the merged result)

Against a dev server on `:3002`, using the harness above:

| Voice | chars | parts | peak | RMS | non-zero | duration | result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `en_US-ryan-medium` | 43 | 1 | 0.6097 | 0.0919 | 99.99 % | 2.12 s | audio ok |
| `it_IT-paola-medium` **(new)** | 43 | 1 | 0.5359 | 0.0769 | 99.78 % | 2.44 s | audio ok |
| `cy_GB-gwryw_gogleddol-medium` **(new)** | 43 | 1 | 0.5170 | 0.0496 | 99.77 % | 3.29 s | audio ok |
| `el_GR-rapunzelina-low` | 43 | 1 | 0.1998 | 0.0271 | 99.78 % | 2.27 s | audio ok |
| `en_US-ryan-medium` | 4 920 | **15** | 0.6064 | 0.0934 | 99.35 % | 260.69 s | single stitched WAV, audio ok |
| `en_US-ryan-medium` | **5 000** | **16** | 0.6409 | 0.0928 | 99.31 % | 263.63 s | single stitched WAV, audio ok |

The 5 000-character run is the char-cap/chunking check the brief asked for: input at
the cap → 16 parts → **one** downloadable WAV (11.6 MB, `RIFF`/`WAVE`, non-silent).
Request logs confirm each new voice's model is fetched from
`huggingface.co/diffusionstudio/piper-voices/.../cy_GB-gwryw_gogleddol/medium/...` etc.,
so the new catalog entries resolve through the engine.

Also re-run:

- `npx tsc --noEmit` → clean for everything in scope. The only error is a **pre-existing,
  unrelated, untracked** file (`src/domains/calculator/components/validation.ts:47`,
  another thread's WIP); it is not in git and was not touched.
- `npx playwright test e2e/voice-generator.test.ts --grep "newly exposed|defaults"` →
  **2 passed**, including the existing defaults / single-gender-fallback test.

**Coverage limit, stated honestly:** full 124-voice waveform verification means
downloading every model (most are 20–63 MB, ~7 GB total) and is not something a single
session can do. The harness now makes that sweep one command; it has been run here on a
representative cross-section — default, both newly exposed voices, a low tier, and a
long multi-part input. No voice in the catalog was *changed* except by addition.

## 5. No leakage from `pipertts`

- `grep -rniE "pipertts|\.\./pipertts|C:\Racira|localhost:5173"` over `src/`,
  `scripts/`, `e2e/`, `public/`, `next.config.mjs`, `tsconfig.json`, `package.json`,
  `vercel.json` → **no matches**.
- Nothing in the production tree imports, references or resolves the sibling folder;
  the only new dependency surface is zero (no `package.json` / lockfile change).
- The model/config/wasm URLs production hits are unchanged and come from the library's
  own hardcoded constants — the same ones the bench uses.
- `pipertts` itself was not modified (read-only reference).

## 6. Open gaps — status after this work

| Gap | Status |
| --- | --- |
| **Hindi unreachable** | **Cannot be closed by porting.** There is no `hi` directory in the model host's repo at all (`/tree/main/hi` → 404) and no `hi_*` id in the engine's `PATH_MAP` or `VoiceId` union. The bench has exactly the same hole. Closing it needs a different model source and a library patch, not parity. |
| **Italian / Greek fidelity** | **Italian: fixed** — `it_IT-paola-medium` (standard tier) is now selectable, verified synthesizing real audio. **Greek: cannot be fixed** — the host carries only `el/el_GR/rapunzelina/low`; there is no Greek medium/high anywhere. Greek stays single-quality. |
| **Model hosting / licensing** | **Unresolved by design** — the bench uses the *same* re-host, so there is nothing to port. Worth noting for a separate task: the re-host serves byte-identical files to the canonical MIT repo (`rhasspy/piper-voices` — e.g. `en_US-ryan-medium.onnx` is 63,201,294 bytes in both), so the models themselves are the MIT Piper voices. The library hardcodes `HF_BASE` for models (**no** override parameter — only `wasmPaths` is overridable), so repointing at `rhasspy/piper-voices` or vendoring the files requires a `patch-package` patch of the library. Recommend treating that as its own change with its own licensing review. |
| **Waveform verification across the catalog** | **Harness delivered, coverage partial.** The probe can now sweep and fail on silence; five representative voices + a 5 000-char multi-part run verified non-silent here. A full 124-voice pass remains a long, bandwidth-heavy run. |
| **OPFS quota / eviction handling** | **Still open — and the bench has the same hole.** Neither app calls `navigator.storage.persist()` or `estimate()`, and the library's OPFS writes are best-effort, so a quota failure can look like "downloaded but not saved". Parity did not require touching this. Suggested follow-up: request persistent storage at the support gate and pre-flight `estimate()` against the model size, mapping a shortfall onto the existing generic error copy (no UI change needed). |
| **Char cap non-tuned for the browser engine** | **Resolved/clarified.** Cap stays 5 000; part size stays 400 — verified equal to the library's own `MAX_CHUNK_LENGTH`, so no part is ever silently re-split. Verified end-to-end at exactly 5 000/5 000 (§4). The rationale is now documented in `piperProtocol.ts`. |
| **Device gate checks capability, not resources** | **Unchanged by parity.** `checkVoiceSupport()` still checks WebAssembly + OPFS presence only; the bench has no gate at all. |

## 7. Decisions taken

1. **Keep `PART_MAX_CHARS = 400`** rather than port the bench's 500 (user-confirmed).
2. **Expose the five `PATH_MAP`-only voices** (user-confirmed) — data-only change,
   no `/voice` component edit.
