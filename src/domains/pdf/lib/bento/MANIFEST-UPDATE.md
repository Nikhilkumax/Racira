# BentoPDF → Racira Extraction Manifest

**Generated:** 2026-08-23
**Phase:** Conversion + Adapter Infrastructure
**Destination:** `src/domains/pdf/lib/bento/`

## Summary (updated after infrastructure setup)

| Category | Count |
|----------|-------|
| Converted (phase 1) | 26 |
| Converted (phase 2 — @/types resolved) | 9 |
| **Total converted** | **35** |
| Still blocked | 157 |
| **Total files scanned** | **190** |
| Shims added | 2 (ui.ts, types/) |
| **New: Adapter infrastructure** | 4 files |
| **New: WASM lazy-loading** | 1 file |
| **New: Verification tests** | 1 file |
| **New: Tool diff report** | 1 file |
| **New: Tier plan** | 1 file |

---

## NEW: Adapter Infrastructure (4 files)

| File | Purpose | Status |
|------|---------|--------|
| `adapters/adapter-pattern.md` | Documentation for adapter pattern | ✅ Created |
| `adapters/adapter-pattern.ts` | TypeScript interfaces (BentoAdapter, BentoInput, BentoResult) | ✅ Created |
| `adapters/registry.ts` | Adapter registry (registerBentoAdapter, getBentoAdapter, hasBentoAdapter) | ✅ Created |
| `adapters/index.ts` | Barrel export for adapters | ✅ Created |

### Adapter Pattern Summary

Each Bento tool is wrapped in a thin adapter that:
1. Translates Racira's `ToolOptions` → Bento's `BentoInput`
2. Translates Bento's `BentoResult` → Racira's `ProcessResult`
3. Isolates Bento quirks to a single file

---

## NEW: WASM Lazy-Loading (1 file)

| File | Purpose | Status |
|------|---------|--------|
| `wasm/lazy-wasm.ts` | Central WASM lazy-loading infrastructure | ✅ Created |

### WASM Modules Supported

| Module | Loader Function | Status |
|--------|-----------------|--------|
| Ghostscript | `loadGhostscriptWasm()` | ✅ Defined |
| PyMuPDF | `loadPyMuPdfWasm()` | ✅ Defined |
| pdfium | `loadPdfiumWasm()` | ✅ Defined |
| CoherentPDF | `loadCoherentPdfWasm()` | ✅ Defined |
| wasm-vips | `loadVipsWasm()` | ✅ Defined |
| LibreOffice | `loadLibreOfficeWasm()` | ✅ Defined |
| Tesseract.js | `loadTesseractWorker()` | ✅ Defined |

---

## NEW: Verification Tests (1 file)

| File | Purpose | Status |
|------|---------|--------|
| `__tests__/verify-bento-tools.ts` | Per-tool verification with real PDF files | ✅ Created |

### Test Coverage

- **EASY Tier**: 8 tests (insert-blank-pages, add-watermark, crop-pages, etc.)
- **MEDIUM Tier**: 3 tests (edit-metadata, remove-metadata, invert-colors)
- **HARD Tier**: Not yet implemented (requires WASM)

---

## NEW: Tool Diff Report (1 file)

| File | Purpose | Status |
|------|---------|--------|
| `tool-diff-report.json` | Comparison of Bento vs Racira tool lists | ✅ Created |

### Key Findings

- **Racira registry**: 212 slugs
- **processFiles wired**: 231 slugs
- **Bento logic files**: 132 tools
- **Overlap**: 30 tools (29 already wired, 1 not yet wired)
- **Bento-only**: 96 tools (new from Bento)
- **Racira-only**: 182 tools (existing Racira tools)

---

## NEW: Tier Plan (1 file)

| File | Purpose | Status |
|------|---------|--------|
| `BENTO-TIER-PLAN.md` | Tool conversion tiers (EASY/MEDIUM/HARD) | ✅ Created |

### Tier Summary

| Tier | Count | WASM | Strategy |
|------|-------|------|----------|
| **EASY** | 45 | 0 | Direct conversion, adapter pattern |
| **MEDIUM** | 41 | 0 | Conversion with adapters + i18n/state stubs |
| **HARD** | 50 | 18 | WASM lazy-loading, complex adapters |
| **EXCLUDED** | 3 | - | Workflow editor, viewer — out of scope |
| **Total** | 139 | 18 | |

---

## Converted Files (35)

