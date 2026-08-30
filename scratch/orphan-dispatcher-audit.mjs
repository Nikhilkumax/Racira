/**
 * Orphan Dispatcher & Tool-Config Audit
 * 
 * Tests every dispatcher case that has no registry entry,
 * and checks every tool-config-only entry for dispatcher coverage.
 * 
 * Uses tsx to import real production functions.
 * Run: npx tsx scratch/orphan-dispatcher-audit.mjs
 */

import { readFileSync } from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ── Helper: create a tiny test PDF ──────────────────────────
async function createTestPDF() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  // Page 1
  const p1 = doc.addPage([612, 792]);
  p1.drawText("Hello World Page 1", { x: 50, y: 700, size: 16, font, color: rgb(0, 0, 0) });
  p1.drawText("This is test content for audit.", { x: 50, y: 670, size: 12, font });
  // Page 2
  const p2 = doc.addPage([612, 792]);
  p2.drawText("Page 2 Content", { x: 50, y: 700, size: 16, font, color: rgb(0, 0, 0) });
  p2.drawText("Second page of the test PDF.", { x: 50, y: 670, size: 12, font });
  // Page 3
  const p3 = doc.addPage([612, 792]);
  p3.drawText("Page 3", { x: 50, y: 700, size: 16, font, color: rgb(0, 0, 0) });

  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], "test.pdf", { type: "application/pdf" });
}

// ── Helper: create a PDF with form fields ────────────────────
async function createTestPDFWithForms() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText("Form PDF", { x: 50, y: 700, size: 16, font });
  const form = doc.getForm();
  const tf = form.createTextField("name_field");
  tf.addToPage(page, { x: 50, y: 650, width: 200, height: 30 });
  const cb = form.createCheckBox("agree_check");
  cb.addToPage(page, { x: 50, y: 600, width: 20, height: 20 });
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], "form-test.pdf", { type: "application/pdf" });
}

// ── Import the dispatcher ─────────────────────────────────────
let processFiles;
try {
  const mod = await import("../../src/lib/pdf/pdf-tools.ts");
  processFiles = mod.processFiles;
} catch (e) {
  // Try alternative import path
  const mod = await import("../src/lib/pdf/pdf-tools.ts");
  processFiles = mod.processFiles;
}

if (!processFiles) {
  console.error("FATAL: Could not import processFiles");
  process.exit(1);
}

console.log("✅ processFiles imported successfully\n");

// ── Test runner ───────────────────────────────────────────────
const results = [];

