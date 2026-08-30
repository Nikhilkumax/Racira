# Bento Tool Conversion Tier Plan

## Summary

| Tier | Sub-tier | Table entries | Remaining unwired | Effort/tool | Pilot reference |
|------|----------|--------------|-------------------|-------------|------------------|
| **EASY** | A: Clean utilities | 11 | 3 | ~30 min | comic-info, sanitize-pdf, flatten-annotations |
| **EASY** | B: Simple page controllers | 27 | 12 | ~1 hr | bates-numbering, background-color |
| **EASY** | C: Canvas/heavy DOM | 5 | 2 | ~2-3 hrs | text-color, add-watermark |
| **EASY** | **Total** | **43** | **17** | | |
| **MEDIUM** | | 41 | TBD | |
| **HARD** | | 50 | TBD | |
| **EXCLUDED** | | 3 | - | |

---

## EASY Tier — Corrected 3-Sub-Tier Breakdown

**Updated August 23, 2026** after piloting 6 tools. DOM entanglement (not WASM) is the real cost driver.

### Sub-tier A: Clean Utility Files (~30 min each)

Pure logic, zero DOM references. Direct extraction, no rewriting needed.

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `utils/rotation-utils.ts` | 17 | ✅ converted | clamp/round/parseAngle — pure math |
| `utils/deduplicate-filename.ts` | 28 | ✅ converted | filename dedup logic |
| `utils/rotation-state.ts` | 23 | ✅ converted | rotation state array |
| `utils/map-upsert-polyfill.ts` | 47 | ✅ converted | Map.prototype.upsert |
| `utils/safe-storage.ts` | 25 | ✅ converted | localStorage wrapper |
| `utils/comic-info.ts` | 190 | ✅ wired | ComicInfo XML generation — **pilot ref** |
| `utils/sanitize.ts` | 645 | ✅ wired | PDF sanitization — **pilot ref** |
| `utils/flatten-annotations.ts` | 175 | ✅ wired | Annotation flattening — **pilot ref** |
| `utils/page-labels.ts` | 57 | not wired | Page label style resolver |
| `utils/hocr-transform.ts` | 303 | not wired | HOCR text transform |
| `utils/split-pdf-helpers.ts` | 148 | not wired | Split range parsing |

**Remaining unwired:** page-labels, hocr-transform, split-pdf-helpers (~3 tools)

### Sub-tier B: Simple Page Controllers (~1 hr each)

DOM present but processing logic is a self-contained loop (load → transform → save). Extract the core loop, discard DOM wiring.

| File | Lines | DOM refs | Status | Notes |
|------|-------|----------|--------|-------|
| `logic/background-color-page.ts` | 149 | 19 | ✅ wired | Rectangle + embed — **pilot ref** |
| `logic/bates-numbering-page.ts` | 541 | 42 | ✅ wired | Text stamp loop — **pilot ref** |
| `logic/timestamp-pdf-page.ts` | 234 | 9 | not wired | Date stamp (lightest DOM) |
| `logic/extract-pages-page.ts` | 220 | 19 | overlap | Already in Racira registry |
| `logic/delete-pages-page.ts` | 291 | 31 | overlap | Already wired |
| `logic/reverse-pages-page.ts` | 201 | 16 | overlap | Already in Racira registry |
| `logic/remove-metadata-page.ts` | 222 | 19 | overlap | Already in Racira registry |
| `logic/edit-metadata-page.ts` | 435 | 43 | overlap | Already in Racira registry |
| `logic/invert-colors-page.ts` | 169 | 19 | overlap | Already in Racira registry |
| `logic/page-numbers-page.ts` | 188 | 22 | overlap | Already in Racira registry |
| `logic/add-blank-page-page.ts` | 246 | 22 | overlap | Insert blank pages — near-dup of `insert-blank-pages` |
| `logic/rotate-pdf-page.ts` | 340 | 27 | overlap | Near-dup of `rotate` |
| `logic/rotate-custom-page.ts` | 417 | 32 | not wired | Custom angle rotation |
| `logic/n-up-pdf-page.ts` | 287 | 24 | overlap | Near-dup of `n-up-layout` |
| `logic/organize-pdf-page.ts` | 391 | 36 | overlap | Near-dup of `organize-pages` |
| `logic/header-footer-page.ts` | 250 | 28 | overlap | Near-dup of `headers-footers` |
| `logic/divide-pages-page.ts` | 248 | 20 | not wired | Split by range |
| `logic/duplicate-organize.ts` | 220 | 15 | not wired | Duplicate/rearrange pages |
| `logic/combine-single-page-page.ts` | 328 | 25 | not wired | Merge single pages |
| `logic/png-to-pdf-page.ts` | 250 | 18 | not wired | PNG → PDF |
| `logic/tiff-to-pdf-page.ts` | 228 | 19 | not wired | TIFF → PDF |
| `logic/webp-to-pdf-page.ts` | 250 | 18 | not wired | WebP → PDF |
| `logic/xml-to-pdf-page.ts` | 182 | 15 | not wired | XML → PDF |
| `logic/txt-to-pdf-page.ts` | 263 | 28 | not wired | TXT → PDF |
| `logic/zip-to-pdf-page.ts` | — | — | ⚠ no-source | ZIP → PDF — no Bento source file |
| `logic/pages-to-pdf-page.ts` | 192 | 16 | not wired | Apple Pages → PDF (LibreOffice)
| `logic/pdf-booklet-page.ts` | 602 | 30 | not wired | Booklet layout |

