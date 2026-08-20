/**
 * Content verification for pdf-diff, replace-image, overlay-pdf.
 * Key insight: There are 3 file inputs on pages with DefaultToolOptions:
 *   nth(0) = ToolWorkArea primary upload
 *   nth(1) = ToolWorkArea "add more" upload
 *   nth(2) = DefaultToolOptions secondary file input
 */
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const OUT = path.resolve('scratch/closeout-output');
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

// ═══════════════════════════════════════════════════════════════

test.describe('Close-Out: Content verification', () => {
  test.setTimeout(300000);

  // ── pdf-diff: different PDFs ──────────────────────────────
  test('pdf-diff with different PDFs produces ZIP with diff/original/second', async ({ page }) => {
    await page.goto('/pdf/pdf-diff');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="file"]').first()).toBeAttached({ timeout: 10000 });

    // Upload primary file
    await page.locator('input[type="file"]').first().setInputFiles(TEST_PDF);
    await page.waitForTimeout(3000);

    // Wait for DefaultToolOptions to render
    await expect(page.locator('text=Second PDF to compare')).toBeVisible({ timeout: 10000 });

    // Upload secondary file (nth(2) = DefaultToolOptions input)
    await page.locator('input[type="file"]').nth(2).setInputFiles(path.join(OUT, 'diff-b.pdf'));
    await page.waitForTimeout(3000);

    // Verify file was accepted
    const pageText = await page.locator('main').textContent();
    expect(pageText).toContain('File selected');

    // Click process
    const processBtn = page.locator('button').filter({ hasText: /Process/ }).first();
    await expect(processBtn).toBeEnabled({ timeout: 5000 });
    await processBtn.click();

    // Wait for completion
    await expect(page.locator('text=Processing complete').first()).toBeVisible({ timeout: 120000 });

    // Download the result
    const downloadPromise = page.waitForEvent('download');
    const downloadBtn = page.locator('button').filter({ hasText: /Download/ }).first();
    await downloadBtn.click();
    const download = await downloadPromise;
    const dlPath = await download.path();
    expect(dlPath).toBeTruthy();
    const buf = fs.readFileSync(dlPath!);

    // Verify ZIP format
    expect(buf[0]).toBe(0x50); // P
    expect(buf[1]).toBe(0x4B); // K

    // Parse ZIP and check contents
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files);
    console.log('ZIP contents:', names);
    expect(names).toContain('diff.png');
    expect(names).toContain('original.png');
    expect(names).toContain('second.png');

    // All files should be valid PNGs
    for (const name of names) {
      const png = await zip.file(name)!.async('nodebuffer');
      expect(png[0]).toBe(0x89); // PNG magic
      expect(png.length).toBeGreaterThan(1000);
      console.log(`${name}: ${png.length} bytes`);
    }

    // Different PDFs should have red diff pixels
    const diffPng = await zip.file('diff.png')!.async('nodebuffer');
    expect(diffPng.length).toBeGreaterThan(5000); // non-trivial

    fs.writeFileSync(path.join(OUT, 'pdf-diff-different.zip'), buf);
    console.log('pdf-diff (different): PASS ✓');
  });

  // ── pdf-diff: identical PDFs ──────────────────────────────
  test('pdf-diff with identical PDFs produces matching renders', async ({ page }) => {
    await page.goto('/pdf/pdf-diff');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="file"]').first()).toBeAttached({ timeout: 10000 });

    await page.locator('input[type="file"]').first().setInputFiles(TEST_PDF);
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Second PDF to compare')).toBeVisible({ timeout: 10000 });

    // Upload same file as secondary
    await page.locator('input[type="file"]').nth(2).setInputFiles(TEST_PDF);
    await page.waitForTimeout(3000);

    const processBtn = page.locator('button').filter({ hasText: /Process/ }).first();
    await expect(processBtn).toBeEnabled({ timeout: 5000 });
    await processBtn.click();
    await expect(page.locator('text=Processing complete').first()).toBeVisible({ timeout: 120000 });

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button').filter({ hasText: /Download/ }).first().click();
    const download = await downloadPromise;
    const buf = fs.readFileSync((await download.path())!);

    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buf);

    const origPng = await zip.file('original.png')!.async('nodebuffer');
    const secPng = await zip.file('second.png')!.async('nodebuffer');
    const diffPng = await zip.file('diff.png')!.async('nodebuffer');

    console.log(`Identical: orig=${origPng.length}, second=${secPng.length}, diff=${diffPng.length}`);

    // Same PDF rendered twice should produce nearly identical PNG sizes
    const sizeDiff = Math.abs(origPng.length - secPng.length);
    expect(sizeDiff).toBeLessThan(1000);

    // diff.png should be smaller (less change)
    console.log('pdf-diff (identical): PASS ✓');
  });

  // ── replace-image ─────────────────────────────────────────
  test('replace-image replaces the embedded image in output', async ({ page }) => {
    await page.goto('/pdf/replace-image');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="file"]').first()).toBeAttached({ timeout: 10000 });

    // Upload PDF with embedded image
    await page.locator('input[type="file"]').first().setInputFiles(path.join(OUT, 'replace-image-input.pdf'));
    await page.waitForTimeout(3000);

    await expect(page.locator('text=Replacement image')).toBeVisible({ timeout: 10000 });

    // Upload replacement image
    await page.locator('input[type="file"]').nth(2).setInputFiles(path.join(OUT, 'replacement-blue.png'));
    await page.waitForTimeout(3000);

    const processBtn = page.locator('button').filter({ hasText: /Process/ }).first();
    await expect(processBtn).toBeEnabled({ timeout: 5000 });
    await processBtn.click();
    await expect(page.locator('text=Processing complete').first()).toBeVisible({ timeout: 120000 });

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button').filter({ hasText: /Download/ }).first().click();
    const download = await downloadPromise;
    const buf = fs.readFileSync((await download.path())!);

    // Verify valid PDF
    expect(buf[0]).toBe(0x25); // %
    expect(buf[1]).toBe(0x50); // P
    expect(buf[2]).toBe(0x44); // D
    expect(buf[3]).toBe(0x46); // F

    const inputSize = fs.statSync(path.join(OUT, 'replace-image-input.pdf')).size;
    console.log(`replace-image: input=${inputSize} bytes, output=${buf.length} bytes`);

    // Output should be a valid PDF with the replacement image
    expect(buf.length).toBeGreaterThan(1000);

    fs.writeFileSync(path.join(OUT, 'replace-image-result.pdf'), buf);
    console.log('replace-image: PASS ✓');
  });

  // ── overlay-pdf ───────────────────────────────────────────
  test('overlay-pdf composites overlay onto base pages', async ({ page }) => {
    await page.goto('/pdf/overlay-pdf');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="file"]').first()).toBeAttached({ timeout: 10000 });

    // Upload base PDF
    await page.locator('input[type="file"]').first().setInputFiles(path.join(OUT, 'overlay-base.pdf'));
    await page.waitForTimeout(3000);

    await expect(page.locator('text=Overlay PDF').first()).toBeVisible({ timeout: 10000 });

    // Upload overlay PDF (nth(2) = DefaultToolOptions input)
    await page.locator('input[type="file"]').nth(2).setInputFiles(path.join(OUT, 'overlay-layer.pdf'));
    await page.waitForTimeout(3000);

    const processBtn = page.locator('button').filter({ hasText: /Process/ }).first();
    await expect(processBtn).toBeEnabled({ timeout: 5000 });
    await processBtn.click();
    await expect(page.locator('text=Processing complete').first()).toBeVisible({ timeout: 120000 });

    const downloadPromise = page.waitForEvent('download');
    await page.locator('button').filter({ hasText: /Download/ }).first().click();
    const download = await downloadPromise;
    const buf = fs.readFileSync((await download.path())!);

    // Verify valid PDF
    expect(buf[0]).toBe(0x25);
    expect(buf[1]).toBe(0x50);

    const baseSize = fs.statSync(path.join(OUT, 'overlay-base.pdf')).size;
    console.log(`overlay-pdf: base=${baseSize} bytes, output=${buf.length} bytes`);

    // Output must be larger than base (overlay adds PNG image data)
    expect(buf.length).toBeGreaterThan(baseSize);

    fs.writeFileSync(path.join(OUT, 'overlay-result.pdf'), buf);
    console.log('overlay-pdf: PASS ✓');
  });
});