async function testCase(slug, description, options = {}, fileOverride = null) {
  const file = fileOverride || await createTestPDF();
  const files = [file];
  try {
    const result = await processFiles(slug, files, options);
    const status = result.type === "coming-soon"
      ? "STUB"
      : result.data
        ? "PASS"
        : "PASS (no data)";
    const size = result.data ? result.data.length : 0;
    const msg = result.message || "";
    const ext = result.filename?.split(".").pop() || "?";
    results.push({ slug, description, status, size, ext, msg });
    return result;
  } catch (err) {
    results.push({ slug, description, status: "ERROR", size: 0, ext: "?", msg: err.message?.substring(0, 120) });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// GROUP 1: Orphan dispatcher cases (no registry entry)
// ═══════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════");
console.log("GROUP 1: Dispatcher cases with NO registry entry");
console.log("═══════════════════════════════════════════════════════\n");

// 1. split-every-n
await testCase("split-every-n", "Split PDF into chunks of N pages", { n: 2 });

// 2. add-arrow
await testCase("add-arrow", "Draw an arrow (line + arrowhead) on a page", { page: 1, x1: 50, y1: 400, x2: 200, y2: 400 });

// 3. highlight-form-fields
const formFile = await createTestPDFWithForms();
await testCase("highlight-form-fields", "Draw colored rectangles over form field widgets", { fillColor: "#ffff00" }, formFile);

// 4. pdf-to-rtf
await testCase("pdf-to-rtf", "Extract text from PDF and wrap in RTF format");

// 5. n-up-printing
await testCase("n-up-printing", "Fit multiple PDF pages onto one page in a grid", { cols: 2, rows: 2 });

// 6. create-booklet
await testCase("create-booklet", "Reorder pages for saddle-stitch booklet printing");

// 7. add-margin
await testCase("add-margin", "Add uniform margins by expanding page size and translating content", { margin: 20 });

// 8. duplex-simulator
await testCase("duplex-simulator", "Flip odd pages for duplex printing simulation", { flipEdge: "long" });

// 9. find-replace-text
await testCase("find-replace-text", "Find and replace text (coming-soon stub)");

// 10. extract-headings
await testCase("extract-headings", "Extract headings by detecting large font sizes via pdfjs");

// 11. extract-email-addresses
await testCase("extract-email-addresses", "Extract email addresses from text content via regex");

// 12. extract-phone-numbers
await testCase("extract-phone-numbers", "Extract phone numbers from text content via regex");

// 13. extract-keywords
await testCase("extract-keywords", "Count word frequency and return top N keywords", { topN: 10 });

// 14. extract-hyperlinks
await testCase("extract-hyperlinks", "Extract URLs from annotations and text content");

// 15. version-checker
await testCase("version-checker", "Read PDF header to detect %PDF-x.y version string");

// 16. add-pdf-properties
await testCase("add-pdf-properties", "Set PDF metadata (title/author/subject/keywords)", { title: "Test", author: "Auditor" });

// 17. repair-pdf
await testCase("repair-pdf", "Re-save PDF through pdf-lib load/save cycle");

// 18. optimize-fonts
await testCase("optimize-fonts", "Re-save PDF with useObjectStreams:true for font optimization");

// 19. remove-images (coming-soon)
await testCase("remove-images", "Remove images from PDF (coming-soon stub)");

// 20. edit-metadata
await testCase("edit-metadata", "Set title/author/subject/keywords on PDF", { title: "Edited" });

// 21. pdf-size-analyzer
await testCase("pdf-size-analyzer", "Return JSON with filename, totalBytes, totalMegabytes");

// 22. color-space-analyzer
await testCase("color-space-analyzer", "Return info about PDF color spaces (mostly stub note)");

// 23. image-extractor
await testCase("image-extractor", "Extract embedded images via operator list parsing, fallback to page render");

// 24. attachment-inspector
await testCase("attachment-inspector", "List FileAttachment annotations from all pages");

// 25. add-page-numbers
await testCase("add-page-numbers", "Draw page numbers at configurable position on every page", { pageNumberPosition: "bottom-center", pageNumberStart: 1 });

// 26. reduce-pdf-size
await testCase("reduce-pdf-size", "Compress PDF (empty case - check what happens)");

// 27. poster-print
await testCase("poster-print", "Poster print (empty case - falls through to print-margin-adjuster)");

// 28. image-extractor (separate case with different name)
await testCase("image-extractor", "Extract embedded images v2 (operator list based)");

// ═══════════════════════════════════════════════════════════════
// GROUP 2: Tool-config-only entries (no registry match)
// ═══════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════════════════");
console.log("GROUP 2: Tool-config entries with NO registry match");
console.log("═══════════════════════════════════════════════════════\n");

// Test whether these slugs exist in the dispatcher
const configOnlySlugs = [
  "protect-pdf",
  "add-password",
  "remove-password",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-word",
  "pdf-to-excel",
  "pdf-to-powerpoint",
  "pdf-to-png",
  "pdf-to-webp",
  "extract-text-txt",
  "text-extraction",
  "pdf-to-base64",
  "base64-to-pdf",
  "page-counter",
  "txt-to-pdf",
  "json-to-pdf",
  "chapter-splitter",
  "password-strength-checker",
  // Extra tool-config slugs that also lack registry entries
  "pdf-pages-to-images",
  "pdf-zip-images",
  "extract-attachments",
  "remove-metadata",
  "invert-colors",
  "grayscale-pdf",
  "structure-viewer",
  "hex-viewer",
  "linearization-checker",
  "pdfa-checker",
  "xmp-metadata-viewer",
  "page-label-editor",
  "permission-inspector",
  "signature-inspector",
  "metadata-viewer",
  "bookmark-viewer",
  "accessibility-checker",
  "object-inspector",
  "font-extractor",
  "link-extractor",
  "pdf-statistics",
  "page-size-inspector",
  "word-count",
  "character-count",
  "password-strength-checker",
];

for (const slug of configOnlySlugs) {
  const file = await createTestPDF();
  await testCase(slug, `tool-config entry "${slug}" — checking dispatcher`);
}

// ═══════════════════════════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════════════════");
console.log("RESULTS");
console.log("═══════════════════════════════════════════════════════\n");

const pass = results.filter(r => r.status === "PASS" || r.status === "PASS (no data)");
const stubs = results.filter(r => r.status === "STUB");
const errors = results.filter(r => r.status === "ERROR");

console.log(`Total tested: ${results.length}`);
console.log(`PASS (real impl): ${pass.length}`);
console.log(`STUB (coming-soon): ${stubs.length}`);
console.log(`ERROR: ${errors.length}\n`);

console.log("── PASS (real implementation) ──");
for (const r of pass) {
  console.log(`  ✅ ${r.slug.padEnd(30)} ${r.ext.padEnd(6)} ${r.size.toString().padStart(8)} bytes  ${r.msg || r.description}`);
}

console.log("\n── STUB (coming-soon response) ──");
for (const r of stubs) {
  console.log(`  ⏳ ${r.slug.padEnd(30)} ${r.msg}`);
}

console.log("\n── ERROR ──");
for (const r of errors) {
  console.log(`  ❌ ${r.slug.padEnd(30)} ${r.msg}`);
}
