# Bento Migration Batch 2 — Manifest

**Date:** August 23, 2026
**Session:** Complete EASY-Tier Migration (partial — stopped after sub-tier B)

## Summary

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Registry slugs | 218 | 221 | +3 |
| Piloted-live tools | 7 | 10 | +3 |
| Remaining unwired | 17 | 14 | -3 |
| Test suite | 19 tests | 22 tests | +3 |
| Test pass rate | 17/19 | 20/22 | +3 |

## Tools Wired This Session

| # | Slug | Sub-tier | Source | Test Status |
|---|------|----------|--------|-------------|
| 1 | rotate-custom | B | `logic/rotate-custom-page.ts` (extracted applyRotations) | ✅ PASS |
| 2 | divide-pages | B | `logic/divide-pages-page.ts` (extracted dividePages) | ✅ PASS |
| 3 | xml-to-pdf | B | `utils/xml-to-pdf.ts` (direct import, no extraction needed) | ✅ PASS |

## Tools Reclassified This Session

| Slug | Old Status | New Status | Reason |
|------|-----------|------------|--------|
| page-labels | remaining-unwired | no-standalone-tool | Utility function, not a standalone tool; used by HARD-tier add-page-labels |
| hocr-transform | remaining-unwired | no-standalone-tool | Utility function, no logic file callers |
| split-pdf-helpers | remaining-unwired | no-standalone-tool | Utility function; used by HARD-tier split-pdf |
| txt-to-pdf | remaining-unwired | reclassified-out | Overlaps with Racira's text-to-pdf |
| png-to-pdf | remaining-unwired | reclassified-out | Overlaps with Racira's image-to-pdf |
| tiff-to-pdf | remaining-unwired | reclassified-out | Overlaps with Racira's image-to-pdf |
| webp-to-pdf | remaining-unwired | reclassified-out | Overlaps with Racira's image-to-pdf |
| timestamp-pdf | remaining-unwired | no-viable-path | Needs TSA server (network call), not client-side viable |
| pages-to-pdf | remaining-unwired | no-viable-path | Needs LibreOffice WASM (HARD tier) |

## Bugs Found and Fixed

1. **rotate-custom**: Missing `degrees` import from pdf-lib in bento-processing.ts. Fixed by adding to import statement.
2. **divide-pages test**: Initial test checked page dimensions via `getSize()` but `setCropBox` doesn't change page dimensions — it clips the visible area. Fixed test to check crop box values instead.

## Remaining Scope (14 tools)

### Sub-tier B (8 remaining)
- duplicate-organize, combine-single-page, pdf-booklet (unique tools, ~1 hr each)
- png-to-pdf, tiff-to-pdf, webp-to-pdf (reclassified-out — overlap with image-to-pdf)
- txt-to-pdf (reclassified-out — overlap with text-to-pdf)
- pages-to-pdf (no-viable-path — needs LibreOffice WASM)
- timestamp-pdf (no-viable-path — needs TSA server)

### Sub-tier C (2 remaining)
- posterize (canvas rendering, ~2-3 hrs)
- scanner-effect (canvas rendering, ~2-3 hrs)

### Reclassified as no-standalone-tool (3)
- page-labels, hocr-transform, split-pdf-helpers (utility functions, not tools)

## Files Created/Modified

| File | Lines | Change |
|------|-------|--------|
| `adapters/bento-processing.ts` | 653 | +132 (rotatePdfCustom, dividePdfPages, convertXmlToPdfBytes) |
| `src/lib/pdf/pdf-tools.ts` | 3644 | +40 (3 dispatcher cases, ToolOptions fields) |
| `registry/tools.ts` | 482 | +21 (3 registry entries) |
| `__tests__/verify-bento-tools.ts` | 670 | +70 (3 test functions) |
| `public/pdf/test-files/test-data.xml` | 14 | New test fixture |
| `EASY-TIER-RECONCILIATION.md` | — | Corrected counts |
| `BENTO-TIER-PLAN.md` | — | Updated summary + effort estimates |
