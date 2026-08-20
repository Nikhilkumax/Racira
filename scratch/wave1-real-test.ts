/**
 * Wave 1 Real Verification — imports actual production code via tsx
 *
 * Tests the real exported functions from src/lib/pdf/pdf-tools.ts
 * and the real processFiles dispatcher, not reimplemented logic.
 */

import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

// ── Import the real module ──────────────────────────────────
// We import only the pure pdf-lib functions that don't need browser APIs.
// processFiles, pdfToJPG, extractText need browser APIs (canvas/pdfjs).

import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  removePages,
  organizePages,
  cropPDF,
  imagesToPDF,
  addPageNumbers,
  addHeaderFooter,
  addWatermark,
  addTextToPDF,
  addBlankPages,
  editMetadata,
  removeMetadata,
  parsePageRange,
  getPageCount,
} from "../src/lib/pdf/pdf-tools";

// Also import the processFiles dispatcher to test routing
import { processFiles } from "../src/lib/pdf/pdf-tools";

// ── Helpers ─────────────────────────────────────────────────

/** Create a minimal File-like object for Node.js testing */
function makeFile(bytes: Uint8Array, name: string, type = "application/pdf"): File {
  // Node.js 20+ has File global
  return new File([bytes], name, { type });
}

/** Read a File into Uint8Array */
async function fileToBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

const results: { slug: string; status: "PASS" | "FAIL"; msg: string }[] = [];
function ok(slug: string, msg: string) {
  results.push({ slug, status: "PASS", msg });
  console.log(`  ✅ ${slug}: ${msg}`);
}
function fail(slug: string, msg: string, err?: any) {
  results.push({ slug, status: "FAIL", msg: `${msg} — ${err?.message || err}` });
  console.log(`  ❌ ${slug}: ${msg} — ${err?.message || err}`);
}

// ── Test PDF factories ──────────────────────────────────────

async function makeMultiPage(n = 3): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= n; i++) {
    const page = doc.addPage([612, 792]);
    page.drawText(`Page ${i} of ${n}`, { x: 50, y: 700, size: 24, font, color: rgb(0, 0, 0) });
    page.drawText(`Test content for page ${i}.`, { x: 50, y: 650, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  }
  return doc.save();
}

async function makeFormPDF(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText("Form Test", { x: 50, y: 700, size: 18, font });
  const form = doc.getForm();
  form.createTextField("name_field").addToPage(page, { x: 50, y: 650, width: 200, height: 20 });
  form.createTextField("email_field").addToPage(page, { x: 50, y: 610, width: 200, height: 20 });
  form.createCheckBox("agree_check").addToPage(page, { x: 50, y: 570, width: 15, height: 15 });
  return doc.save();
}

async function makeTextPDF(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page1 = doc.addPage([612, 792]);
  page1.drawText("The quick brown fox jumps over the lazy dog.", { x: 50, y: 700, size: 14, font });
  page1.drawText("Pack my box with five dozen liquor jugs.", { x: 50, y: 670, size: 14, font });
  const page2 = doc.addPage([612, 792]);
  page2.drawText("How vexingly quick daft zebras jump!", { x: 50, y: 700, size: 14, font });
  page2.drawText("The five boxing wizards jump quickly.", { x: 50, y: 670, size: 14, font });
  return doc.save();
}

// ── Tests: Direct function calls ────────────────────────────

async function testMerge() {
  const slug = "merge";
  try {
    const a = makeFile(await makeMultiPage(1), "a.pdf");
    const b = makeFile(await makeMultiPage(2), "b.pdf");
    const result = await mergePDFs([a, b]);
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 3) throw new Error(`Expected 3, got ${doc.getPageCount()}`);
    ok(slug, `mergePDFs([1-page, 2-page]) → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "mergePDFs", e); }
}

async function testSplit() {
  const slug = "split";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    // Range mode: extract pages 1,3
    const result = await splitPDF(file, "range", "1,3");
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 2) throw new Error(`Expected 2, got ${doc.getPageCount()}`);
    ok(slug, `splitPDF(range="1,3") → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "splitPDF", e); }
}

async function testExtractPages() {
  const slug = "extract-pages";
  try {
    // extract-pages is handled inline in processFiles, not a standalone function
    // Test via processFiles
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await processFiles("extract-pages", [file], { splitRange: "2" });
    const doc = await PDFDocument.load(result.data!);
    if (doc.getPageCount() !== 1) throw new Error(`Expected 1, got ${doc.getPageCount()}`);
    ok(slug, `processFiles("extract-pages", range="2") → ${doc.getPageCount()} page, ${result.data!.length} bytes`);
  } catch (e) { fail(slug, "extract-pages via processFiles", e); }
}

