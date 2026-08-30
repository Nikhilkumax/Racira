/**
 * Browser verification for 8 pdfjs-dependent tools.
 * Uses Playwright to test in real Chromium with canvas support.
 *
 * Run: npx tsx scratch/browser-test-8-tools.ts
 *
 * Prerequisites: dev server running on http://localhost:3000
 */

import { chromium } from "playwright";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:4567";

async function createTestPDF(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) {
    const p = doc.addPage([612, 792]);
    p.drawText(`Page ${i}: The Quick Brown Fox`, { x: 50, y: 700, size: 16, font, color: rgb(0, 0, 0) });
    p.drawText(`Contact us at info@example.com or call +1-555-123-4567`, { x: 50, y: 670, size: 12, font });
    p.drawText(`Visit https://example.com for more details`, { x: 50, y: 650, size: 12, font });
  }
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function main() {
  console.log("Starting Playwright browser test...\n");

  const pdfBuffer = await createTestPDF();
  const pdfBase64 = pdfBuffer.toString("base64");
  console.log(`Test PDF: ${pdfBuffer.length} bytes\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to a tool page — this loads the Next.js bundle including pdf-tools
  await page.goto(`${BASE_URL}/pdf/pdf-to-text`, { waitUntil: "networkidle" });
  console.log("Page loaded. Waiting for bundle...\n");

  // Wait for the page to fully hydrate
  await page.waitForTimeout(3000);

  // First, check that we can access processFiles via the webpack module system
  const hasProcessFiles = await page.evaluate(() => {
    // Next.js stores modules in __next_f or webpack chunk loading
    // Try to find processFiles through the global scope or module cache
    return typeof (window as any).__NEXT_DATA__ !== "undefined";
  });
  console.log(`Next.js data available: ${hasProcessFiles}`);

  // Inject a script that creates a test endpoint by using the existing page's module system
  // We'll add a hidden form, upload the PDF, and intercept the result
  // Actually, the simplest approach: navigate to each tool page and use the UI

  const tools = [
    { slug: "extract-headings", desc: "Extract headings by font size" },
    { slug: "extract-email-addresses", desc: "Extract email addresses" },
    { slug: "extract-phone-numbers", desc: "Extract phone numbers" },
    { slug: "extract-keywords", desc: "Keyword frequency analysis" },
    { slug: "extract-hyperlinks", desc: "Extract hyperlinks" },
    { slug: "pdf-to-rtf", desc: "Convert to RTF format" },
    { slug: "invert-colors", desc: "Invert page colors" },
    { slug: "grayscale-pdf", desc: "Convert to grayscale" },
  ];

  const results: Array<{ slug: string; status: string; detail: string }> = [];

  for (const tool of tools) {
    console.log(`Testing ${tool.slug}...`);

    try {
      // Navigate to the tool page
      await page.goto(`${BASE_URL}/pdf/${tool.slug}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);

      // Check if the page loaded correctly — look for h1 and file input
      const h1 = await page.$("h1");
      const title = h1 ? await h1.textContent() : null;
      const fileInput = await page.$('input[type="file"]');

      if (!title || !fileInput) {
        console.log(`  ❌ Page not found or no file input`);
        results.push({ slug: tool.slug, status: "404", detail: "Tool page not found" });
        continue;
      }

      console.log(`  Page title: "${title.trim()}"`);

      // Write the test PDF to a temp file
      const tmpPdf = join(process.cwd(), "scratch", `test-${tool.slug}.pdf`);
      writeFileSync(tmpPdf, pdfBuffer);

      // Upload the file
      await fileInput.setInputFiles(tmpPdf);
      console.log(`  File uploaded`);

      // Wait for processing — look for download button or result
      await page.waitForTimeout(5000);

      // Try to find and click the process/action button
      const processBtn = await page.$('button:has-text("Process"), button:has-text("Convert"), button:has-text("Extract"), button:has-text("Analyze"), button:has-text("Detect"), button:has-text("Invert"), button:has-text("Grayscale")');
      if (processBtn) {
        console.log(`  Clicking process button...`);
        await processBtn.click();
        await page.waitForTimeout(5000);
      }

      // Check final state — look for specific UI elements
      const downloadLink = await page.$('a[download]');
      const downloadBtn = await page.$('button:has-text("Download")');
      const errorAlert = await page.$('[role="alert"], .text-destructive, [class*="error"]');
      const comingSoon = await page.$('text=coming soon');

      if (downloadLink || downloadBtn) {
        console.log(`  ✅ PASS — Download available`);
        results.push({ slug: tool.slug, status: "PASS", detail: "Download available" });
      } else if (comingSoon) {
        console.log(`  ⏳ STUB — Coming soon`);
        results.push({ slug: tool.slug, status: "STUB", detail: "Coming soon message" });
      } else if (errorAlert) {
        const errorText = await errorAlert.textContent();
        console.log(`  ❌ ERROR — ${errorText?.substring(0, 80)}`);
        results.push({ slug: tool.slug, status: "ERROR", detail: errorText?.substring(0, 80) || "error" });
      } else {
        // Check console for errors
        const pageErrors = await page.evaluate(() => {
          const errs = (window as any).__errors || [];
          return errs;
        }).catch(() => []);
        console.log(`  ⚠️ UNCLEAR — No download, no error alert, no stub`);
        results.push({ slug: tool.slug, status: "UNCLEAR", detail: "Could not determine status" });
      }

      // Clean up temp file
      try { writeFileSync(tmpPdf, ""); } catch {}

    } catch (e: any) {
      console.log(`  ❌ ERROR — ${e.message?.substring(0, 120)}`);
      results.push({ slug: tool.slug, status: "ERROR", detail: e.message?.substring(0, 120) || "" });
    }
  }

  await browser.close();

  // Summary
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("BROWSER VERIFICATION RESULTS");
  console.log("═══════════════════════════════════════════════════════\n");

  const pass = results.filter(r => r.status === "PASS");
  const stubs = results.filter(r => r.status === "STUB");
  const failed = results.filter(r => r.status !== "PASS" && r.status !== "STUB");

  console.log(`Total: ${results.length} | PASS: ${pass.length} | STUB: ${stubs.length} | FAILED: ${failed.length}\n`);

  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "STUB" ? "⏳" : "❌";
    console.log(`${icon} ${r.slug.padEnd(28)} ${r.status.padEnd(10)} ${r.detail}`);
  }
}

main().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
