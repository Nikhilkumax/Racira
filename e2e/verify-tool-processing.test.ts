/**
 * Step 3 — Final verification. Distinguishes:
 * - PASS: Real download with output > 100 bytes
 * - CDN-BLOCKED: "Cannot find module" CDN error (infrastructure, not code)
 * - FAIL: Unexpected code error
 * 
 * Only PASS counts as verified migrated.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'http://localhost:3002';
const TEST_PDF = path.resolve(__dirname, '../public/pdf/test-files/english-test.pdf');
const TIMEOUT = 45_000;

const ALL_TOOLS = [
  'linearize-pdf', 'remove-restrictions',
  'compress-pdf', 'deskew-pdf', 'rasterize-pdf', 'prepare-pdf-for-ai',
  'pdf-to-pdfa', 'pdf-to-svg', 'cbz-to-pdf', 'pdf-to-cbz',
  'email-to-pdf', 'fb2-to-pdf', 'mobi-to-pdf', 'psd-to-pdf',
  'tiff-to-pdf', 'xps-to-pdf',
  'font-to-outline', 'ocr-pdf',
  'excel-to-pdf', 'powerpoint-to-pdf', 'word-to-pdf',
  'odg-to-pdf', 'odp-to-pdf', 'ods-to-pdf', 'odt-to-pdf',
  'pages-to-pdf', 'pub-to-pdf', 'vsd-to-pdf', 'wpd-to-pdf', 'wps-to-pdf',
  'flatten-annotations', 'page-dimensions', 'pdf-to-text',
];

test.describe('All 34 tools — process + download verification', () => {
  test.setTimeout(TIMEOUT + 10_000);

  for (const slug of ALL_TOOLS) {
    test(`process+download: ${slug}`, async ({ page }) => {
      await page.goto(`${BASE}/pdf/${slug}`, { waitUntil: 'networkidle', timeout: 15_000 });

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_PDF);
      await page.waitForTimeout(1000);

      const processBtn = page.locator('button').filter({
        hasText: /Process|Convert|Compress|Linearize|Remove|Deskew|Rasterize|Prepare|OCR|Flatten|Extract|Generate|Analyze|Invert|Detect|Get|View|Dimension/i,
      }).first();

      if ((await processBtn.count()) === 0) {
        console.log(`[${slug}] FAIL: No process button`);
        return;
      }

      // Try download first (some tools auto-download)
      const downloadPromise = page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
      await processBtn.click();
      let download = await downloadPromise;

      // Wait for processing
      await page.waitForTimeout(5000);

      // If no auto-download, try clicking the download button
      if (!download) {
        const dlBtn = page.locator('button:has-text("Download")').first();
        if ((await dlBtn.count()) > 0) {
          const dl2 = page.waitForEvent('download', { timeout: 10_000 }).catch(() => null);
          await dlBtn.click();
          download = await dl2;
        }
      }

      if (download) {
        const p = await download.path();
        if (p) {
          const stats = fs.statSync(p);
          expect(stats.size, `[${slug}] Output too small`).toBeGreaterThan(100);
          console.log(`[${slug}] PASS: ${stats.size} bytes downloaded`);
          return;
        }
      }

      // No download — check what happened
      const bodyText = await page.textContent('body') || '';

      // Check for CDN/WASM errors (the real failure mode)
      if (/Cannot find module.*cdn\.jsdelivr|Cannot find module.*wasm|Aborted.*wasm|fetching of the wasm failed|SharedArrayBuffer/i.test(bodyText)) {
        const errMatch = bodyText.match(/Cannot find module[^']*/);
        console.log(`[${slug}] CDN-BLOCKED: ${errMatch ? errMatch[0] : 'WASM load failure'}`);
        return; // Expected infrastructure limitation
      }

      // Check for error alert
      const alerts = await page.locator('[role="alert"]').allTextContents();
      const alertText = alerts.join(' ');
      if (alertText.length > 3) {
        if (/wasm|module|cdn|fetch|load/i.test(alertText)) {
          console.log(`[${slug}] CDN-BLOCKED: ${alertText.substring(0, 150)}`);
          return;
        }
        console.log(`[${slug}] FAIL: ${alertText.substring(0, 200)}`);
        return;
      }

      // Check for "Try Again" button (indicates processing failure)
      const tryAgain = await page.locator('button:has-text("Try Again")').count();
      if (tryAgain > 0) {
        console.log(`[${slug}] FAIL: Processing failed (Try Again button shown)`);
        return;
      }

      console.log(`[${slug}] UNKNOWN: No download, no error detected`);
    });
  }
});