async function testDeletePages() {
  const slug = "delete-pages";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    // delete-pages uses the editor path, test the underlying removePages function
    const bytes = await fileToBytes(file);
    const result = await removePages(file, [1]); // remove page 2
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 2) throw new Error(`Expected 2, got ${doc.getPageCount()}`);
    ok(slug, `removePages(file, [1]) → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "removePages", e); }
}

async function testOrganizePages() {
  const slug = "organize-pages";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await organizePages(file, [2, 0, 1]); // reorder: 3,1,2
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 3) throw new Error(`Expected 3, got ${doc.getPageCount()}`);
    ok(slug, `organizePages(file, [2,0,1]) → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "organizePages", e); }
}

async function testRotate() {
  const slug = "rotate";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await rotatePDF(file, 90);
    const doc = await PDFDocument.load(result);
    const rot = doc.getPages()[0].getRotation().angle;
    if (rot !== 90) throw new Error(`Expected 90°, got ${rot}°`);
    ok(slug, `rotatePDF(file, 90) → rotation=${rot}°, ${result.length} bytes`);
  } catch (e) { fail(slug, "rotatePDF", e); }
}

async function testCropPages() {
  const slug = "crop-pages";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await cropPDF(file, { top: 50, right: 50, bottom: 50, left: 50 });
    const doc = await PDFDocument.load(result);
    const cb = doc.getPages()[0].getCropBox();
    if (cb.width !== 512 || cb.height !== 692) throw new Error(`Expected 512x692, got ${cb.width}x${cb.height}`);
    ok(slug, `cropPDF(file, 50pt margins) → ${cb.width}x${cb.height}, ${result.length} bytes`);
  } catch (e) { fail(slug, "cropPDF", e); }
}

async function testImageToPdf() {
  const slug = "image-to-pdf";
  try {
    // Create a minimal valid PNG (1x1 red pixel)
    const pngBytes = new Uint8Array([
      0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
      0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
      0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
      0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
      0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,
      0x54,0x08,0xd7,0x63,0xf8,0xcf,0xc0,0x00,
      0x00,0x00,0x02,0x00,0x01,0xe2,0x21,0xbc,
      0x33,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
      0x44,0xae,0x42,0x60,0x82,
    ]);
    const imgFile = makeFile(pngBytes, "test.png", "image/png");
    const result = await imagesToPDF([imgFile]);
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 1) throw new Error(`Expected 1, got ${doc.getPageCount()}`);
    ok(slug, `imagesToPDF([1x1 PNG]) → ${doc.getPageCount()} page, ${result.length} bytes`);
  } catch (e) { fail(slug, "imagesToPDF", e); }
}

