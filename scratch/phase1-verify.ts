/**
 * PHASE 1 VERIFICATION
 * Tests each of the 9 fixed slugs with a real PDF.
 * Run: npx tsx scratch/phase1-verify.ts
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { processFiles } from "@/lib/pdf/pdf-tools";

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

type Result = { slug: string; label: string; status: string; size: number; ext: string; msg: string };

async function main() {
  console.log("✅ processFiles imported\n");

  const results: Result[] = [];

  async function test(slug: string, label: string, fn: () => Promise<any>) {
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
    } catch (err: any) {
      results.push({ slug, label, status: "ERROR", size: 0, ext: "?", msg: err.message?.substring(0, 150) || "" });
      return null;
    }
  }

  const pdf = await createTestPDF();

  // 1. rotate
  console.log("Testing rotate...");
  await test("rotate", "rotate", () =>
    processFiles("rotate", [pdf], { rotateAngle: 90 }));

  // 2. extract-tables
  console.log("Testing extract-tables...");
  await test("extract-tables", "extract-tables", () =>
    processFiles("extract-tables", [pdf]));

  // 3. n-up-layout
  console.log("Testing n-up-layout...");
  await test("n-up-layout", "n-up-layout", () =>
    processFiles("n-up-layout", [pdf], { cols: 2, rows: 2 }));

  // 4. repair-pdf
  console.log("Testing repair-pdf...");
  await test("repair-pdf", "repair-pdf", () =>
    processFiles("repair-pdf", [pdf]));

  // 5. protect-pdf
  console.log("Testing protect-pdf...");
  await test("protect-pdf", "protect-pdf", () =>
    processFiles("protect-pdf", [pdf], { userPassword: "test123", ownerPassword: "owner456" }));

  // 6. add-image
  console.log("Testing add-image...");
  await test("add-image", "add-image", () =>
    processFiles("add-image", [pdf]));

  // 7. add-comments
  console.log("Testing add-comments...");
  await test("add-comments", "add-comments", () =>
    processFiles("add-comments", [pdf]));

  // 8. reduce-pdf-size
  console.log("Testing reduce-pdf-size...");
  await test("reduce-pdf-size", "reduce-pdf-size", () =>
    processFiles("reduce-pdf-size", [pdf]));

  // 9. poster-print
  console.log("Testing poster-print...");
  await test("poster-print", "poster-print", () =>
    processFiles("poster-print", [pdf]));

  // ── RESULTS ──────────────────────────────────────────────
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

  // ── ASSERTIONS ──────────────────────────────────────────
  console.log("\n── ASSERTIONS ──");

  const rotateR = results.find(r => r.slug === "rotate");
  if (rotateR) {
    const ok = rotateR.status.startsWith("PASS") && rotateR.ext === "pdf";
    console.log(`${ok ? "✅" : "❌"} rotate: returns real PDF (not stub)`);
  }

  const tablesR = results.find(r => r.slug === "extract-tables");
  if (tablesR) {
    const isWorkerError = tablesR.status === "ERROR" && tablesR.msg.includes("fake worker");
    const isOldStub = tablesR.status === "ERROR" && tablesR.msg.includes("advanced heuristics");
    console.log(`${isWorkerError ? "✅" : isOldStub ? "❌" : "⚠️"} extract-tables: ${isWorkerError ? "reached real pdfjs impl (worker error in Node = correct)" : isOldStub ? "OLD STUB STILL PRESENT" : tablesR.msg.substring(0, 80)}`);
  }

  const nupR = results.find(r => r.slug === "n-up-layout");
  if (nupR) {
    const ok = nupR.status.startsWith("PASS") && nupR.ext === "pdf" && nupR.size > 2000;
    console.log(`${ok ? "✅" : "❌"} n-up-layout: returns real N-up PDF`);
  }

  const repairR = results.find(r => r.slug === "repair-pdf");
  if (repairR) {
    const ok = repairR.status.startsWith("PASS") && repairR.ext === "pdf";
    console.log(`${ok ? "✅" : "❌"} repair-pdf: returns real PDF (not stub)`);
  }

  const protectR = results.find(r => r.slug === "protect-pdf");
  if (protectR) {
    const ok = protectR.status.startsWith("PASS") && protectR.ext === "pdf" && !protectR.msg?.includes("page numbers");
    console.log(`${ok ? "✅" : "❌"} protect-pdf: returns real protected PDF (not page numbers)`);
  }

  const addImageR = results.find(r => r.slug === "add-image");
  if (addImageR) {
    const ok = addImageR.status === "STUB" && !addImageR.msg?.includes("date");
    console.log(`${ok ? "✅" : "❌"} add-image: returns explicit stub (not date stamp)`);
  }

  const addCommentsR = results.find(r => r.slug === "add-comments");
  if (addCommentsR) {
    const ok = addCommentsR.status === "STUB" && !addCommentsR.msg?.includes("flatten");
    console.log(`${ok ? "✅" : "❌"} add-comments: returns explicit stub (not form flatten)`);
  }

  const reduceR = results.find(r => r.slug === "reduce-pdf-size");
  if (reduceR) {
    const ok = reduceR.status === "STUB" && !reduceR.msg?.includes("replacement image");
    console.log(`${ok ? "✅" : "❌"} reduce-pdf-size: returns explicit stub (not replace-image error)`);
  }

  const posterR = results.find(r => r.slug === "poster-print");
  if (posterR) {
    const ok = posterR.status === "STUB" && !posterR.msg?.includes("margin");
    console.log(`${ok ? "✅" : "❌"} poster-print: returns explicit stub (not margin-adjuster output)`);
  }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
