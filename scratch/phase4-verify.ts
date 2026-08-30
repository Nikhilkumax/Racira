/**
 * PHASE 4 VERIFICATION
 * Tests the 6 newly wired standalone functions.
 * Run: npx tsx scratch/phase4-verify.ts
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

async function main() {
  console.log("✅ processFiles imported\n");

  const pdf = await createTestPDF();

  // 1. pdf-to-base64
  console.log("── pdf-to-base64 ──");
  try {
    const r = await processFiles("pdf-to-base64", [pdf]);
    const text = new TextDecoder().decode(r.data);
    console.log(`✅ ${r.filename} (${r.data.length} bytes) — base64 starts: ${text.substring(0, 60)}...`);
    console.log(`   Valid base64: ${/^[A-Za-z0-9+/=\s]+$/.test(text.trim())}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }

  // 2. base64-to-pdf
  console.log("\n── base64-to-pdf ──");
  try {
    // First get base64 of test PDF
    const b64Result = await processFiles("pdf-to-base64", [pdf]);
    const b64Text = new TextDecoder().decode(b64Result.data);
    // Create a file from the base64 text
    const b64File = new File([b64Text], "encoded.txt", { type: "text/plain" });
    const r = await processFiles("base64-to-pdf", [b64File]);
    const doc = await PDFDocument.load(r.data);
    console.log(`✅ ${r.filename} (${r.data.length} bytes) — pages: ${doc.getPageCount()}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }

  // 3. invert-colors
  console.log("\n── invert-colors ──");
  try {
    const r = await processFiles("invert-colors", [pdf]);
    const doc = await PDFDocument.load(r.data);
    console.log(`✅ ${r.filename} (${r.data.length} bytes) — pages: ${doc.getPageCount()}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }

  // 4. grayscale-pdf
  console.log("\n── grayscale-pdf ──");
  try {
    const r = await processFiles("grayscale-pdf", [pdf]);
    const doc = await PDFDocument.load(r.data);
    console.log(`✅ ${r.filename} (${r.data.length} bytes) — pages: ${doc.getPageCount()}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }

  // 5. remove-metadata
  console.log("\n── remove-metadata ──");
  try {
    // First set metadata
    await processFiles("edit-metadata", [pdf], { title: "To Remove", author: "Author" });
    const r = await processFiles("remove-metadata", [pdf]);
    const doc = await PDFDocument.load(r.data);
    console.log(`✅ ${r.filename} (${r.data.length} bytes)`);
    console.log(`   title="${doc.getTitle()}" author="${doc.getAuthor()}"`);
    console.log(`   Metadata cleared: ${doc.getTitle() === "" && doc.getAuthor() === ""}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }

  // 6. pdf-statistics
  console.log("\n── pdf-statistics ──");
  try {
    const r = await processFiles("pdf-statistics", [pdf]);
    const json = JSON.parse(new TextDecoder().decode(r.data));
    console.log(`✅ ${r.filename} (${r.data.length} bytes)`);
    console.log(`   pageCount: ${json.pageCount}, fileSizeBytes: ${json.fileSizeBytes}`);
  } catch (e: any) { console.log(`❌ ${e.message}`); }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