**Remaining unwired (not overlapping Racira):** timestamp-pdf, rotate-custom, divide-pages, duplicate-organize, combine-single-page, png-to-pdf, tiff-to-pdf, webp-to-pdf, xml-to-pdf, txt-to-pdf, pages-to-pdf, pdf-booklet (~12 tools)

### Sub-tier C: Canvas/Heavy DOM (~2-3 hrs each)

Processing requires canvas rendering (pdfjs-dist → canvas → pixel manipulation → PNG → pdf-lib). Full rewrite of the rendering pipeline; cannot reuse the page controller at all.

| File | Lines | DOM refs | Status | Notes |
|------|-------|----------|--------|-------|
| `logic/text-color-page.ts` | 191 | 20 | ✅ wired | Rasterize + recolor dark pixels — **pilot ref** |
| `logic/posterize-page.ts` | 487 | 45 | not wired | Poster grid effect (canvas preview + pdf-lib tiling) |
| `logic/scanner-effect-page.ts` | 434 | 37 | not wired | Scan-line + noise overlay (canvas pixel ops) |
| `logic/add-watermark-page.ts` | 1268 | 126 | ✅ wired | Pilot batch — Racira already had native impl |
| `logic/crop-pdf-page.ts` | 423 | 29 | overlap | Near-dup of `crop-pages` |

**Remaining unwired (not overlapping Racira):** posterize, scanner-effect (~2 tools)

### Excluded from EASY (moved to other tiers or excluded)

| File | Reason |
|------|--------|
| `logic/shortcuts.ts` | App shell — keyboard shortcut UI |
| `logic/edit-pdf-text-dock.ts` | App shell — text editing dock UI |
| `logic/form-creator-extraction.ts` | App shell — form creator UI |
| `utils/page-preview.ts` | Has DOM refs (canvas rendering for thumbnails) |
| `utils/font-loader.ts` | Has DOM refs (IndexedDB font storage) |

### Migration Effort Estimate (EASY tier only)

| Sub-tier | Remaining tools | Effort/tool | Total |
|----------|----------------|-------------|-------|
| A: Clean utilities | 3 | ~30 min | ~1.5 hrs |
| B: Simple page controllers | 12 | ~1 hr | ~12 hrs |
| C: Canvas/heavy DOM | 2 | ~2-3 hrs | ~4-6 hrs |
| **Total remaining** | **17** | | **~17-20 hrs** |

---

## MEDIUM Tier (41 tools) — No WASM, Complex Dependencies

These tools require adapters for state management, i18n, or have transitive dependencies.

### State + UI Dependencies
- `compress-pdf-page.ts` — Uses state.js
- `csv-to-pdf-page.ts` — Uses state.js
- `duplicate-organize.ts` — Uses state.js
- `email-to-pdf-page.ts` — Uses state.js
- `excel-to-pdf-page.ts` — Uses state.js
- `merge-pdf-page.ts` — Uses state.js
- `mobi-to-pdf-page.ts` — Uses state.js
- `odg-to-pdf-page.ts` — Uses state.js
- `odp-to-pdf-page.ts` — Uses state.js
- `ods-to-pdf-page.ts` — Uses state.js
- `odt-to-pdf-page.ts` — Uses state.js
- `powerpoint-to-pdf-page.ts` — Uses state.js
- `rtf-to-pdf-page.ts` — Uses state.js
- `word-to-pdf-page.ts` — Uses state.js

### i18n Dependencies
- `adjust-colors-page.ts` — Uses i18n
- `digital-sign-pdf-page.ts` — Uses i18n
- `json-to-pdf.ts` — Uses i18n
- `pdf-to-bmp-page.ts` — Uses i18n
- `pdf-to-cbz-page.ts` — Uses i18n
- `pdf-to-greyscale-page.ts` — Uses i18n
- `pdf-to-jpg-page.ts` — Uses i18n
- `pdf-to-markdown-page.ts` — Uses i18n
- `pdf-to-png-page.ts` — Uses i18n
- `pdf-to-webp-page.ts` — Uses i18n
- `timestamp-pdf-page.ts` — Uses i18n

