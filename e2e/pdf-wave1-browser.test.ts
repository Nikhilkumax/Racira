import { test, expect } from "@playwright/test";
import JSZip from "jszip";

const TEST_PDF = "public/pdf/test-files/english-test.pdf";

test.describe("PDF Wave 1: pdf-to-image", () => {
  test.setTimeout(120000);

  test("uploads 3-page PDF, converts to images, verifies output", async ({ page }) => {
    // Navigate to the tool page
    await page.goto("/pdf/pdf-to-image");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(page.getByRole("heading", { name: "PDF to Image", exact: true })).toBeVisible();

    // Upload the test PDF via the hidden file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(TEST_PDF);

    // Wait for the file to appear in the file list
    await expect(page.locator("text=english-test.pdf").first()).toBeVisible({ timeout: 10000 });

    // Set up download interception
    const downloadPromise = page.waitForEvent("download");

    // Click the process/convert button
    const processBtn = page.locator("button").filter({ hasText: /Process|Convert|Download/i }).first();
    await processBtn.click();

    // Wait for processing to complete
    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 90000 });

    // Click download
    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();

    // Wait for download
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();

    // Read and inspect the ZIP
    const fs = require("fs");
    const zipBytes = fs.readFileSync(path!);
    const zip = await JSZip.loadAsync(zipBytes);
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir);

    console.log(`\n=== pdf-to-image OUTPUT ===`);
    console.log(`ZIP contains ${files.length} files: ${files.join(", ")}`);

    // Should have 3 images (one per page)
    expect(files.length).toBe(3);

    // All should be JPG (pdfToJPG is the default)
    for (const f of files) {
      expect(f).toMatch(/\.jpg$/);
    }

    // Verify page ordering
    expect(files[0]).toBe("page-1.jpg");
    expect(files[1]).toBe("page-2.jpg");
    expect(files[2]).toBe("page-3.jpg");

    // Inspect first image — should be non-trivial size (real rendered content)
    const img1Bytes = await zip.files["page-1.jpg"].async("uint8array");
    console.log(`page-1.jpg: ${img1Bytes.length} bytes`);
    expect(img1Bytes.length).toBeGreaterThan(1000); // Real image, not empty

    // Verify it's a valid JPEG by checking magic bytes
    expect(img1Bytes[0]).toBe(0xff);
    expect(img1Bytes[1]).toBe(0xd8);
    expect(img1Bytes[2]).toBe(0xff);

    console.log(`✅ pdf-to-image: 3 pages → 3 valid JPG files, first image ${img1Bytes.length} bytes`);
  });
});

test.describe("PDF Wave 1: pdf-to-text", () => {
  test.setTimeout(120000);

  test("uploads 3-page text PDF, extracts text, verifies content", async ({ page }) => {
    // Navigate to the tool page
    await page.goto("/pdf/pdf-to-text");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    await expect(page.getByRole("heading", { name: "PDF to Text", exact: true })).toBeVisible();

    // Upload the test PDF via the hidden file input
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(TEST_PDF);

    // Wait for the file to appear in the file list
    await expect(page.locator("text=english-test.pdf").first()).toBeVisible({ timeout: 10000 });

    // Set up download interception
    const downloadPromise = page.waitForEvent("download");

    // Click the process/convert button
    const processBtn = page.locator("button").filter({ hasText: /Process|Extract|Download/i }).first();
    await processBtn.click();

    // Wait for processing to complete
    await expect(page.locator("text=Processing complete").first()).toBeVisible({ timeout: 90000 });

    // Click download
    const downloadBtn = page.locator("button").filter({ hasText: /Download/i }).first();
    await downloadBtn.click();

    // Wait for download
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();

    // Read the downloaded file
    const fs = require("fs");
    const textBytes = fs.readFileSync(path!);
    const text = textBytes.toString("utf-8");

    console.log(`\n=== pdf-to-text OUTPUT ===`);
    console.log(`File size: ${textBytes.length} bytes`);
    console.log(`--- EXTRACTED TEXT START ---`);
    console.log(text);
    console.log(`--- EXTRACTED TEXT END ---`);

    // Should contain the key text from all 3 pages
    expect(text).toContain("Chapter 1: The Beginning");
    expect(text).toContain("Chapter 2: The Journey");
    expect(text).toContain("Chapter 3: The Arrival");

    // Should contain the actual content sentences
    expect(text).toContain("dark and stormy night");
    expect(text).toContain("bright and clear");
    expect(text).toContain("grand building");

    // Should contain page markers from extractText()
    expect(text).toContain("--- Page 1 ---");
    expect(text).toContain("--- Page 2 ---");
    expect(text).toContain("--- Page 3 ---");

    // Should be in reading order (Chapter 1 before Chapter 2 before Chapter 3)
    const ch1Pos = text.indexOf("Chapter 1");
    const ch2Pos = text.indexOf("Chapter 2");
    const ch3Pos = text.indexOf("Chapter 3");
    expect(ch1Pos).toBeLessThan(ch2Pos);
    expect(ch2Pos).toBeLessThan(ch3Pos);

    // Not garbled — check it's readable English, not binary
    expect(text.length).toBeGreaterThan(100);
    // Should not contain replacement characters or null bytes
    expect(text).not.toContain("\ufffd");
    expect(text).not.toContain("\0");

    console.log(`✅ pdf-to-text: 3 pages → ${textBytes.length} bytes of text, all chapters found in order`);
  });
});
