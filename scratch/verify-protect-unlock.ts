import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { processFiles } from "@/lib/pdf/pdf-tools";

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p = doc.addPage([612, 792]);
  p.drawText("Protected Test", { x: 50, y: 700, size: 16, font, color: rgb(0,0,0) });
  const bytes = await doc.save();
  const file = new File([new Uint8Array(bytes)], "test.pdf", { type: "application/pdf" });

  // Test protect
  console.log("── protect ──");
  const protected_ = await processFiles("protect", [file], { userPassword: "user123", ownerPassword: "owner456" });
  console.log(`  filename: ${protected_.filename}`);
  console.log(`  size: ${protected_.data.length} bytes`);
  const protDoc = await PDFDocument.load(protected_.data);
  console.log(`  isEncrypted: ${protDoc.isEncrypted}`);
  console.log(`  PASS: ${protected_.filename === "protected.pdf" && protected_.data.length > 0}`);

  // Test unlock on the protected file
  console.log("\n── unlock ──");
  // Create a protected file first using protectPDF directly
  const { protectPDF } = await import("@/lib/pdf/pdf-tools");
  const protectedBytes = await protectPDF(file, "user123", "owner456");
  const protectedFile = new File([new Uint8Array(protectedBytes)], "protected.pdf", { type: "application/pdf" });
  
  const unlocked = await processFiles("unlock", [protectedFile], { password: "user123" });
  console.log(`  filename: ${unlocked.filename}`);
  console.log(`  size: ${unlocked.data.length} bytes`);
  const unlockedDoc = await PDFDocument.load(unlocked.data);
  console.log(`  pages: ${unlockedDoc.getPageCount()}`);
  console.log(`  PASS: ${unlocked.filename === "unlocked.pdf" && unlockedDoc.getPageCount() === 1}`);

  // Test unlock with wrong password
  console.log("\n── unlock (wrong password) ──");
  try {
    await processFiles("unlock", [protectedFile], { password: "wrong" });
    console.log("  ❌ Should have thrown");
  } catch (e: any) {
    console.log(`  ✅ Correctly threw: ${e.message.substring(0, 60)}`);
  }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