### Complex Dependencies
- `add-stamps.ts` — Missing lucide package
- `form-filler-page.ts` — Missing lucide package
- `remove-annotations-page.ts` — Missing lucide package
- `remove-blank-pages-page.ts` — Missing lucide package
- `redact.ts` — Uses state.js + @/types
- `repair-pdf.ts` — Uses state.js + @/types
- `sanitize-pdf-page.ts` — Uses @/types
- `validate-signature-pdf.ts` — Uses @/types
- `digital-sign-pdf.ts` — Uses @/types
- `email-to-pdf.ts` — Uses @/types
- `bookmark-pdf.ts` — Uses @/types
- `fix-page-size-page.ts` — Uses @/types
- `linearize-pdf-page.ts` — Uses @/types

---

## HARD Tier (50 tools) — WASM Required

These tools require WASM binary loading and must use lazy-loading from day one.

### Ghostscript WASM
- `compress-pdf-page.ts` — Ghostscript compression
- `pdf-to-greyscale-page.ts` — Ghostscript grayscale
- `pdf-to-pdfa-page.ts` — Ghostscript PDF/A conversion
- `sanitize-pdf-page.ts` — Ghostscript sanitization

### PyMuPDF WASM
- `pdf-to-docx-page.ts` — PyMuPDF conversion
- `pdf-to-markdown-page.ts` — PyMuPDF conversion
- `pdf-to-tiff-page.ts` — PyMuPDF conversion
- `pdf-to-svg-page.ts` — PyMuPDF conversion

### CoherentPDF WASM
- `alternate-merge-page.ts` — CoherentPDF merge
- `merge-pdf-page.ts` — CoherentPDF merge
- `compress-pdf-page.ts` — CoherentPDF compression

### pdfium WASM
- `edit-pdf-page.ts` — pdfium editor
- `edit-pdf-text-page.ts` — pdfium text editing
- `edit-attachments-page.ts` — pdfium attachments

### LibreOffice WASM
- `email-to-pdf-page.ts` — LibreOffice conversion
- `excel-to-pdf-page.ts` — LibreOffice conversion
- `powerpoint-to-pdf-page.ts` — LibreOffice conversion
- `word-to-pdf-page.ts` — LibreOffice conversion

### wasm-vips WASM
- `pdf-to-tiff-page.ts` — wasm-vips conversion

### Complex WASM Chains
- `add-attachments-page.ts` — pdfium + state
- `add-page-labels-page.ts` — Ghostscript + i18n
- `cbz-to-pdf-page.ts` — Ghostscript + state
- `change-permissions-page.ts` — pdfium + state
- `deskew-pdf-page.ts` — PyMuPDF + @/types
- `encrypt-pdf-page.ts` — pdfium + state
- `extract-attachments-page.ts` — pdfium + state
- `extract-images-page.ts` — Ghostscript + i18n + state
- `font-to-outline-page.ts` — Ghostscript + state
- `json-to-pdf.ts` — CoherentPDF + i18n
- `linearize-pdf-page.ts` — Ghostscript + @/types
- `ocr-pdf-page.ts` — Tesseract.js + i18n
- `pdf-layers-page.ts` — Ghostscript + i18n
- `prepare-pdf-for-ai-page.ts` — Ghostscript + i18n + state
- `psd-to-pdf-page.ts` — Ghostscript + state
- `rasterize-pdf-page.ts` — Ghostscript + i18n + state
- `split-pdf-page.ts` — CoherentPDF + i18n + state
- `table-of-contents.ts` — CoherentPDF + i18n
- `wasm-settings-page.ts` — Ghostscript + i18n

---

## EXCLUDED (3 tools) — Out of Scope

These tools are part of Bento's app shell and should not be converted:

- `pdf-workflow-page.ts` — Rete.js workflow editor
- `compare-render.ts` — Needs `diff` package
- `markdown-to-pdf-page.ts` — Needs markdown-editor (blocked)

---

## Conversion Order

1. **Phase 1 (EASY)**: Convert 45 EASY tools using adapter pattern
2. **Phase 2 (MEDIUM)**: Convert 41 MEDIUM tools with state/i18n stubs
3. **Phase 3 (HARD)**: Convert 50 HARD tools with WASM lazy-loading
4. **Phase 4 (WIRING)**: Wire adapters to processFiles dispatcher

---

## Verification Requirements

Each converted tool must:
1. Have a corresponding adapter in `src/domains/pdf/lib/bento/adapters/`
2. Pass `tsc --noEmit` with zero errors
3. Be tested with a real PDF file
4. Be tracked in the manifest

---

## WASM Lazy-Loading Strategy

All WASM modules must use the existing lazy-loading pattern:

```typescript
// In src/lib/utils/lazyComponents.tsx
export const loadGhostscriptWasm = () => import('./wasm/ghostscript.wasm');
export const loadPyMuPdfWasm = () => import('./wasm/pymupdf.wasm');
// ... etc
```

Never add WASM imports eagerly — always lazy-load.