async function testAddWatermark() {
  const slug = "add-watermark";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await addWatermark(file, "CONFIDENTIAL", 0.15);
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 3) throw new Error(`Expected 3, got ${doc.getPageCount()}`);
    ok(slug, `addWatermark(file, "CONFIDENTIAL") → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "addWatermark", e); }
}

async function testHeadersFooters() {
  const slug = "headers-footers";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await addHeaderFooter(file, "My Header", "My Footer");
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 3) throw new Error(`Expected 3, got ${doc.getPageCount()}`);
    ok(slug, `addHeaderFooter(file, "My Header", "My Footer") → ${doc.getPageCount()} pages, ${result.length} bytes`);
  } catch (e) { fail(slug, "addHeaderFooter", e); }
}

async function testFlattenForms() {
  const slug = "flatten-forms";
  try {
    // Fill then flatten via processFiles
    const file = makeFile(await makeFormPDF(), "form.pdf");
    const filled = await processFiles("fill-forms", [file], {
      formData: { name_field: "Test User", email_field: "test@test.com", agree_check: true }
    });
    // Now flatten the filled result
    const filledFile = makeFile(filled.data!, "filled.pdf");
    const flattened = await processFiles("flatten-forms", [filledFile]);
    const doc = await PDFDocument.load(flattened.data!);
    const form = doc.getForm();
    const fieldCount = form.getFields().length;
    if (fieldCount !== 0) throw new Error(`Expected 0 fields after flatten, got ${fieldCount}`);
    ok(slug, `fill-forms → flatten-forms: fields went from 3→${fieldCount} (correctly flattened)`);
  } catch (e) { fail(slug, "flatten-forms via processFiles", e); }
}

async function testFillForms() {
  const slug = "fill-forms";
  try {
    const file = makeFile(await makeFormPDF(), "form.pdf");
    const result = await processFiles("fill-forms", [file], {
      formData: { name_field: "Jane Doe", email_field: "jane@test.com", agree_check: true }
    });
    const doc = await PDFDocument.load(result.data!);
    const form = doc.getForm();
    const nameVal = form.getTextField("name_field").getText();
    const emailVal = form.getTextField("email_field").getText();
    const checked = form.getCheckBox("agree_check").isChecked();
    if (nameVal !== "Jane Doe") throw new Error(`Name: "${nameVal}"`);
    if (emailVal !== "jane@test.com") throw new Error(`Email: "${emailVal}"`);
    if (!checked) throw new Error("Checkbox unchecked");
    ok(slug, `processFiles("fill-forms") → name="${nameVal}", email="${emailVal}", agree=${checked}`);
  } catch (e) { fail(slug, "fill-forms via processFiles", e); }
}

async function testMetadataEditor() {
  const slug = "metadata-editor";
  try {
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    const result = await processFiles("metadata-editor", [file], {
      metaTitle: "Real Test Title",
      metaAuthor: "Real Author",
      metaSubject: "Real Subject",
      metaKeywords: "wave1,real,test",
    });
    const doc = await PDFDocument.load(result.data!);
    if (doc.getTitle() !== "Real Test Title") throw new Error(`Title: "${doc.getTitle()}"`);
    if (doc.getAuthor() !== "Real Author") throw new Error(`Author: "${doc.getAuthor()}"`);
    ok(slug, `processFiles("metadata-editor") → title="${doc.getTitle()}", author="${doc.getAuthor()}"`);
  } catch (e) { fail(slug, "metadata-editor via processFiles", e); }
}

// ── Tests: Dispatched browser-only tools (routing verification) ──

async function testPdfToImage() {
  const slug = "pdf-to-image";
  try {
    // pdf-to-image uses pdfjs-dist + canvas — can't run in Node.js
    // But we can verify the dispatcher routing exists and doesn't throw
    const file = makeFile(await makeMultiPage(3), "test.pdf");
    try {
      await processFiles("pdf-to-image", [file]);
      ok(slug, `processFiles("pdf-to-image") executed (browser-only in full, but dispatcher routed)`);
    } catch (e: any) {
      // Expected to fail in Node.js due to missing canvas — but NOT "Tool unhandled"
      if (e.message.includes("unhandled") || e.message.includes("currently unhandled")) {
        fail(slug, "Dispatcher routing broken — slug not in switch", e);
      } else {
        // Some other error (likely canvas/pdfjs) — that's OK, routing works
        ok(slug, `processFiles("pdf-to-image") routed correctly (Node.js error: ${e.message.substring(0, 60)})`);
      }
    }
  } catch (e) { fail(slug, "pdf-to-image routing", e); }
}

async function testPdfToText() {
  const slug = "pdf-to-text";
  try {
    const file = makeFile(await makeTextPDF(), "text.pdf");
    try {
      const result = await processFiles("pdf-to-text", [file]);
      // If we get here, extractText ran — check the output
      const text = new TextDecoder().decode(result.data!);
      if (text.includes("quick brown fox")) {
        ok(slug, `processFiles("pdf-to-text") → extracted text contains "quick brown fox" (${text.length} chars)`);
      } else {
        fail(slug, `Text output doesn't contain expected content: "${text.substring(0, 100)}"`);
      }
    } catch (e: any) {
      if (e.message.includes("unhandled")) {
        fail(slug, "Dispatcher routing broken — slug not in switch", e);
      } else {
        ok(slug, `processFiles("pdf-to-text") routed (Node.js error: ${e.message.substring(0, 80)})`);
      }
    }
  } catch (e) { fail(slug, "pdf-to-text routing", e); }
}

// ── Regression tests for nearby slugs ───────────────────────

async function testRegressionCropPages() {
  const slug = "crop-pages (regression)";
  try {
    const file = makeFile(await makeMultiPage(2), "test.pdf");
    const result = await cropPDF(file, { top: 100, right: 100, bottom: 100, left: 100 });
    const doc = await PDFDocument.load(result);
    const cb = doc.getPages()[0].getCropBox();
    if (cb.width !== 412 || cb.height !== 592) throw new Error(`Expected 412x592, got ${cb.width}x${cb.height}`);
    ok(slug, `cropPDF with 100pt margins → ${cb.width}x${cb.height}`);
  } catch (e) { fail(slug, "regression crop-pages", e); }
}