| Bento Source Path | Racira Destination | Status | WASM | Notes |
|---|---|---|---|---|
| `utils/deduplicate-filename.ts` | `utils/deduplicate-filename.ts` | converted | n | Pure logic, zero imports |
| `utils/full-width.ts` | `utils/full-width.ts` | converted | n | Pure logic, DOM APIs only |
| `utils/image-compress.ts` | `utils/image-compress.ts` | converted | n | Canvas-based, no npm deps |
| `utils/map-upsert-polyfill.ts` | `utils/map-upsert-polyfill.ts` | converted | n | Map prototype polyfill |
| `utils/rotation-state.ts` | `utils/rotation-state.ts` | converted | n | Pure logic, zero imports |
| `utils/rotation-utils.ts` | `utils/rotation-utils.ts` | converted | n | Pure logic, zero imports |
| `utils/safe-storage.ts` | `utils/safe-storage.ts` | converted | n | localStorage wrapper |
| `utils/tiff-utils.ts` | `utils/tiff-utils.ts` | converted | n | TIFF IFD→RGBA conversion |
| `utils/font-loader.ts` | `utils/font-loader.ts` | converted | n | VITE_FIX: `import.meta.env` → `process.env` |
| `utils/tesseract-language-availability.ts` | `utils/tesseract-language-availability.ts` | converted | n | VITE_FIX: `import.meta.env` → `process.env` |
| `config/font-mappings.ts` | `config/font-mappings.ts` | converted | n | Pulled as dependency for font-loader |
| `config/tesseract-languages.ts` | `config/tesseract-languages.ts` | converted | n | Pulled as dependency for tesseract-language-availability |
| `editcore/shadingsurgery.js` | `editcore/shadingsurgery.js` | converted | n | PDF shading/pattern surgery, zero imports |
| `editcore/tagsurgery.js` | `editcore/tagsurgery.js` | converted | n | PDF tag structure surgery, zero imports |
| `editcore/streamsplice.js` | `editcore/streamsplice.js` | converted | n | Text editing operations; imports shadingsurgery.js |
| `editcore/type3surgery.js` | `editcore/type3surgery.js` | converted | n | Type3 font protection; imports shadingsurgery.js |
| `compare/config.ts` | `compare/config.ts` | converted | n | Compare engine constants, zero imports |
| `compare/lru-cache.ts` | `compare/lru-cache.ts` | converted | n | Generic LRU cache, zero imports |
| `compare/types.ts` | `compare/types.ts` | converted | n | Compare engine type definitions |
| `compare/engine/text-normalization.ts` | `compare/engine/text-normalization.ts` | converted | n | Text normalization for comparison |
| `compare/engine/pair-pages.ts` | `compare/engine/pair-pages.ts` | converted | n | Page pairing algorithm |
| `compare/engine/compare-content.ts` | `compare/engine/compare-content.ts` | converted | n | Change classification |
| `compare/engine/extract-page-model.ts` | `compare/engine/extract-page-model.ts` | converted | n | Page model extraction |
| `compare/engine/page-signatures.ts` | `compare/engine/page-signatures.ts` | converted | n | Page signature generation |
| `logic/edit-pdf-text-dock.ts` | `logic/edit-pdf-text-dock.ts` | converted | n | Text editing dock UI logic |
| `logic/scan-to-pdf.ts` | `logic/scan-to-pdf.ts` | converted | n | Legacy stub (5 lines) |
| `logic/shortcuts.ts` | `logic/shortcuts.ts` | converted | n | Keyboard shortcuts logic |
| `logic/form-creator-extraction.ts` | `logic/form-creator-extraction.ts` | converted | n | Form field extraction |
| `utils/comic-info.ts` | `utils/comic-info.ts` | converted | n | CBZ comic metadata |
| `utils/cpdf-helper.ts` | `utils/cpdf-helper.ts` | converted | y | CoherentPDF helper |
| `utils/hocr-transform.ts` | `utils/hocr-transform.ts` | converted | n | HOCR text transform |
| `utils/page-labels.ts` | `utils/page-labels.ts` | converted | n | PDF page labels |
| `utils/page-preview.ts` | `utils/page-preview.ts` | converted | n | Page thumbnail preview |
| `utils/pdf-decrypt.ts` | `utils/pdf-decrypt.ts` | converted | y | PDF decryption |
| `utils/split-pdf-helpers.ts` | `utils/split-pdf-helpers.ts` | converted | n | Split PDF helpers |

---

## Blocked Files — Excluded Area Imports (145 files)

These files import from BentoPDF's app shell (`../ui.js`, `../state.js`), i18n (`../i18n/*`), workflow editor (`../workflow/*`, `@/js/workflow/*`), app viewer (`bentopdf-viewer`), or type barrel (`@/types`).

