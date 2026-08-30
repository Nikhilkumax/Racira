/**
 * PHASE 1 VERIFICATION
 * Tests each of the 9 fixed slugs with a real PDF.
 * Run: npx tsx scratch/phase1-verify.mjs
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Create a 3-page test PDF
async function createTestPDF() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([612, 792]);
    p.drawText(`Page ${i}`, { x: 50, y: 700, size: 16, font, color: rgb(0, 0, 0) });
  }
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], "test.pdf", { type: "application/pdf" });
}

async function createTestPDFWithForms() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  page.drawText("Form PDF", { x: 50, y: 700, size: 16, font });
  const form = doc.getForm();
  form.createTextField("name_field").addToPage(page, { x: 50, y: 650, width: 200, height: 30 });
  form.createCheckBox("agree_check").addToPage(page, { x: 50, y: 600, width: 20, height: 20 });
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], "form.pdf", { type: "application/pdf" });
}

const { processFiles } = await import("../../src/lib/pdf/pdf-tools.ts");
console.log("✅ processFiles imported\n");

const results = [];

async function test(slug, label, fn) {
  try {
    const result = await fn();
    const isStub = result.type === "coming-soon";
    const hasData = result.data && result.data.length > 0;
    const status = isStub ? "STUB" : hasData ? "PASS" : "PASS (no data)";
    const size = result.data ? result.data.length : 0;
    const ext = result.filename?.split(".").pop() || "?";
    const msg = result.message || "";
    results.push({ slug, label, status, size, ext, msg });
    return result;
  } catch (err) {
    results.push({ slug, label, status: "ERROR", size: 0, ext: "?", msg: err.message?.substring(0, 150) });
    return null;
  }
}

const pdf = await createTestPDF();
const formPdf = await createTestPDFWithForms();

// 1. rotate — should return real rotated PDF, not stub
console.log("Testing rotate...");
await test("rotate", "rotate → should call rotatePDF, not stub", () =>
  processFiles("rotate", [pdf], { rotateAngle: 90 }));

// 2. extract-tables — should return real table extraction, not stub text
console.log("Testing extract-tables...");
await test("extract-tables", "extract-tables → should use real extraction logic", () =>
  processFiles("extract-tables", [pdf]));

// 3. n-up-layout — should return real N-up PDF, not stub
console.log("Testing n-up-layout...");
await test("n-up-layout", "n-up-layout → should produce real N-up layout", () =>
  processFiles("n-up-layout", [pdf], { cols: 2, rows: 2 }));

// 4. repair-pdf — should return real repaired PDF, not stub
console.log("Testing repair-pdf...");
await test("repair-pdf", "repair-pdf → should re-save through pdf-lib", () =>
  processFiles("repair-pdf", [pdf]));

// 5. protect-pdf — should return real protected PDF, not fall-through to add-page-numbers
console.log("Testing protect-pdf...");
const protectResult = await test("protect-pdf", "protect-pdf → should call protectPDF, not add-page-numbers", () =>
  processFiles("protect-pdf", [pdf], { userPassword: "test123", ownerPassword: "owner456" }));
// Verify it's actually password-protected by loading with wrong password
if (protectResult && protectResult.data) {
  try {
    const doc = await PDFDocument.load(protectResult.data, { ignoreEncryption: false });
    // If it loads without password, the protection didn't work
    console.log("  ⚠️  Document loaded without password — checking encryption flag...");
    console.log(`  isEncrypted: ${doc.isEncrypted}`);
  } catch (e) {
    console.log(`  ✅ Document is password-protected (load without password failed: ${e.message?.substring(0, 80)})`);
  }
}

// 6. add-image — should return stub, NOT fall through to add-date-stamp
console.log("Testing add-image...");
const addImageResult = await test("add-image", "add-image → should be explicit stub, not date stamp", () =>
  processFiles("add-image", [pdf]));
if (addImageResult && addImageResult.type === "coming-soon") {
  console.log(`  ✅ Correctly returns stub: "${addImageResult.message?.substring(0, 60)}..."`);
}

// 7. add-comments — should return stub, NOT fall through to flatten-forms
console.log("Testing add-comments...");
const addCommentsResult = await test("add-comments", "add-comments → should be explicit stub, not flatten-forms", () =>
  processFiles("add-comments", [pdf]));
if (addCommentsResult && addCommentsResult.type === "coming-soon") {
  console.log(`  ✅ Correctly returns stub: "${addCommentsResult.message?.substring(0, 60)}..."`);
}

// 8. reduce-pdf-size — should return stub, NOT fall through to replace-image
console.log("Testing reduce-pdf-size...");
const reduceResult = await test("reduce-pdf-size", "reduce-pdf-size → should be explicit stub, not replace-image", () =>
  processFiles("reduce-pdf-size", [pdf]));
if (reduceResult && reduceResult.type === "coming-soon") {
  console.log(`  ✅ Correctly returns stub: "${reduceResult.message?.substring(0, 60)}..."`);
}

// 9. poster-print — should return stub, NOT fall through to print-margin-adjuster
console.log("Testing poster-print...");
const posterResult = await test("poster-print", "poster-print → should be explicit stub, not margin-adjuster", () =>
  processFiles("poster-print", [pdf]));
if (posterResult && posterResult.type === "coming-soon") {
  console.log(`  ✅ Correctly returns stub: "${posterResult.message?.substring(0, 60)}..."`);
}

// ── RESULTS ──────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════");
console.log("PHASE 1 VERIFICATION RESULTS");
console.log("═══════════════════════════════════════════════════════\n");

const pass = results.filter(r => r.status.startsWith("PASS"));
const stubs = results.filter(r => r.status === "STUB");
const errors = results.filter(r => r.status === "ERROR");

console.log(`Total: ${results.length} | PASS: ${pass.length} | STUB: ${stubs.length} | ERROR: ${errors.length}\n`);

for (const r of results) {
  const icon = r.status.startsWith("PASS") ? "✅" : r.status === "STUB" ? "⏳" : "❌";
  console.log(`${icon} ${r.slug.padEnd(18)} ${r.status.padEnd(18)} ${r.ext.padEnd(5)} ${String(r.size).padStart(8)} bytes  ${r.msg || r.label}`);
}

// ── Specific assertions ──────────────────────────────────────
console.log("\n── ASSERTIONS ──");

const rotateR = results.find(r => r.slug === "rotate");
if (rotateR) {
  const ok = rotateR.status.startsWith("PASS") && rotateR.ext === "pdf";
  console.log(`${ok ? "✅" : "❌"} rotate: returns real PDF (not stub) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const tablesR = results.find(r => r.slug === "extract-tables");
if (tablesR) {
  const ok = tablesR.status.startsWith("PASS") && tablesR.ext !== "txt";
  console.log(`${ok ? "✅" : "❌"} extract-tables: returns real extraction (not stub txt) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const nupR = results.find(r => r.slug === "n-up-layout");
if (nupR) {
  const ok = nupR.status.startsWith("PASS") && nupR.ext === "pdf" && nupR.size > 2000;
  console.log(`${ok ? "✅" : "❌"} n-up-layout: returns real N-up PDF → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const repairR = results.find(r => r.slug === "repair-pdf");
if (repairR) {
  const ok = repairR.status.startsWith("PASS") && repairR.ext === "pdf";
  console.log(`${ok ? "✅" : "❌"} repair-pdf: returns real PDF (not stub) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const protectR = results.find(r => r.slug === "protect-pdf");
if (protectR) {
  const ok = protectR.status.startsWith("PASS") && protectR.ext === "pdf" && !protectR.msg?.includes("page numbers");
  console.log(`${ok ? "✅" : "❌"} protect-pdf: returns real protected PDF (not page numbers) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const addImageR = results.find(r => r.slug === "add-image");
if (addImageR) {
  const ok = addImageR.status === "STUB" && !addImageR.msg?.includes("date");
  console.log(`${ok ? "✅" : "❌"} add-image: returns explicit stub (not date stamp) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const addCommentsR = results.find(r => r.slug === "add-comments");
if (addCommentsR) {
  const ok = addCommentsR.status === "STUB" && !addCommentsR.msg?.includes("flatten");
  console.log(`${ok ? "✅" : "❌"} add-comments: returns explicit stub (not form flatten) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const reduceR = results.find(r => r.slug === "reduce-pdf-size");
if (reduceR) {
  const ok = reduceR.status === "STUB" && !reduceR.msg?.includes("replacement image");
  console.log(`${ok ? "✅" : "❌"} reduce-pdf-size: returns explicit stub (not replace-image error) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}

const posterR = results.find(r => r.slug === "poster-print");
if (posterR) {
  const ok = posterR.status === "STUB" && !posterR.msg?.includes("margin");
  console.log(`${ok ? "✅" : "❌"} poster-print: returns explicit stub (not margin-adjuster output) → ${ok ? "FIXED" : "STILL BROKEN"}`);
}
