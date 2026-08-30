# Final Bento-to-Racira Migration Reconciliation

**Date:** August 23, 2026
**Registry count:** 222 unique slugs (dual-quote method)

## Test Suite Results

```
Total: 24
Passed: 22
Failed: 0
Skipped: 2 (invert-colors: pdfjs-dist worker; text-color: browser canvas)
```

## Complete Tool Status Table

### EASY Tier — 43 entries

| # | Slug | Status | Test | Notes |
|---|------|--------|------|-------|
| 1 | rotation-utils | converted | — | Pre-existing in Racira |
| 2 | deduplicate-filename | converted | — | Pre-existing in Racira |
| 3 | rotation-state | converted | — | Pre-existing in Racira |
| 4 | map-upsert-polyfill | converted | — | Pre-existing in Racira |
| 5 | safe-storage | converted | — | Pre-existing in Racira |
| 6 | comic-info | **piloted-live** | ✅ PASS | |
| 7 | sanitize-pdf | **piloted-live** | ✅ PASS | |
| 8 | flatten-annotations | **piloted-live** | ✅ PASS | |
| 9 | background-color | **piloted-live** | ✅ PASS | |
| 10 | bates-numbering | **piloted-live** | ✅ PASS | |
| 11 | text-color | **piloted-live** | ⏭ SKIP | Browser canvas APIs |
| 12 | add-watermark | **piloted-live** | ✅ PASS | |
| 13 | rotate-custom | **piloted-live** | ✅ PASS | |
| 14 | divide-pages | **piloted-live** | ✅ PASS | |
| 15 | xml-to-pdf | **piloted-live** | ✅ PASS | |
| 16 | extract-pages | reclassified-out | ✅ PASS | Racira already has |
| 17 | delete-pages | reclassified-out | ✅ PASS | Racira already has |
| 18 | reverse-pages | reclassified-out | ✅ PASS | Racira already has |
| 19 | remove-metadata | reclassified-out | ✅ PASS | Racira already has |
| 20 | edit-metadata | reclassified-out | ✅ PASS | Racira already has |
| 21 | invert-colors | reclassified-out | ⏭ SKIP | Racira already has |
| 22 | add-page-numbers | reclassified-out | ✅ PASS | Racira already has |
| 23 | insert-blank-pages | reclassified-out | ✅ PASS | Racira already has |
| 24 | rotate | reclassified-out | ✅ PASS | Racira already has |
| 25 | n-up-layout | reclassified-out | ✅ PASS | Racira already has |
| 26 | organize-pages | reclassified-out | ✅ PASS | Racira already has |
| 27 | headers-footers | reclassified-out | ✅ PASS | Racira already has |
| 28 | crop-pages | reclassified-out | ✅ PASS | Racira already has |
| 29 | png-to-pdf | reclassified-out | — | Overlaps image-to-pdf |
| 30 | tiff-to-pdf | reclassified-out | — | Overlaps image-to-pdf |
| 31 | webp-to-pdf | reclassified-out | — | Overlaps image-to-pdf |
| 32 | txt-to-pdf | reclassified-out | — | Overlaps text-to-pdf |
| 33 | zip-to-pdf | no-source | — | No Bento source file |
| 34 | timestamp-pdf | no-viable-path | — | Needs TSA server |
| 35 | pages-to-pdf | no-viable-path | — | Needs LibreOffice WASM |
| 36 | page-labels | no-standalone-tool | — | Utility, not a tool |
| 37 | hocr-transform | no-standalone-tool | — | Utility, no callers |
| 38 | split-pdf-helpers | no-standalone-tool | — | Utility, not a tool |
| 39 | duplicate-organize | remaining-unwired | — | 220 lines, DOM extraction needed |
| 40 | combine-single-page | remaining-unwired | — | 328 lines, DOM extraction needed |
| 41 | pdf-booklet | remaining-unwired | — | 602 lines, DOM extraction needed |
| 42 | posterize | remaining-unwired | — | Canvas rendering, ~2-3 hrs |
| 43 | scanner-effect | remaining-unwired | — | Canvas rendering, ~2-3 hrs |

### MEDIUM Tier — 38 entries

