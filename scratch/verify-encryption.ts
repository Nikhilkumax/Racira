/**
 * VERIFY: protect + unlock end-to-end encryption.
 * Tests whether pdf-lib's password protection actually works.
 * Run: npx tsx scratch/verify-encryption.ts
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

async function createTestPDF(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p = doc.addPage([612, 792]);
  p.drawText("Secret Document", { x: 50, y: 700, size: 24, font, color: rgb(0, 0, 0) });
  p.drawText("This page has confidential content.", { x: 50, y: 660, size: 14, font });
  p.drawText("Page 1 of 1", { x: 50, y: 620, size: 12, font });
  const p2 = doc.addPage([612, 792]);
  p2.drawText("Page 2: More Secrets", { x: 50, y: 700, size: 24, font, color: rgb(0, 0, 0) });
  return doc.save();
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("ENCRYPTION VERIFICATION");
  console.log("═══════════════════════════════════════════════════════\n");

  // ── STEP 1: Create test PDF ──────────────────────────────
  const origBytes = await createTestPDF();
  const origDoc = await PDFDocument.load(origBytes);
  console.log(`Original PDF: ${origBytes.length} bytes, ${origDoc.getPageCount()} pages`);
  console.log(`Title: "${origDoc.getTitle() || '(none)'}"`);
  console.log(`Author: "${origDoc.getAuthor() || '(none)'}"`);
  console.log();

  const file = new File([new Uint8Array(origBytes)], "secret.pdf", { type: "application/pdf" });

  // ── STEP 2: Test protectPDF directly ──────────────────────
  console.log("── TEST 1: protectPDF() direct call ──");
  const { protectPDF, unlockPDF } = await import("@/lib/pdf/pdf-tools");

  const protectedBytes = await protectPDF(file, "mypassword", "ownerpass123");
  console.log(`Protected PDF: ${protectedBytes.length} bytes`);
  console.log(`Original size: ${origBytes.length} bytes`);
  console.log(`Size difference: ${protectedBytes.length - origBytes.length} bytes`);

  // Check raw bytes for /Encrypt dictionary
  const rawStr = new TextDecoder("latin1").decode(protectedBytes);
  const hasEncrypt = rawStr.includes("/Encrypt");
  const hasStdID = rawStr.includes("/StdID");
  const hasU = rawStr.includes("/U ");
  const hasO = rawStr.includes("/O ");
  console.log(`Raw bytes contain /Encrypt: ${hasEncrypt}`);
  console.log(`Raw bytes contain /StdID: ${hasStdID}`);
  console.log(`Raw bytes contain /U (user key): ${hasU}`);
  console.log(`Raw bytes contain /O (owner key): ${hasO}`);
  console.log();

  // ── STEP 3: Try to load protected PDF WITHOUT password ─────
  console.log("── TEST 2: Load protected PDF WITHOUT password ──");
  try {
    const unprotected = await PDFDocument.load(protectedBytes, { ignoreEncryption: false } as any);
    console.log(`  ⚠️  Loaded WITHOUT password — isEncrypted: ${unprotected.isEncrypted}`);
    console.log(`  Pages: ${unprotected.getPageCount()}`);
    console.log(`  Title: "${unprotected.getTitle() || '(none)'}"`);
    // Check if content is actually readable
    const page = unprotected.getPages()[0];
    const rotation = page.getRotation();
    console.log(`  Page 1 rotation: ${rotation.angle}°`);
    console.log(`  ⚠️  WARNING: pdf-lib can load encrypted PDFs even without correct password`);
    console.log(`     This means pdf-lib does NOT enforce password protection.`);
  } catch (err: any) {
    console.log(`  ✅ Good — could not load without password: ${err.message.substring(0, 80)}`);
  }
  console.log();

  // ── STEP 4: Try to load protected PDF WITH correct password ─
  console.log("── TEST 3: Load protected PDF WITH correct password ──");
  try {
    const withPassword = await PDFDocument.load(protectedBytes, {
      password: "mypassword",
      ignoreEncryption: false
    } as any);
    console.log(`  ✅ Loaded with password — isEncrypted: ${withPassword.isEncrypted}`);
    console.log(`  Pages: ${withPassword.getPageCount()}`);
    const page = withPassword.getPages()[0];
    console.log(`  Page 1 rotation: ${page.getRotation().angle}°`);
  } catch (err: any) {
    console.log(`  ❌ Failed to load with correct password: ${err.message.substring(0, 80)}`);
  }
  console.log();

  // ── STEP 5: Try to load with WRONG password ────────────────
  console.log("── TEST 4: Load protected PDF with WRONG password ──");
  try {
    const wrongPw = await PDFDocument.load(protectedBytes, {
      password: "wrongpassword",
      ignoreEncryption: false
    } as any);
    console.log(`  ⚠️  Loaded with wrong password — isEncrypted: ${wrongPw.isEncrypted}`);
    console.log(`  Pages: ${wrongPw.getPageCount()}`);
    console.log(`  ⚠️  pdf-lib accepted the wrong password!`);
  } catch (err: any) {
    console.log(`  ✅ Good — rejected wrong password: ${err.message.substring(0, 80)}`);
  }
  console.log();

  // ── STEP 6: Test unlockPDF ─────────────────────────────────
  console.log("── TEST 5: unlockPDF() on the protected file ──");
  const protectedFile = new File([new Uint8Array(protectedBytes)], "protected.pdf", { type: "application/pdf" });
  try {
    const unlockedBytes = await unlockPDF(protectedFile, "mypassword");
    const unlockedDoc = await PDFDocument.load(unlockedBytes);
    console.log(`  Unlocked PDF: ${unlockedBytes.length} bytes`);
    console.log(`  Pages: ${unlockedDoc.getPageCount()}`);
    console.log(`  isEncrypted: ${unlockedDoc.isEncrypted}`);
    console.log(`  Page count matches original: ${unlockedDoc.getPageCount() === origDoc.getPageCount()}`);
  } catch (err: any) {
    console.log(`  ❌ Failed to unlock: ${err.message.substring(0, 120)}`);
  }
  console.log();

  // ── STEP 7: Test unlock with wrong password ────────────────
  console.log("── TEST 6: unlockPDF() with WRONG password ──");
  try {
    const wrongUnlocked = await unlockPDF(protectedFile, "wrongpassword");
    console.log(`  ⚠️  Unlocked with wrong password! (${wrongUnlocked.length} bytes)`);
    console.log(`  ⚠️  This means unlock does not actually verify the password.`);
  } catch (err: any) {
    console.log(`  ✅ Good — rejected wrong password: ${err.message.substring(0, 80)}`);
  }
  console.log();

  // ── STEP 8: Also test via processFiles ─────────────────────
  console.log("── TEST 7: processFiles('protect', ...) ──");
  const { processFiles } = await import("@/lib/pdf/pdf-tools");
  try {
    const result = await processFiles("protect", [file], { userPassword: "test123", ownerPassword: "owner456" });
    console.log(`  Output: ${result.filename} (${result.data.length} bytes)`);
    const raw = new TextDecoder("latin1").decode(result.data);
    console.log(`  Contains /Encrypt: ${raw.includes("/Encrypt")}`);
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message.substring(0, 80)}`);
  }
  console.log();

  console.log("── TEST 8: processFiles('unlock', ...) ──");
  try {
    const protResult = await processFiles("protect", [file], { userPassword: "test123", ownerPassword: "owner456" });
    const protFile = new File([protResult.data], "protected.pdf", { type: "application/pdf" });
    const unlockResult = await processFiles("unlock", [protFile], { password: "test123" });
    const unlockedDoc = await PDFDocument.load(unlockResult.data);
    console.log(`  Output: ${unlockResult.filename} (${unlockResult.data.length} bytes)`);
    console.log(`  Pages: ${unlockedDoc.getPageCount()}`);
    console.log(`  isEncrypted: ${unlockedDoc.isEncrypted}`);
    console.log(`  Page count matches original: ${unlockedDoc.getPageCount() === origDoc.getPageCount()}`);
  } catch (err: any) {
    console.log(`  ❌ Error: ${err.message.substring(0, 120)}`);
  }

  // ── SUMMARY ────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("FINDINGS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("See tests above for details.");
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
