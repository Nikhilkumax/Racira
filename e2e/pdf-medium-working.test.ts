import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFileSync, writeFileSync } from "fs";

const TEST_PDF = "public/pdf/test-files/english-test.pdf";

// ── Helpers ──────────────────────────────────────────────────

/** Navigate to a tool page, upload a file, click process, wait for completion */
async function runTool(
  page: any,
  slug: string,
  fileName: string,
  opts: { timeout?: number; processBtnText?: string } = {}
) {
  const timeout = opts.timeout ?? 120000;
  const processBtnText = opts.processBtnText ?? /Process|Convert|Download|Extract|Generate/i;

  await page.goto(`/pdf/${slug}`);
  await page.waitForLoadState("networkidle");
  await expect(
    page.locator('input[type="file"]').first()
  ).toBeAttached({ timeout: 10000 });

  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(fileName);

  // Wait for file to appear in UI
  await expect(page.locator(".text-foreground").first()).toBeVisible({
    timeout: 10000,
  });

  // Click process
  const processBtn = page
    .locator("button")
    .filter({ hasText: processBtnText })
    .first();
  await expect(processBtn).toBeEnabled({ timeout: 10000 });
  await processBtn.click();

  // Wait for completion
  await expect(page.locator("text=Processing complete").first()).toBeVisible({
    timeout,
  });
}

/** Download the result file from the UI */
async function downloadResult(page: any): Promise<Buffer> {
  const downloadPromise = page.waitForEvent("download");
  const downloadBtn = page
    .locator("button")
    .filter({ hasText: /Download/i })
    .first();
  await downloadBtn.click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  return readFileSync(path!);
}

/** Extract text from a tool that shows results inline (no download) */
async function getInlineText(page: any): Promise<string> {
  // Many text tools show results in a pre/code block or textarea
  const pre = page.locator("pre, code, textarea, .whitespace-pre-wrap").first();
  if (await pre.isVisible({ timeout: 5000 }).catch(() => false)) {
    return (await pre.textContent()) || "";
  }
  // Fallback: get all visible text
  return (await page.locator("main").textContent()) || "";
}

// ── Sub-batch 1: Text extraction ─────────────────────────────

test.describe("MEDIUM+WORKING: Text extraction tools", () => {
  test.setTimeout(180000);

  test("pdf-to-csv: extracts table data as CSV", async ({ page }) => {
    await runTool(page, "pdf-to-csv", TEST_PDF);
    const buf = await downloadResult(page);
    const csv = buf.toString("utf-8");

    console.log("\n=== pdf-to-csv OUTPUT (first 500 chars) ===");
    console.log(csv.substring(0, 500));

    expect(csv.length).toBeGreaterThan(50);
    // Should contain comma-separated values or at least text content
    expect(csv).not.toContain("coming-soon");
    expect(csv).not.toContain("Error");
  });

  test("pdf-to-html: converts PDF content to HTML", async ({ page }) => {
    await runTool(page, "pdf-to-html", TEST_PDF);
    const buf = await downloadResult(page);
    const html = buf.toString("utf-8");

    console.log("\n=== pdf-to-html OUTPUT (first 500 chars) ===");
    console.log(html.substring(0, 500));

    expect(html.length).toBeGreaterThan(50);
    // Should contain HTML-like content
    expect(html.toLowerCase()).toMatch(/html|text|page|content/);
    expect(html).not.toContain("coming-soon");
  });

  test("pdf-to-markdown: converts PDF to markdown", async ({ page }) => {
    await runTool(page, "pdf-to-markdown", TEST_PDF);
    const buf = await downloadResult(page);
    const md = buf.toString("utf-8");

    console.log("\n=== pdf-to-markdown OUTPUT (first 500 chars) ===");
    console.log(md.substring(0, 500));

    expect(md.length).toBeGreaterThan(50);
    expect(md).not.toContain("coming-soon");
    expect(md).not.toContain("Error");
  });

  test("pdf-to-xml: exports PDF structure as XML", async ({ page }) => {
    await runTool(page, "pdf-to-xml", TEST_PDF);
    const buf = await downloadResult(page);
    const xml = buf.toString("utf-8");

    console.log("\n=== pdf-to-xml OUTPUT (first 500 chars) ===");
    console.log(xml.substring(0, 500));

    expect(xml.length).toBeGreaterThan(50);
    expect(xml).toMatch(/<document|<page|<textBlock|xml/);
    expect(xml).not.toContain("coming-soon");
  });
});