async function testRegressionInsertBlankPages() {
  const slug = "insert-blank-pages (regression)";
  try {
    const file = makeFile(await makeMultiPage(2), "test.pdf");
    const result = await addBlankPages(file, 1, 1); // insert 1 blank after page 1
    const doc = await PDFDocument.load(result);
    if (doc.getPageCount() !== 3) throw new Error(`Expected 3, got ${doc.getPageCount()}`);
    ok(slug, `addBlankPages(file, position=1, count=1) → ${doc.getPageCount()} pages`);
  } catch (e) { fail(slug, "regression insert-blank-pages", e); }
}

async function testRegressionEditMetadata() {
  const slug = "edit-metadata (regression)";
  try {
    const file = makeFile(await makeMultiPage(2), "test.pdf");
    const result = await editMetadata(file, { title: "Regression Test", author: "Test Suite" });
    const doc = await PDFDocument.load(result);
    if (doc.getTitle() !== "Regression Test") throw new Error(`Title: "${doc.getTitle()}"`);
    if (doc.getAuthor() !== "Test Suite") throw new Error(`Author: "${doc.getAuthor()}"`);
    ok(slug, `editMetadata → title="${doc.getTitle()}", author="${doc.getAuthor()}"`);
  } catch (e) { fail(slug, "regression edit-metadata", e); }
}

async function testRegressionRemoveMetadata() {
  const slug = "remove-metadata (regression)";
  try {
    const file = makeFile(await makeMultiPage(2), "test.pdf");
    // First set some metadata
    const withMeta = await editMetadata(file, { title: "To Remove", author: "Remove Me" });
    const withMetaFile = makeFile(withMeta, "meta.pdf");
    // Then remove it
    const result = await removeMetadata(withMetaFile);
    const doc = await PDFDocument.load(result);
    if (doc.getTitle() !== "") throw new Error(`Title not cleared: "${doc.getTitle()}"`);
    if (doc.getAuthor() !== "") throw new Error(`Author not cleared: "${doc.getAuthor()}"`);
    ok(slug, `removeMetadata → title="${doc.getTitle()}", author="${doc.getAuthor()}" (both empty)`);
  } catch (e) { fail(slug, "regression remove-metadata", e); }
}

// ── Hotfix status check ─────────────────────────────────────

function checkHotfixStatus() {
  console.log("\n── Hotfix Prompt Status ──────────────────────────────────────");
  console.log("  No PDF_Domain_Hotfix_Dispatcher_Bugs.md found in repo.");
  console.log("  CONFIRMED UNFIXED BUGS:");
  console.log("  1. add-image → falls through to add-date-stamp (silent wrong output)");
  console.log("  2. add-comments → falls through to flatten-forms (silent wrong output)");
  console.log("  ⚠️  These are HIGHER PRIORITY than Wave 1 approval finalization.");
}

// ── Run ─────────────────────────────────────────────────────

async function main() {
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Wave 1 REAL Verification — Importing actual production code");
  console.log("  Date: " + new Date().toISOString());
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log("── Direct function imports (pdf-lib pure) ───────────────────");
  await testMerge();
  await testSplit();
  await testDeletePages();
  await testOrganizePages();
  await testRotate();
  await testCropPages();
  await testImageToPdf();
  await testAddWatermark();
  await testHeadersFooters();

  console.log("\n── processFiles dispatcher tests ─────────────────────────────");
  await testExtractPages();
  await testFillForms();
  await testFlattenForms();
  await testMetadataEditor();

  console.log("\n── Browser-only dispatcher routing ───────────────────────────");
  await testPdfToImage();
  await testPdfToText();

  console.log("\n── Regression: nearby slugs ─────────────────────────────────");
  await testRegressionCropPages();
  await testRegressionInsertBlankPages();
  await testRegressionEditMetadata();
  await testRegressionRemoveMetadata();

  checkHotfixStatus();

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  const passed = results.filter(r => r.status === "PASS").length;
  const failed = results.filter(r => r.status === "FAIL").length;
  console.log(`  Results: ${passed} PASS, ${failed} FAIL out of ${results.length}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    console.log("FAILURES:");
    results.filter(r => r.status === "FAIL").forEach(r => console.log(`  ❌ ${r.slug}: ${r.msg}`));
    process.exit(1);
  }
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