### Blocker Categories

| Blocker | Files | Next Phase Action |
|---------|-------|-------------------|
| `../ui.js` (app shell) | ~100 | Create UI adapter in wiring phase |
| `@/types` (BentoPDF type barrel) | ~60 | Pull `types/` directory or create equivalent interfaces |
| `../state.js` (app state) | ~30 | Create state adapter |
| `../i18n/*` (internationalization) | ~20 | Create i18n adapter |
| Missing npm package | 14 | Install packages or create type stubs |
| `../workflow/*` (Rete.js editor) | 2 | Out of scope — workflow UI excluded |
| `bentopdf-viewer` (app viewer) | 1 | Out of scope — app shell excluded |

---

## WASM-Flagged Files (require lazy-loading later)

Files that load WASM binaries directly (Ghostscript, PyMuPDF, pdfium, qpdf, LibreOffice, wasm-vips):

| Source | WASM Type |
|---|---|
| `utils/ghostscript-loader.ts` | Ghostscript WASM |
| `utils/ghostscript-dynamic-loader.ts` | Ghostscript WASM (dynamic) |
| `utils/pymupdf-loader.ts` | PyMuPDF WASM |
| `utils/wasm-provider.ts` | WASM URL manager |
| `utils/wasm-preloader.ts` | WASM preloader |
| `utils/compress.ts` | Uses PyMuPDF WASM |
| `utils/cpdf-helper.ts` | CoherentPDF WASM |
| `utils/merge-cpdf.ts` | CoherentPDF WASM |
| `utils/alternate-merge.ts` | CoherentPDF WASM |
| `utils/libreoffice-loader.ts` | LibreOffice WASM |
| `editcore/engine-loader.js` | pdfium WASM |
| `logic/pdf-to-tiff-page.ts` | wasm-vips WASM |
| Various `logic/*-page.ts` | Ghostscript/PyMuPDF WASM |

---

## Verification Results

- ✅ `tsc --noEmit` — zero errors in bento/ files (35 source files + 42 types + shims)
- ✅ Zero cross-domain imports
- ✅ Zero imports reaching back to BentoPDF paths
- ✅ Zero `any`, `@ts-ignore`, or suppression tricks
- ✅ Zero Vite syntax remaining (`import.meta.env`, `?url`, `?raw`, `?worker`)
- ✅ All WASM-loading files flagged for lazy-load in wiring phase
- ✅ ui.ts shim provides showLoader/hideLoader/showAlert/hideAlert/renderFileDisplay via sonner + DOM
- ✅ types/ directory provides 42 type definition files with minimal stubs for missing packages
- ✅ **NEW**: Adapter infrastructure created (adapter-pattern.ts, registry.ts)
- ✅ **NEW**: WASM lazy-loading infrastructure created (lazy-wasm.ts)
- ✅ **NEW**: Verification tests created (verify-bento-tools.ts)
- ✅ **NEW**: Tool diff report generated (tool-diff-report.json)
- ✅ **NEW**: Tier plan documented (BENTO-TIER-PLAN.md)

---

## Shims

| Shim | Path | Provides |
|------|------|----------|
| UI shim | `shims/ui.ts` | `showLoader`, `hideLoader`, `showAlert`, `hideAlert`, `renderFileDisplay` — backed by sonner toast + DOM overlay |
| Types barrel | `types/` | 42 type definition files covering all BentoPDF tool state types |

---

## Next Phase: Still-Blocked Files (157)

The dominant remaining blockers are:

| Blocker | Files | Next Phase Action |
|---------|-------|-------------------|
| `transitive` (imports from blocked utils) | 138 | Convert the blocking utils first, or create adapters |
| `missing_pkg` (npm packages not in Racira) | 129 | Install packages or create type stubs |
| `vite` (`import.meta.env`) | 124 | Replace with `process.env` during conversion |
| `state` (`../state.js`) | 39 | Create state adapter |
| `i18n` (`../i18n/*`) | 30 | Create i18n adapter |
| `workflow` (Rete.js, excluded) | 3 | Out of scope |
| `excluded_digital_sign` | 2 | Excluded per rules |
| `viewer` (bentopdf-viewer, excluded) | 1 | Out of scope |

---

## Priority: Wire delete-pages (1 tool not yet wired)

The tool diff report shows 1 overlap that is NOT YET WIRED in processFiles:

| Racira Slug | Bento File | Status |
|-------------|------------|--------|
| `delete-pages` | `delete-pages-page.ts` | NOT WIRED |

**Action**: Wire `delete-pages` to use Bento adapter in processFiles dispatcher.
