# BentoPDF → Racira Extraction Manifest

**Generated:** 2026-08-23
**Phase:** Conversion only — no wiring, no adapters, no dispatcher changes
**Destination:** `src/domains/pdf/lib/bento/`

## Summary (updated after re-audit)

| Category | Count |
|----------|-------|
| Converted (phase 1) | 26 |
| Converted (phase 2 — @/types resolved) | 9 |
| **Total converted** | **35** |
| Still blocked | 157 |
| **Total files scanned** | **190** |
| Shims added | 2 (ui.ts, types/) |

### Re-audit: Shim Impact

- **ui.js shim** (`shims/ui.ts`): Resolves `showLoader`/`hideLoader`/`showAlert`/`hideAlert`/`renderFileDisplay` for ~100 logic files. These files still have OTHER blockers (state, i18n, transitive, vite, missing packages).
- **@/types barrel** (`types/`): Resolves type imports for ~60 files. 9 files had @/types as their ONLY blocker — they are now converted.
- **Remaining blockers**: `state.js` (39 files), `i18n` (30 files), `missing_pkg` (129 files), `vite` (124 files), `transitive` (138 files), `workflow` (3 files, excluded).

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
| `utils/font-loader.ts` | `utils/font-loader.ts` | converted | n | VITE_FIX: `import.meta.env` → `process.env`; imports `config/font-mappings` |
| `utils/tesseract-language-availability.ts` | `utils/tesseract-language-availability.ts` | converted | n | VITE_FIX: `import.meta.env` → `process.env`; imports `config/tesseract-languages` |
| `config/font-mappings.ts` | `config/font-mappings.ts` | converted | n | Pulled as dependency for font-loader |
| `config/tesseract-languages.ts` | `config/tesseract-languages.ts` | converted | n | Pulled as dependency for tesseract-language-availability |
| `editcore/shadingsurgery.js` | `editcore/shadingsurgery.js` | converted | n | PDF shading/pattern surgery, zero imports |
| `editcore/tagsurgery.js` | `editcore/tagsurgery.js` | converted | n | PDF tag structure surgery, zero imports |
| `editcore/streamsplice.js` | `editcore/streamsplice.js` | converted | n | Text editing operations; imports shadingsurgery.js |
| `editcore/type3surgery.js` | `editcore/type3surgery.js` | converted | n | Type3 font protection; imports shadingsurgery.js |
| `compare/config.ts` | `compare/config.ts` | converted | n | Compare engine constants, zero imports |
| `compare/lru-cache.ts` | `compare/lru-cache.ts` | converted | n | Generic LRU cache, zero imports |
| `compare/types.ts` | `compare/types.ts` | converted | n | Compare engine type definitions; imports lru-cache + pdfjs-dist |
| `compare/engine/text-normalization.ts` | `compare/engine/text-normalization.ts` | converted | n | Text normalization for comparison; imports types |
| `compare/engine/pair-pages.ts` | `compare/engine/pair-pages.ts` | converted | n | Page pairing algorithm; imports types + text-normalization |
| `compare/engine/compare-content.ts` | `compare/engine/compare-content.ts` | converted | n | Change classification; imports types |
| `compare/engine/extract-page-model.ts` | `compare/engine/extract-page-model.ts` | converted | n | Page model extraction; imports types, text-normalization, config, pdfjs-dist |
| `compare/engine/page-signatures.ts` | `compare/engine/page-signatures.ts` | converted | n | Page signature generation; imports types, text-normalization, pdfjs-dist |
| `logic/edit-pdf-text-dock.ts` | `logic/edit-pdf-text-dock.ts` | converted | n | Text editing dock UI logic, zero imports |
| `logic/scan-to-pdf.ts` | `logic/scan-to-pdf.ts` | converted | n | Legacy stub (5 lines), zero imports |
| `logic/shortcuts.ts` | `logic/shortcuts.ts` | converted | n | Keyboard shortcuts logic; @/types → ../types |
| `logic/form-creator-extraction.ts` | `logic/form-creator-extraction.ts` | converted | n | Form field extraction; @/types → ../types |
| `utils/comic-info.ts` | `utils/comic-info.ts` | converted | n | CBZ comic metadata; @/types → ../types |
| `utils/cpdf-helper.ts` | `utils/cpdf-helper.ts` | converted | y | CoherentPDF helper; @/types → ../types |
| `utils/hocr-transform.ts` | `utils/hocr-transform.ts` | converted | n | HOCR text transform; @/types → ../types |
| `utils/page-labels.ts` | `utils/page-labels.ts` | converted | n | PDF page labels; @/types → ../types |
| `utils/page-preview.ts` | `utils/page-preview.ts` | converted | n | Page thumbnail preview; @/types → ../types |
| `utils/pdf-decrypt.ts` | `utils/pdf-decrypt.ts` | converted | y | PDF decryption; @/types → ../types |
| `utils/split-pdf-helpers.ts` | `utils/split-pdf-helpers.ts` | converted | n | Split PDF helpers; @/types → ../types |

