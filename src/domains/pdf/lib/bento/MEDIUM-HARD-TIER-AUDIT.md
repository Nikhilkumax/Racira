# MEDIUM + HARD Tier Audit

**Date:** August 23, 2026
**Purpose:** Real classification of MEDIUM (~41) and HARD (~50) tier tools before attempting conversion.

## Summary

| Category | MEDIUM | HARD | Total |
|----------|--------|------|-------|
| Reclassified-out (already in Racira) | 11 | 2 | 13 |
| No-viable-path (WASM not approved) | 15 | 28 | 43 |
| No-standalone-tool (complex UI/state) | 10 | 0 | 10 |
| **Genuinely viable for conversion** | **2** | **0** | **2** |
| **Total** | **38** | **30** | **68** |

## MEDIUM Tier Detail (38 tools)

### Reclassified-out — Already in Racira (11)
| Tool | Racira status |
|------|--------------|
| csv-to-pdf | ✅ live (dispatcher case exists) |
| excel-to-pdf | ✅ live |
| merge | ✅ live |
| powerpoint-to-pdf | ✅ live |
| rtf-to-pdf | ✅ live |
| word-to-pdf | ✅ live |
| remove-blank-pages | ✅ live |
| redact | ✅ live |
| pdf-to-markdown | ✅ live |
| compress | coming-soon in Racira |
| pdf-to-pdfa | coming-soon in Racira |

### No-viable-path — WASM not in approved stack (15)
| Tool | WASM dependency | Why blocked |
|------|----------------|-------------|
| email-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| mobi-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| odg-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| odp-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| ods-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| odt-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| pages-to-pdf | LibreOffice-WASM | Excluded for Phase 1 |
| pdf-to-bmp | PyMuPDF | AGPL — excluded |
| pdf-to-cbz | PyMuPDF | AGPL — excluded |
| pdf-to-greyscale | PyMuPDF | AGPL — excluded |
| pdf-to-jpg | PyMuPDF | AGPL — excluded |
| pdf-to-png | PyMuPDF | AGPL — excluded |
| pdf-to-webp | PyMuPDF | AGPL — excluded |
| json-to-pdf | CoherentPDF | Not in approved stack |
| pdf-to-svg | PyMuPDF | AGPL — excluded |

### No-standalone-tool — Complex UI/state (10)
| Tool | Why not standalone |
|------|--------------------|
| adjust-colors | Needs i18n + canvas preview |
| digital-sign-pdf | Complex signing workflow + UI |
| add-stamps | Needs lucide icons + interactive stamp placement |
| form-filler | Needs lucide + form field detection UI |
| remove-annotations | Interactive annotation selection UI |
| validate-signature-pdf | Complex verification workflow |
| digital-sign | Signature creation + embedding workflow |
| bookmark-pdf | Interactive bookmark editor UI |
| fix-page-size | Needs i18n + complex page size logic |
| linearize-pdf | Needs i18n + linearization algorithm |

### Genuinely viable (2)
| Tool | Source | Why viable |
|------|--------|-----------|
| flatten-pdf-page | `logic/flatten-pdf-page.ts` (255 lines) | Uses `flattenAnnotations` (already available) + pdf-lib. Racira's `flatten` is "coming-soon". |
| remove-annotations-page | `logic/remove-annotations-page.ts` (152 lines) | Uses pdf-lib PDFName/PDFDict for annotation removal. Clean utility-like processing. |

## HARD Tier Detail (30 tools)

### Reclassified-out — Already in Racira (2)
| Tool | Racira status |
|------|--------------|
| pdf-to-text | ✅ live |
| sanitize-pdf-page | ✅ live (pilot batch) |

### No-viable-path — WASM not in approved stack (28)

**PyMuPDF (AGPL — excluded): 20 tools**
compress-pdf-page, deskew-pdf-page, email-to-pdf, epub-to-pdf, extract-images, extract-tables, fb2-to-pdf, image-to-pdf, jpg-to-pdf, mobi-to-pdf, pdf-layers, pdf-to-csv, pdf-to-docx, pdf-to-excel, pdf-to-markdown, pdf-to-pdfa, pdf-to-svg, pdf-to-text, prepare-pdf-for-ai, psd-to-pdf, rasterize-pdf, txt-to-pdf, xps-to-pdf

**CoherentPDF (not approved): 10 tools**
add-attachments, add-page-labels, alternate-merge, edit-attachments, extract-attachments, json-to-pdf, merge-pdf, pdf-to-json, split-pdf, table-of-contents

**LibreOffice-WASM (excluded for Phase 1): 13 tools**
excel-to-pdf, odg-to-pdf, odp-to-pdf, ods-to-pdf, odt-to-pdf, pages-to-pdf, powerpoint-to-pdf, pub-to-pdf, rtf-to-pdf, vsd-to-pdf, word-to-pdf, wpd-to-pdf, wps-to-pdf

**Ghostscript (approved): 3 tools** — font-to-outline, pdf-to-pdfa, wasm-settings

**Tesseract (approved): 1 tool** — ocr-pdf-page

**pdfium (quarantined): 0 tools** — edit-pdf-page, edit-pdf-text-page were quarantined

### Note on WASM overlap
Some tools appear in multiple categories (e.g., compress-pdf-page uses both Ghostscript AND PyMuPDF). The primary dependency determines the classification.

## Conclusion

**The MEDIUM and HARD tiers are overwhelmingly blocked by WASM license/scope issues, not by extraction difficulty.** Only 2 tools out of 68 are genuinely viable for conversion in this session. The remaining 66 are either already in Racira (13), need WASM libraries not in the approved stack (43), or are too UI-dependent to extract as standalone tools (10).

This is not an extraction problem — it's a dependency/licensing problem. The Bento codebase relies heavily on PyMuPDF (AGPL), CoherentPDF (not approved), and LibreOffice-WASM (excluded for Phase 1). These are the core engines for most PDF conversion and manipulation operations.

**Recommendation:** The viable path forward is:
1. Convert the 2 remaining MEDIUM tools (flatten-pdf-page, remove-annotations-page)
2. For HARD-tier tools, the decision point is: approve additional WASM libraries (CoherentPDF, Ghostscript expansion) or accept that these tools stay as "coming-soon" in Racira
3. The EASY tier (10 migrated, 5 remaining) is the only tier with meaningful extraction work left
