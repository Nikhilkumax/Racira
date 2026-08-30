/**
 * Step 3 — Quick page-load verification for all 37 newly-registered tools.
 * Tests: page loads, heading visible, file upload zone rendered.
 * This is the minimum structural test — NOT a processing test.
 * Requires dev server on port 3002.
 */
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3002';

// All tools that were newly registered or promoted from "soon"
const NEW_TOOLS = [
  // Wired-not-registered (fixed in Step 2)
  'linearize-pdf', 'remove-restrictions', 'validate-signature', 'certificate-inspector',
  // Phase 3: PyMuPDF CDN
  'cbz-to-pdf', 'pdf-to-cbz', 'compress-pdf', 'deskew-pdf',
  'email-to-pdf', 'fb2-to-pdf', 'mobi-to-pdf', 'psd-to-pdf',
  'pdf-to-docx', 'pdf-to-excel', 'pdf-to-pdfa', 'pdf-to-svg',
  'prepare-pdf-for-ai', 'rasterize-pdf', 'tiff-to-pdf', 'xps-to-pdf',
  // Phase 3: Ghostscript
  'font-to-outline',
  // Phase 3: Tesseract
  'ocr-pdf',
  // Phase 3: qpdf
  // (linearize-pdf and remove-restrictions already above)
  // Phase 4: LibreOffice
  'excel-to-pdf', 'powerpoint-to-pdf', 'word-to-pdf',
  'odg-to-pdf', 'odp-to-pdf', 'ods-to-pdf', 'odt-to-pdf',
  'pages-to-pdf', 'pub-to-pdf', 'vsd-to-pdf',
  'wpd-to-pdf', 'wps-to-pdf',
  // Phase 3: PyMuPDF extra
  'timestamp-pdf',
];

test.describe('Newly-registered tool pages', () => {
  test.setTimeout(30_000);

  for (const slug of NEW_TOOLS) {
    test(`page loads: /pdf/${slug}`, async ({ page }) => {
      const response = await page.goto(`${BASE}/pdf/${slug}`, {
        waitUntil: 'networkidle',
        timeout: 15_000,
      });

      // 1. Page returns HTTP 200 (not 404/500)
      expect(response?.status()).toBe(200);

      // 2. Page renders without error overlay
      const errorOverlay = page.locator('[data-nextjs-dialog-left-right]');
      await expect(errorOverlay).toHaveCount(0, { timeout: 3000 });

      // 3. Tool heading is visible (the h1 with tool name)
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 5000 });

      // 4. File upload input exists (this is the core UI element)
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeAttached({ timeout: 5000 });
    });
  }
});
