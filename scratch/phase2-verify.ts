/**
 * PHASE 2 VERIFICATION
 * Tests the newly registered orphan tools.
 * Run: npx tsx scratch/phase2-verify.ts
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { processFiles } from "@/lib/pdf/pdf-tools";

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

type Result = { slug: string; status: string; size: number; ext: string; msg: string };

async function main() {
  console.log("✅ processFiles imported\n");

  const results: Result[] = [];

  async function test(slug: string, fn: () => Promise<any>) {
    try {
      const result = await fn();
      const isStub = result.type === "coming-soon";
      const hasData = result.data && result.data.length > 0;
      const status = isStub ? "STUB" : hasData ? "PASS" : "PASS (no data)";
      const size = result.data ? result.data.length : 0;
      const ext = result.filename?.split(".").pop() || "?";
      const msg = result.message || "";
      results.push({ slug, status, size, ext, msg });
      return result;
    } catch (err: any) {
      results.push({ slug, status: "ERROR", size: 0, ext: "?", msg: err.message?.substring(0, 120) || "" });
      return null;
    }
  }

  const pdf = await createTestPDF();

  // Test each newly registered tool
  await test("split-every-n", () => processFiles("split-every-n", [pdf], { n: 2 }));
  await test("add-arrow", () => processFiles("add-arrow", [pdf], { page: 1, x1: 50, y1: 400, x2: 200, y2: 300 }));
  await test("create-booklet", () => processFiles("create-booklet", [pdf]));
  await test("add-margin", () => processFiles("add-margin", [pdf], { margin: 20 }));
  await test("duplex-simulator", () => processFiles("duplex-simulator", [pdf], { flipEdge: "long" }));
  await test("version-checker", () => processFiles("version-checker", [pdf]));
  await test("add-pdf-properties", () => processFiles("add-pdf-properties", [pdf], { title: "Test Title", author: "Test Author" }));
  await test("optimize-fonts", () => processFiles("optimize-fonts", [pdf]));
  await test("edit-metadata", () => processFiles("edit-metadata", [pdf], { title: "Edited" }));
  await test("add-page-numbers", () => processFiles("add-page-numbers", [pdf], { pageNumberPosition: "bottom-center", pageNumberStart: 1 }));
  await test("pdf-size-analyzer", () => processFiles("pdf-size-analyzer", [pdf]));

  // These need browser (pdfjs) - will error in Node
  await test("image-extractor", () => processFiles("image-extractor", [pdf]));
  await test("attachment-inspector", () => processFiles("attachment-inspector", [pdf]));

  // highlight-form-fields needs form fields
  const formDoc = await PDFDocument.create();
  const font = await formDoc.embedFont(StandardFonts.Helvetica);
  const page = formDoc.addPage([612, 792]);
  page.drawText("Form", { x: 50, y: 700, size: 16, font });
  const form = formDoc.getForm();
  form.createTextField("name").addToPage(page, { x: 50, y: 650, width: 200, height: 30 });
  const formBytes = await formDoc.save();
  const formFile = new File([new Uint8Array(formBytes)], "form.pdf", { type: "application/pdf" });
  await test("highlight-form-fields", () => processFiles("highlight-form-fields", [formFile], { fillColor: "#ffff00" }));

  // ── RESULTS ──
  console.log("═══════════════════════════════════════════════════════");
  console.log("PHASE 2 VERIFICATION RESULTS");
  console.log("═══════════════════════════════════════════════════════\n");

  const pass = results.filter(r => r.status.startsWith("PASS"));
  const stubs = results.filter(r => r.status === "STUB");
  const errors = results.filter(r => r.status === "ERROR");

  console.log(`Total: ${results.length} | PASS: ${pass.length} | STUB: ${stubs.length} | ERROR: ${errors.length}\n`);

  for (const r of results) {
    const icon = r.status.startsWith("PASS") ? "✅" : r.status === "STUB" ? "⏳" : "⚠️";
    console.log(`${icon} ${r.slug.padEnd(22)} ${r.status.padEnd(16)} ${r.ext.padEnd(5)} ${String(r.size).padStart(8)} bytes`);
  }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
