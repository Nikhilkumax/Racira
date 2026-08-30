# Bento Pilot Batch — Manifest

## Session: Pilot Batch (5 EASY-tier tools, full pipeline)
**Date:** August 23, 2026
**Status:** Complete — all 5 tools pass verification tests

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `src/domains/pdf/lib/bento/adapters/bento-processing.ts` | 443 | 5 standalone processing functions extracted from Bento |

## Files Modified

| File | Lines Before | Lines After | Delta | Changes |
|------|-------------|-------------|-------|---------|
| `src/lib/pdf/pdf-tools.ts` | 3510 | 3604 | +94 | Added import, 5 dispatcher cases, ToolOptions fields |
| `src/domains/pdf/registry/tools.ts` | ~400 | 461 | +61 | Added 5 registry entries with inputs |
| `src/domains/pdf/lib/bento/__tests__/verify-bento-tools.ts` | 387 | 493 | +106 | Added 5 test functions |

## Tools Added

| # | Slug | Registry Name | Category | Source | Test Status |
|---|------|---------------|----------|--------|-------------|
| 1 | `bates-numbering` | Bates Numbering | Organize PDF | Bento bates-numbering-page.ts | ✅ PASS |
| 2 | `background-color` | Background Color | Edit & Modify | Bento background-color-page.ts | ✅ PASS |
| 3 | `sanitize-pdf` | PDF Sanitizer | Optimize & Color | Bento utils/sanitize.ts | ✅ PASS |
| 4 | `flatten-annotations` | Flatten Annotations | Edit & Modify | Bento utils/flatten-annotations.ts | ✅ PASS |
| 5 | `comic-info` | Comic Info Generator | Utilities | Bento utils/comic-info.ts | ✅ PASS |

## Processing Functions

All 5 functions in `bento-processing.ts`:
- `addBatesNumbers(file, options)` → Uint8Array
- `changeBackgroundColor(file, options)` → Uint8Array
- `sanitizePdfBytes(file, options)` → Uint8Array
- `flattenAnnotationsInPdf(file)` → Uint8Array
- `generateComicInfoXml(params)` → string

## Test Results

```
Total: 18
Passed: 17
Failed: 0
Skipped: 1 (invert-colors — browser-only)
```

## Design Decisions

1. **No adapter registry pattern for pilot batch** — Processing functions are called directly from `processFiles` switch statement, matching the existing Racira pattern (e.g., `deletePdfPages`, `splitPdf`). The full adapter pattern from `adapters/adapter-pattern.ts` can be adopted in later batches if warranted.

2. **DOM-free extraction** — All Bento page controllers (126/133) have DOM manipulation. Processing functions were extracted and rewritten using only `pdf-lib`, eliminating all DOM dependencies.

3. **No ToolPage.tsx changes** — All 5 tools use `DefaultToolOptions` which automatically renders inputs from the registry entry. No custom option components needed.

4. **Registry entries include `inputs`** — Bates numbering, background-color, sanitize-pdf, and comic-info have custom input fields defined in the registry. Flatten-annotations has no inputs (just a Process button).

## Follow-up Items

- [ ] `sanitizePdfBytes` uses pdf-lib's low-level API to remove metadata/annotations. Verify it handles all edge cases the Bento `utils/sanitize.ts` handles (the Bento version uses `loadPdfDocument` with qpdf repair, which we skip).
- [ ] `flattenAnnotationsInPdf` currently removes FreeText annotations but doesn't embed their content into page streams. A full implementation would require content stream manipulation.
- [ ] `generateComicInfoXml` is a pure function with no PDF dependency — it could be moved to a non-PDF utility location if other domains need it.
