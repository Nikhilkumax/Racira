import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const TOOL_URL = '/pdf/webp-to-pdf';

test.describe('WebP to PDF tool', () => {
  test('page loads with correct title and upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    const heading = page.locator('h1');
    await expect(heading.first()).toContainText('WebP to PDF');
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('upload → process → download produces a valid PDF', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Create a real WebP file in the browser
    const webpBase64 = await page.evaluate(() => {
      return new Promise<string>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const reader = new FileReader();
          reader.onload = () => {
            const arr = new Uint8Array(reader.result as ArrayBuffer);
            let binary = '';
            for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
            resolve(btoa(binary));
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/webp');
      });
    });

    const tmpWebp = path.join('/tmp', `test-${Date.now()}.webp`);
    fs.writeFileSync(tmpWebp, Buffer.from(webpBase64, 'base64'));

    // Upload the file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(tmpWebp);
    await page.waitForTimeout(1000);

    // Click Process button
    const processBtn = page.locator('button:has-text("Process")');
    await expect(processBtn).toBeVisible({ timeout: 5000 });
    await processBtn.click();

    // Wait for processing to complete and download button to appear
    const downloadBtn = page.locator('button:has-text("Download")');
    await expect(downloadBtn).toBeVisible({ timeout: 30000 });

    // Set up download handler, then click download
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await downloadBtn.click();

    const download = await downloadPromise;
    const tmpPdf = path.join('/tmp', `webp-test-${Date.now()}.pdf`);
    await download.saveAs(tmpPdf);

    // Verify it's a valid PDF with non-trivial content
    const pdfBytes = fs.readFileSync(tmpPdf);
    expect(pdfBytes.slice(0, 5).toString('ascii')).toBe('%PDF-');
    // PDF should be at least 1KB (a 100x100 image embedded)
    expect(pdfBytes.length).toBeGreaterThan(1000);

    fs.unlinkSync(tmpWebp);
    fs.unlinkSync(tmpPdf);
  });
});