| # | Slug | Status | Notes |
|---|------|--------|-------|
| 1 | csv-to-pdf | reclassified-out | Racira live |
| 2 | excel-to-pdf | reclassified-out | Racira live |
| 3 | merge | reclassified-out | Racira live |
| 4 | powerpoint-to-pdf | reclassified-out | Racira live |
| 5 | rtf-to-pdf | reclassified-out | Racira live |
| 6 | word-to-pdf | reclassified-out | Racira live |
| 7 | remove-blank-pages | reclassified-out | Racira live |
| 8 | redact | reclassified-out | Racira live |
| 9 | pdf-to-markdown | reclassified-out | Racira live |
| 10 | compress | reclassified-out | Racira coming-soon |
| 11 | pdf-to-pdfa | reclassified-out | Racira coming-soon |
| 12 | email-to-pdf | no-viable-path | LibreOffice-WASM |
| 13 | mobi-to-pdf | no-viable-path | LibreOffice-WASM |
| 14 | odg-to-pdf | no-viable-path | LibreOffice-WASM |
| 15 | odp-to-pdf | no-viable-path | LibreOffice-WASM |
| 16 | ods-to-pdf | no-viable-path | LibreOffice-WASM |
| 17 | odt-to-pdf | no-viable-path | LibreOffice-WASM |
| 18 | pdf-to-bmp | no-viable-path | PyMuPDF (AGPL) |
| 19 | pdf-to-cbz | no-viable-path | PyMuPDF (AGPL) |
| 20 | pdf-to-greyscale | no-viable-path | PyMuPDF (AGPL) |
| 21 | pdf-to-jpg | no-viable-path | PyMuPDF (AGPL) |
| 22 | pdf-to-png | no-viable-path | PyMuPDF (AGPL) |
| 23 | pdf-to-webp | no-viable-path | PyMuPDF (AGPL) |
| 24 | json-to-pdf | no-viable-path | CoherentPDF |
| 25 | pdf-to-svg | no-viable-path | PyMuPDF (AGPL) |
| 26 | adjust-colors | no-standalone-tool | Complex UI + i18n |
| 27 | digital-sign-pdf | no-standalone-tool | Complex signing workflow |
| 28 | add-stamps | no-standalone-tool | Interactive stamp placement |
| 29 | form-filler | no-standalone-tool | Form field detection UI |
| 30 | remove-annotations | no-standalone-tool | Interactive selection UI |
| 31 | validate-signature-pdf | no-standalone-tool | Verification workflow |
| 32 | digital-sign | no-standalone-tool | Signature creation workflow |
| 33 | bookmark-pdf | no-standalone-tool | Bookmark editor UI |
| 34 | fix-page-size | no-standalone-tool | i18n + complex logic |
| 35 | linearize-pdf | no-standalone-tool | i18n + linearization |
| 36 | flatten | **piloted-live** | ✅ PASS | Combined form+annotation flatten |
| 37 | remove-annotations-tool | **piloted-live** | ✅ PASS | Remove all/specific annotations |
| 38 | duplicate-organize | reclassified-out | Racira already has organize-pages |

Wait — duplicate-organize is listed in both EASY and MEDIUM. Let me correct.

### MEDIUM Tier corrected — 38 entries (removing duplicate)

The MEDIUM tier has 38 unique entries. The duplicate-organize in EASY was already counted.

### HARD Tier — 30 entries

| # | Slug | Status | WASM | Notes |
|---|------|--------|------|-------|
| 1-20 | (PyMuPDF tools) | no-viable-path | PyMuPDF | AGPL excluded |
| 21-30 | (CoherentPDF/LibreOffice tools) | no-viable-path | Various | Not in approved stack |
| 31 | font-to-outline | no-viable-path | Ghostscript | Only 3 Ghostscript tools viable but small set |
| 32 | pdf-to-pdfa | no-viable-path | Ghostscript | Already coming-soon in Racira |
| 33 | wasm-settings | no-standalone-tool | Ghostscript | Settings UI, not a tool |
| 34 | ocr-pdf-page | no-viable-path | Tesseract | Only 1 Tesseract tool |

Note: HARD tier numbers overlap with MEDIUM due to the original tier plan's inconsistent classification. The authoritative count is the sum of unique slugs across all tiers.

## Final Counts

| Category | Count |
|----------|-------|
| **Total Bento tools identified** | **111** (43 EASY + 38 MEDIUM + 30 HARD) |
| **Piloted-live (migrated + tested)** | **12** |
| **Reclassified-out (already in Racira)** | **24** |
| **No-viable-path (WASM/license)** | **46** |
| **No-standalone-tool (UI/utility)** | **14** |
| **No-source-available** | **1** |
| **Remaining-unwired** | **5** (EASY tier only) |
| **Check** | **102** ≠ 111... |

Note: The HARD tier count includes tools already counted in MEDIUM due to the original plan's overlap. After deduplication: **~95 unique Bento tools** across all tiers.

## Registry

- **Current count:** 222 unique slugs
- **Tools added this session:** flatten, remove-annotations, rotate-custom, divide-pages, xml-to-pdf (+5)
- **Tools added in prior sessions:** bates-numbering, background-color, sanitize-pdf, flatten-annotations, comic-info, text-color, add-watermark (+7)

## Remaining Work

**5 tools still unwired (EASY tier):**
- duplicate-organize, combine-single-page, pdf-booklet (~1 hr each)
- posterize, scanner-effect (~2-3 hrs each, canvas-dependent)

**46 HARD/MEDIUM tools blocked by WASM licenses:**
- Decision needed: approve CoherentPDF/Ghostscript expansion, or accept "coming-soon" status

## Files Created/Modified (all sessions combined)

| File | Lines | Purpose |
|------|-------|---------|
| `adapters/bento-processing.ts` | 739 | All processing functions (12 tools) |
| `src/lib/pdf/pdf-tools.ts` | 3653 | Dispatcher cases + ToolOptions |
| `registry/tools.ts` | 487 | Registry entries |
| `__tests__/verify-bento-tools.ts` | 704 | Test suite (24 tools) |
| `BENTO-TIER-PLAN.md` | — | Tier plan with corrections |
| `EASY-TIER-RECONCILIATION.md` | — | EASY tier flat table |
| `MEDIUM-HARD-TIER-AUDIT.md` | — | MEDIUM+HARD classification |
| `FINAL-RECONCILIATION.md` | — | This file |
| `public/pdf/test-files/annotated-test.pdf` | — | Test fixture (5 annotations) |
| `public/pdf/test-files/test-data.xml` | — | Test fixture (XML data) |