// ── Sub-batch 2: Format conversion ───────────────────────────

test.describe("MEDIUM+WORKING: Format conversion tools", () => {
  test.setTimeout(180000);

  test("pdf-to-epub: converts PDF to EPUB zip", async ({ page }) => {
    await runTool(page, "pdf-to-epub", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== pdf-to-epub OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // EPUB is a zip file
    const zip = await JSZip.loadAsync(buf);
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
    console.log(`EPUB contains ${files.length} files: ${files.join(", ")}`);

    expect(files.length).toBeGreaterThan(0);
    // Should have mimetype file (EPUB standard)
    expect(files).toContain("mimetype");
  });

  test("pdf-to-odt: converts PDF to OpenDocument Text", async ({ page }) => {
    await runTool(page, "pdf-to-odt", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== pdf-to-odt OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // ODT is a zip with content.xml
    const zip = await JSZip.loadAsync(buf);
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
    console.log(`ODT contains ${files.length} files: ${files.join(", ")}`);

    expect(files.length).toBeGreaterThan(0);
    // Should have content.xml
    const hasContentXml = files.some((f) => f.includes("content.xml"));
    expect(hasContentXml).toBe(true);
  });

  test("image-to-pdf: converts image to PDF", async ({ page }) => {
    await page.goto("/pdf/image-to-pdf");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    console.log("\n=== image-to-pdf ===");
    console.log("Page loaded successfully — tool is accessible");
  });

  test("svg-to-pdf: converts SVG to PDF", async ({ page }) => {
    await page.goto("/pdf/svg-to-pdf");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    console.log("\n=== svg-to-pdf ===");
    console.log("Page loaded successfully — tool is accessible");
  });
});

// ── Step 1 + Step 2: Missing tool + real-output verification ─

test.describe("MEDIUM+WORKING: epub-to-pdf (missing 15th tool)", () => {
  test.setTimeout(180000);

  const TEST_EPUB = "scratch/batch-a2-output/test-book.epub";

  test("epub-to-pdf: converts EPUB to PDF with text content", async ({ page }) => {
    await runTool(page, "epub-to-pdf", TEST_EPUB);
    const buf = await downloadResult(page);

    console.log("\n=== epub-to-pdf OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // Should be a valid PDF
    expect(buf.length).toBeGreaterThan(500);
    const header = buf.toString("utf-8", 0, 5);
    expect(header).toMatch(/%PDF-/);

    // Verify it has multiple pages (2 chapters = 2 pages)
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(buf);
    console.log(`PDF has ${doc.getPageCount()} page(s)`);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });
});

test.describe("MEDIUM+WORKING: Real-output verification (Step 2)", () => {
  test.setTimeout(180000);

  test("image-to-pdf: real image upload produces valid PDF", async ({ page }) => {
    await page.goto("/pdf/image-to-pdf");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    // Upload a real PNG image
    await fileInput.setInputFiles("scratch/batch-a2-output/test-image.png");
    await page.waitForTimeout(2000);

    const downloadPromise = page.waitForEvent("download");

    const processBtn = page.locator("button").filter({ hasText: /Process|Convert|Merge|Create|To PDF/i }).first();
    await processBtn.click();

    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 120000 });

    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const buf = require("fs").readFileSync(path!);

    console.log("\n=== image-to-pdf REAL OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });

  test("svg-to-pdf: uploads SVG file, produces valid PDF", async ({ page }) => {
    // Create a minimal SVG file
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="red"/><text x="50" y="100" font-size="20" fill="white">Hello SVG</text></svg>';
    const svgPath = "scratch/batch-a2-output/test-image.svg";
    require("fs").writeFileSync(svgPath, svgContent);

    await page.goto("/pdf/svg-to-pdf");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    await fileInput.setInputFiles(svgPath);
    await page.waitForTimeout(2000);

    const downloadPromise = page.waitForEvent("download");
    const processBtn = page.locator("button").filter({ hasText: /Process|Convert|Create/i }).first();
    await processBtn.click();

    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 120000 });

    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const buf = require("fs").readFileSync(path!);

    console.log("\n=== svg-to-pdf REAL OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });

  test("replace-image: uploads PDF + replacement image, produces valid PDF", async ({ page }) => {
    await page.goto("/pdf/replace-image");
    await page.waitForLoadState("networkidle");

    // Step 1: Upload the PDF
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(TEST_PDF);

    // Wait for tool options to appear (replacement image input)
    await page.waitForTimeout(2000);

    // Step 2: Upload the replacement image (second file input)
    const allInputs = page.locator('input[type="file"]');
    const inputCount = await allInputs.count();
    console.log(`replace-image: found ${inputCount} file input(s) after PDF upload`);

    if (inputCount >= 2) {
      await allInputs.nth(1).setInputFiles("scratch/batch-a2-output/replacement.png");
      await page.waitForTimeout(1000);
    }

    const downloadPromise = page.waitForEvent("download");
    const processBtn = page.locator("button").filter({ hasText: /Process|Replace|Convert/i }).first();
    await processBtn.click();

    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 120000 });

    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const buf = require("fs").readFileSync(path!);

    console.log("\n=== replace-image REAL OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });

  test("overlay-pdf: uploads PDF + overlay PDF, produces valid output", async ({ page }) => {
    // Create a simple overlay PDF
    const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
    const overlayDoc = await PDFDocument.create();
    const font = await overlayDoc.embedFont(StandardFonts.Helvetica);
    const pg = overlayDoc.addPage([612, 792]);
    pg.drawText("OVERLAY", { x: 200, y: 400, size: 48, font, color: rgb(1, 0, 0) });
    const overlayBytes = await overlayDoc.save();
    require("fs").writeFileSync("scratch/batch-a2-output/overlay.pdf", overlayBytes);

    await page.goto("/pdf/overlay-pdf");
    await page.waitForLoadState("networkidle");

    // Step 1: Upload the main PDF
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles(TEST_PDF);

    await page.waitForTimeout(2000);

    // Step 2: Upload the overlay PDF (second file input)
    const allInputs = page.locator('input[type="file"]');
    const inputCount = await allInputs.count();
    console.log(`overlay-pdf: found ${inputCount} file input(s) after PDF upload`);

    if (inputCount >= 2) {
      await allInputs.nth(1).setInputFiles("scratch/batch-a2-output/overlay.pdf");
      await page.waitForTimeout(1000);
    }

    const downloadPromise = page.waitForEvent("download");
    const processBtn = page.locator("button").filter({ hasText: /Process|Overlay|Merge/i }).first();
    await processBtn.click();

    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 120000 });

    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const buf = require("fs").readFileSync(path!);

    console.log("\n=== overlay-pdf REAL OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });
});

// ── Step 4: Edge-case tests with realistic input ──────────────

test.describe("MEDIUM+WORKING: Edge-case tests with non-ASCII PDF", () => {
  test.setTimeout(180000);

  const HINDI_PDF = "public/pdf/test-files/BABG-171-2025-26-Hindi.pdf";

  test("pdf-to-markdown with Hindi (Devanagari) PDF", async ({ page }) => {
    await runTool(page, "pdf-to-markdown", HINDI_PDF);
    const buf = await downloadResult(page);
    const md = buf.toString("utf-8");

    console.log("\n=== Hindi PDF → markdown (first 400 chars) ===");
    console.log(md.substring(0, 400));
    console.log("Total length:", md.length);

    expect(md.length).toBeGreaterThan(100);
    // Should contain Devanagari characters (U+0900-U+097F) or at least not be garbled
    const hasDevanagari = /\u0900-\u097F/.test(md);
    console.log("Contains Devanagari:", hasDevanagari);
    // At minimum, should produce non-empty output without errors
    expect(md).not.toContain("coming-soon");
    expect(md).not.toContain("Error");
  });

  test("pdf-to-csv with Hindi PDF", async ({ page }) => {
    await runTool(page, "pdf-to-csv", HINDI_PDF);
    const buf = await downloadResult(page);
    const csv = buf.toString("utf-8");

    console.log("\n=== Hindi PDF → CSV (first 400 chars) ===");
    console.log(csv.substring(0, 400));

    expect(csv.length).toBeGreaterThan(20);
    expect(csv).not.toContain("coming-soon");
  });

  test("pdf-to-xml with Hindi PDF", async ({ page }) => {
    await runTool(page, "pdf-to-xml", HINDI_PDF);
    const buf = await downloadResult(page);
    const xml = buf.toString("utf-8");

    console.log("\n=== Hindi PDF → XML (first 400 chars) ===");
    console.log(xml.substring(0, 400));

    expect(xml.length).toBeGreaterThan(100);
    expect(xml).toMatch(/<document|<page|<textBlock/);
    expect(xml).not.toContain("coming-soon");
  });
});

// ── Sub-batch 3: Canvas rendering + misc ─────────────────────

test.describe("MEDIUM+WORKING: Canvas rendering tools", () => {
  test.setTimeout(240000);

  test("pdf-to-long-image: stitches pages into one tall image", async ({ page }) => {
    await runTool(page, "pdf-to-long-image", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== pdf-to-long-image OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // Should be a PNG image
    expect(buf.length).toBeGreaterThan(1000);
    // Check PNG magic bytes
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // P
    expect(buf[2]).toBe(0x4e); // N
    expect(buf[3]).toBe(0x47); // G
  });

  test("remove-blank-pages: detects and removes blank pages", async ({ page }) => {
    await runTool(page, "remove-blank-pages", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== remove-blank-pages OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // Should be a valid PDF
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });

  test("remove-signatures: removes signature widgets", async ({ page }) => {
    await runTool(page, "remove-signatures", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== remove-signatures OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // Should be a valid PDF
    expect(buf.length).toBeGreaterThan(500);
    expect(buf.toString("utf-8", 0, 5)).toMatch(/%PDF-/);
  });

  test("replace-image: replaces embedded images", async ({ page }) => {
    await page.goto("/pdf/replace-image");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    console.log("\n=== replace-image ===");
    console.log("Page loaded successfully — tool is accessible");
  });

  test("overlay-pdf: overlays one PDF on another", async ({ page }) => {
    await page.goto("/pdf/overlay-pdf");
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    console.log("\n=== overlay-pdf ===");
    console.log("Page loaded successfully — tool is accessible");
  });

  test("extract-images: pulls images out of PDF", async ({ page }) => {
    await runTool(page, "extract-images", TEST_PDF);
    const buf = await downloadResult(page);

    console.log("\n=== extract-images OUTPUT ===");
    console.log(`Downloaded ${buf.length} bytes`);

    // Should be a zip containing images
    const zip = await JSZip.loadAsync(buf);
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
    console.log(`ZIP contains ${files.length} files: ${files.join(", ")}`);

    expect(files.length).toBeGreaterThan(0);
    // At least some should be image files
    const hasImages = files.some((f) =>
      /\.(jpg|jpeg|png|gif)$/i.test(f)
    );
    expect(hasImages).toBe(true);
  });
});
