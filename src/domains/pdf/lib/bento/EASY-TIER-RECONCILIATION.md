# EASY-Tier Reconciliation Table (CORRECTED)

**Generated:** August 23, 2026
**Purpose:** One flat table of every EASY-tier entry in BENTO-TIER-PLAN.md, with verified status.

## Summary

| Category | Count | Notes |
|----------|-------|-------|
| **Total entries** | **43** | A=11, B=27, C=5 |
| converted (pre-existing in Racira) | 5 | Sub-tier A only |
| piloted-live | 7 | comic-info, sanitize-pdf, flatten-annotations, background-color, bates-numbering, text-color, add-watermark |
| reclassified-out | 13 | Overlap with existing Racira tools |
| no-source-available | 1 | zip-to-pdf — no Bento source file |
| **remaining-unwired** | **17** | 3 (A) + 12 (B) + 2 (C) — scope for migration |
| **Check** | **43** | 5 + 7 + 13 + 1 + 17 = 43 ✓ |

## Remaining-Unwired Scope List (17 tools to migrate)

### Sub-tier A: Clean Utility Files (3 tools, ~30 min each)
| # | Slug | Bento Source |
|---|------|-------------|
| 1 | page-labels | `utils/page-labels.ts` (57 lines) |
| 2 | hocr-transform | `utils/hocr-transform.ts` (303 lines) |
| 3 | split-pdf-helpers | `utils/split-pdf-helpers.ts` (148 lines) |

### Sub-tier B: Simple Page Controllers (12 tools, ~1 hr each)
| # | Slug | Bento Source |
|---|------|-------------|
| 4 | timestamp-pdf | `logic/timestamp-pdf-page.ts` (234 lines, 9 DOM refs) |
| 5 | rotate-custom | `logic/rotate-custom-page.ts` (417 lines, 32 DOM refs) |
| 6 | divide-pages | `logic/divide-pages-page.ts` (248 lines, 20 DOM refs) |
| 7 | duplicate-organize | `logic/duplicate-organize.ts` (220 lines, 15 DOM refs) |
| 8 | combine-single-page | `logic/combine-single-page-page.ts` (328 lines, 25 DOM refs) |
| 9 | png-to-pdf | `logic/png-to-pdf-page.ts` (250 lines, 18 DOM refs) |
| 10 | tiff-to-pdf | `logic/tiff-to-pdf-page.ts` (228 lines, 19 DOM refs) |
| 11 | webp-to-pdf | `logic/webp-to-pdf-page.ts` (250 lines, 18 DOM refs) |
| 12 | xml-to-pdf | `logic/xml-to-pdf-page.ts` (182 lines, 15 DOM refs) |
| 13 | txt-to-pdf | `logic/txt-to-pdf-page.ts` (263 lines, 28 DOM refs) |
| 14 | pages-to-pdf | `logic/pages-to-pdf-page.ts` (192 lines, 16 DOM refs) — needs LibreOffice |
| 15 | pdf-booklet | `logic/pdf-booklet-page.ts` (602 lines, 30 DOM refs) |

### Sub-tier C: Canvas/Heavy DOM (2 tools, ~2-3 hrs each)
| # | Slug | Bento Source |
|---|------|-------------|
| 16 | posterize | `logic/posterize-page.ts` (487 lines, 45 DOM refs) |
| 17 | scanner-effect | `logic/scanner-effect-page.ts` (434 lines, 37 DOM refs) |

## Status: no-source-available

| Slug | Reason |
|------|--------|
| zip-to-pdf | No Bento source file. Only `pdf-to-zip-page.ts` exists (PDF→ZIP, not ZIP→PDF). |

## Corrected Counts (was wrong in prior version)

| What prior version said | Correct value | Explanation |
|------------------------|---------------|-------------|
| piloted-live: 6 | **7** | add-watermark was double-counted as both piloted and reclassified |
| reclassified-out: 17 | **13** | 4 entries were actually overlap tools already counted in B |
| remaining-unwired: 15 | **17** | Math error: 3+12+2=17, not 15 |
| Total: 31 | **43** | Tables contain 43 entries, not 31 |