## Blocked Files — Excluded Area Imports (145 files)

These files import from BentoPDF's app shell (`../ui.js`, `../state.js`), i18n (`../i18n/*`), workflow editor (`../workflow/*`, `@/js/workflow/*`), app viewer (`bentopdf-viewer`), or type barrel (`@/types`).

### logic/ (139 blocked)

| Bento Source | WASM | Blocked By |
|---|---|---|
| `logic/add-attachments-page.ts` | y | `@/types`, `../ui.js` |
| `logic/add-blank-page-page.ts` | n | `../ui.js`, `@/types` |
| `logic/add-page-labels-page.ts` | y | `@/types`, `../ui.js`, `../i18n/index.js` |
| `logic/add-stamps.ts` | n | `lucide` (missing pkg) |
| `logic/add-watermark-page.ts` | n | `../ui.js`, `@/types` |
| `logic/adjust-colors-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/alternate-merge-page.ts` | y | `@/types`, `../ui.js` |
| `logic/background-color-page.ts` | n | `../ui.js`, `@/types` |
| `logic/bates-numbering-page.ts` | n | `../ui.js`, `@/types` |
| `logic/bmp-to-pdf-page.ts` | n | `../ui.js` |
| `logic/bookmark-pdf.ts` | n | `@/types` |
| `logic/cbz-to-pdf-page.ts` | y | `../ui.js`, `../state.js`, `@/types` |
| `logic/change-permissions-page.ts` | n | `../ui.js`, `@/types` |
| `logic/combine-single-page-page.ts` | n | `../ui.js`, `@/types` |
| `logic/compare-pdfs-page.ts` | n | `../ui.ts`, `@/types` |
| `logic/compress-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/crop-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/cropper.ts` | n | `../ui.js`, `../state.js`, `@/types` |
| `logic/csv-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/decrypt-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/delete-pages-page.ts` | n | `../ui.js`, `@/types` |
| `logic/deskew-pdf-page.ts` | y | `@/types` |
| `logic/digital-sign-pdf-page.ts` | n | `../ui.js`, `../i18n/i18n`, `@/types` |
| `logic/digital-sign-pdf.ts` | n | `@/types` |
| `logic/divide-pages-page.ts` | n | `@/types`, `../ui.js` |
| `logic/duplicate-organize.ts` | n | `../ui.js`, `../state.js` |
| `logic/edit-attachments-page.ts` | y | `@/types`, `../ui.js` |
| `logic/edit-metadata-page.ts` | n | `@/types`, `../ui.js` |
| `logic/edit-pdf-page.ts` | n | `../ui.js`, `bentopdf-viewer`, `@/types` |
| `logic/edit-pdf-text-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/email-to-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/email-to-pdf.ts` | n | `@/types` |
| `logic/encrypt-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/epub-to-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/excel-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/extract-attachments-page.ts` | y | `../ui.js` |
| `logic/extract-images-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js` |
| `logic/extract-pages-page.ts` | n | `../ui.js` |
| `logic/extract-tables-page.ts` | y | `../ui.js` |
| `logic/fb2-to-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/fix-page-size-page.ts` | n | `../ui.js`, `@/types` |
| `logic/flatten-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/font-to-outline-page.ts` | y | `../ui.js` |
| `logic/form-creator-extraction.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `logic/form-creator.ts` | n | `@/types` |
| `logic/form-filler-page.ts` | n | `lucide` (missing pkg) |
| `logic/header-footer-page.ts` | n | `../ui.js`, `@/types` |
| `logic/heic-to-pdf-page.ts` | n | `../ui.js` |
| `logic/image-to-pdf-page.ts` | y | `@/js/ui.js`, `@/types` |
| `logic/invert-colors-page.ts` | n | `../ui.js`, `@/types` |
| `logic/jpg-to-pdf-page.ts` | y | `../ui.js`, `@/types` |
| `logic/json-to-pdf.ts` | y | `../i18n/i18n` |
| `logic/linearize-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/md-to-pdf.ts` | n | `../ui.js` |
| `logic/merge-pdf-page.ts` | y | `../ui.js`, `../state.js`, `@/types` |
| `logic/mobi-to-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/n-up-pdf-page.ts` | n | `../ui.js` |
| `logic/ocr-pdf-page.ts` | n | `../ui.js`, `@/types`, `../i18n/index.js` |
| `logic/odg-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/odp-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/ods-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/odt-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/organize-pdf-page.ts` | n | `../ui.js` |
| `logic/overlay-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/page-dimensions-page.ts` | n | `../ui.js`, `@/types` |
| `logic/page-numbers-page.ts` | n | `../ui.js` |
| `logic/pages-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/pdf-booklet-page.ts` | n | `../ui.js` |
| `logic/pdf-layers-page.ts` | y | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-multi-tool.ts` | n | `../i18n/i18n` |
| `logic/pdf-to-bmp-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-to-cbz-page.ts` | n | `../ui.js`, `../i18n/i18n`, `@/types` |
| `logic/pdf-to-csv-page.ts` | y | `../ui.js` |
| `logic/pdf-to-docx-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js` |
| `logic/pdf-to-excel-page.ts` | y | `../ui.js` |
| `logic/pdf-to-greyscale-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-to-jpg-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-to-json.ts` | y | `../i18n/i18n` |
| `logic/pdf-to-markdown-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js` |
| `logic/pdf-to-markdown.ts` | n | `../ui.js`, `../state.js` |
| `logic/pdf-to-pdfa-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js`, `@/types` |
| `logic/pdf-to-png-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-to-svg-page.ts` | y | `../ui.js`, `@/types` |
| `logic/pdf-to-text-page.ts` | y | `../ui.js`, `@/types` |
| `logic/pdf-to-tiff-page.ts` | y | `../ui.js`, `../i18n/i18n`, `@/types` |
| `logic/pdf-to-webp-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/pdf-to-zip-page.ts` | n | `../ui.js` |
| `logic/pdf-workflow-page.ts` | n | `@/js/workflow/*` (Rete.js) |
| `logic/png-to-pdf-page.ts` | n | `../ui.js` |
| `logic/posterize-page.ts` | n | `../ui.js`, `@/types` |
| `logic/powerpoint-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/prepare-pdf-for-ai-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js`, `@/types` |
| `logic/psd-to-pdf-page.ts` | y | `../ui.js`, `../state.js`, `@/types` |
| `logic/pub-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/rasterize-pdf-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js`, `@/types` |
| `logic/redact.ts` | n | `../ui.js`, `../state.js`, `@/types` |
| `logic/remove-annotations-page.ts` | n | `lucide` (missing pkg) |
| `logic/remove-blank-pages-page.ts` | n | `lucide` (missing pkg) |
| `logic/remove-metadata-page.ts` | n | `../ui.js` |
| `logic/remove-restrictions-page.ts` | n | `../ui.js`, `@/types` |
| `logic/repair-pdf-page.ts` | n | `../state.js`, `../ui.js` |
| `logic/repair-pdf.ts` | n | `../ui.js`, `../state.js`, `@/types` |
| `logic/reverse-pages-page.ts` | n | `../ui.js` |
| `logic/rotate-custom-page.ts` | n | `../ui.js` |
| `logic/rotate-pdf-page.ts` | n | `../ui.js` |
| `logic/rtf-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/sanitize-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/scanner-effect-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/shortcuts.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `logic/sign-pdf-page.ts` | n | `../ui.js`, `../i18n/i18n`, `@/types` |
| `logic/split-pdf-page.ts` | y | `../ui.js`, `../i18n/i18n`, `../state.js`, `@/types` |
| `logic/svg-to-pdf-page.ts` | n | `../ui.js` |
| `logic/table-of-contents.ts` | y | `../i18n/index.js` |
| `logic/text-color-page.ts` | n | `../ui.js`, `@/types` |
| `logic/tiff-to-pdf-page.ts` | n | `../ui.js` |
| `logic/timestamp-pdf-page.ts` | n | `../ui.js`, `../i18n/i18n` |
| `logic/txt-to-pdf-page.ts` | y | `../ui.js` |
| `logic/validate-signature-pdf-page.ts` | n | `../ui.js`, `@/types` |
| `logic/validate-signature-pdf.ts` | n | `@/types` |
| `logic/view-metadata-page.ts` | n | `../ui.js`, `@/types` |
| `logic/vsd-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/wasm-settings-page.ts` | y | `../ui.js`, `../i18n/index.js` |
| `logic/webp-to-pdf-page.ts` | n | `../ui.js` |
| `logic/word-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/word-to-pdf.ts` | n | `../ui.js`, `../state.js` |
| `logic/wpd-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/wps-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/xml-to-pdf-page.ts` | n | `../ui.js`, `../state.js` |
| `logic/xps-to-pdf-page.ts` | y | `../ui.js`, `../state.js` |
| `logic/index.ts` | n | transitive: `./duplicate-organize.js` (blocked) |
| `logic/compare-render.ts` | n | transitive: `../compare/engine/compare-page-models.ts` (needs `diff` pkg) |
| `logic/markdown-to-pdf-page.ts` | n | transitive: `../utils/markdown-editor.js` (blocked) |

### utils/ (26 blocked)

| Bento Source | WASM | Blocked By |
|---|---|---|
| `utils/alternate-merge.ts` | y | `../workflow/errors` |
| `utils/compress.ts` | y | transitive: `./helpers.js` (blocked), `./pymupdf-loader.js` (blocked) |
| `utils/comic-info.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `utils/cpdf-helper.ts` | ~~y~~ → **converted** | ~~`@/types`~~ resolved, WASM-flagged |
| `utils/disabled-tools.ts` | n | `@/types` |
| `utils/flatten-annotations.ts` | n | `../types/*` (not in scope) |
| `utils/freetext-flatten.ts` | n | `@/types` |
| `utils/freetext-font-embed.ts` | n | `@/types` |
| `utils/ghostscript-dynamic-loader.ts` | y | `@/types` |
| `utils/helpers.ts` | y | `@/types`, `../ui.js`, `../state.js` |
| `utils/hocr-transform.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `utils/image-input-utils.ts` | n | `heic2any` (missing pkg) |
| `utils/images-to-pdf-lib.ts` | n | transitive: `./image-input-utils.js` (missing `heic2any`) |
| `utils/libreoffice-loader.ts` | y | `@matbee/libreoffice-converter` (missing pkg) |
| `utils/load-pdf-document.ts` | n | transitive: `./helpers.js` (blocked) |
| `utils/lucide-init.ts` | n | `lucide` (missing pkg) |
| `utils/markdown-editor.ts` | n | `../i18n/i18n`, `@/types` |
| `utils/merge-cpdf.ts` | y | `../workflow/errors` |
| `utils/multi-tool-file-input.ts` | n | transitive: `./image-input-utils.js` (missing `heic2any`) |
| `utils/ocr.ts` | n | `@/types` |
| `utils/page-labels.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `utils/page-preview.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `utils/password-prompt.ts` | n | `@/types` + transitive |
| `utils/pdf-decrypt.ts` | ~~y~~ → **converted** | ~~`@/types`~~ resolved, WASM-flagged |
| `utils/pymupdf-loader.ts` | y | `@/types` + transitive |
| `utils/sanitize.ts` | n | `@/types` + transitive |
| `utils/setup-pdf-worker.ts` | n | Vite `?worker&url` import |
| `utils/simple-mode-footer.ts` | n | `../i18n/language-switcher.js` |
| `utils/split-pdf-helpers.ts` | ~~n~~ → **converted** | ~~`@/types`~~ resolved |
| `utils/tesseract-runtime.ts` | n | `tesseract.js` (missing pkg) |
| `utils/wasm-preloader.ts` | n | transitive: `../config/wasm-cdn-config.js` → circular with `wasm-provider.ts` |
| `utils/wasm-provider.ts` | n | Vite `import.meta.env` + circular with `wasm-cdn-config.ts` |
| `utils/ghostscript-loader.ts` | y | Vite `import.meta.env` + transitive: `./loadPdfDocument.js` (blocked) |
| `utils/font-loader.ts` | n | Vite `import.meta.env` (FIXED — see converted) |
| `utils/tesseract-language-availability.ts` | n | Vite `import.meta.env` (FIXED — see converted) |
| `utils/xml-to-pdf.ts` | n | `jspdf`, `jspdf-autotable`, `fast-xml-parser` (missing pkgs) |

### editcore/ (1 blocked)

| Bento Source | WASM | Blocked By |
|---|---|---|
| `editcore/engine-loader.js` | y | `bentopdf-pdfium` (missing vendor pkg) |

### compare/ (5 blocked)

| Bento Source | WASM | Blocked By |
|---|---|---|
| `compare/worker-api.ts` | n | transitive: `./engine/diff-text-runs.ts` (needs `diff` pkg) |
| `compare/engine/diff-text-runs.ts` | n | `diff` (missing pkg) |
| `compare/engine/compare-page-models.ts` | n | transitive: `./diff-text-runs.ts`, `../worker-api.ts` |
| `compare/engine/compare.worker.ts` | n | transitive: `./diff-text-runs.ts` |
| `compare/engine/ocr-page.ts` | n | `tesseract.js` (missing pkg) |
| `compare/engine/visual-diff.ts` | n | `pixelmatch` (missing pkg) |
| `compare/reporting/export-compare-pdf.ts` | n | transitive: `../../utils/helpers.ts` (blocked) |

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

## BLOCKED Reason Categories

| Reason | Count | Next Phase Action |
|---|---|---|
| `../ui.js` (app shell: showLoader/hideLoader/showAlert) | ~100 | Create UI adapter in wiring phase |
| `@/types` (BentoPDF type barrel) | ~60 | Pull `types/` directory or create equivalent interfaces |
| `../state.js` (app state) | ~30 | Create state adapter |
| `../i18n/*` (internationalization) | ~20 | Create i18n adapter |
| Missing npm package | 14 | Install packages or create type stubs |
| `../workflow/*` (Rete.js editor) | 2 | Out of scope — workflow UI excluded |
| `bentopdf-viewer` (app viewer) | 1 | Out of scope — app shell excluded |

## Dependencies Resolved Within Converted Set

The 26 converted files form these internal dependency chains:

```
editcore/shadingsurgery.js  ← editcore/streamsplice.js
                           ← editcore/type3surgery.js

compare/lru-cache.ts  ← compare/types.ts  ← compare/engine/text-normalization.ts
                                            ← compare/engine/pair-pages.ts
                                            ← compare/engine/compare-content.ts
                                            ← compare/engine/extract-page-model.ts
                                            ← compare/engine/page-signatures.ts

config/font-mappings.ts  ← utils/font-loader.ts
config/tesseract-languages.ts  ← utils/tesseract-language-availability.ts
```

## Verification Results

- ✅ `tsc --noEmit` — zero errors in bento/ files (35 source files + 42 types + shims)
- ✅ Zero cross-domain imports
- ✅ Zero imports reaching back to BentoPDF paths
- ✅ Zero `any`, `@ts-ignore`, or suppression tricks
- ✅ Zero Vite syntax remaining (`import.meta.env`, `?url`, `?raw`, `?worker`)
- ✅ All WASM-loading files flagged for lazy-load in wiring phase
- ✅ ui.ts shim provides showLoader/hideLoader/showAlert/hideAlert/renderFileDisplay via sonner + DOM
- ✅ types/ directory provides 42 type definition files with minimal stubs for missing packages

## Shims

| Shim | Path | Provides |
|------|------|----------|
| UI shim | `shims/ui.ts` | `showLoader`, `hideLoader`, `showAlert`, `hideAlert`, `renderFileDisplay` — backed by sonner toast + DOM overlay |
| Types barrel | `types/` | 42 type definition files covering all BentoPDF tool state types |

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

## Pilot Batch — 5 Tools Wired (August 23, 2026)

First real migration: 5 EASY-tier Bento-only tools fully wired end-to-end.
See `PILOT-BATCH-MANIFEST.md` for full details.

| Tool Slug | Processing Function | Registry Status | Test |
|-----------|--------------------|----|------|
| `bates-numbering` | `addBatesNumbers()` | live | ✅ PASS |
| `background-color` | `changeBackgroundColor()` | live | ✅ PASS |
| `sanitize-pdf` | `sanitizePdfBytes()` | live | ✅ PASS |
| `flatten-annotations` | `flattenAnnotationsInPdf()` | live | ✅ PASS |
| `comic-info` | `generateComicInfoXml()` | live | ✅ PASS |

### Files
- Created: `adapters/bento-processing.ts` (443 lines)
- Modified: `pdf-tools.ts` (+94), `registry/tools.ts` (+61), `__tests__/verify-bento-tools.ts` (+106)
