/**
 * Structural test for pdf-layers — PDF layer management tool.
 *
 * Tests the upload flow and UI rendering. The full layer load/save
 * requires PyMuPDF WASM from CDN, which is slow in dev environments.
 * This test verifies the structural correctness of the component.
 *
 * Requires dev server on port 3002.
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const BASE = 'http://localhost:3002';
const TEST_PDF = path.resolve(__dirname, '../public/pdf/test-files/english-test.pdf');

test.describe('pdf-layers tool', () => {
  test('page loads with upload zone', async ({ page }) => {
    await page.goto(`${BASE}/pdf/pdf-layers`, { waitUntil: 'networkidle' });

    const heading = page.locator('h1');
    await expect(heading).toContainText('PDF Layers');

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('uploading PDF shows file info and Load Layers button', async ({ page }) => {
    await page.goto(`${BASE}/pdf/pdf-layers`, { waitUntil: 'networkidle' });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_PDF);

    // File info displayed
    await expect(page.locator('text=english-test.pdf')).toBeVisible();
    await expect(page.locator('text=3 pages')).toBeVisible();

    // Load Layers button present
    const loadBtn = page.getByText('Load Layers');
    await expect(loadBtn).toBeVisible();
  });

  test('Load Layers button triggers loading state', async ({ page }) => {
    await page.goto(`${BASE}/pdf/pdf-layers`, { waitUntil: 'networkidle' });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_PDF);

    const loadBtn = page.getByText('Load Layers');
    await loadBtn.click();

    // Should show loading indicator
    await expect(page.getByText('Loading layers')).toBeVisible({ timeout: 5000 });
  });

  test('reset returns to upload state', async ({ page }) => {
    await page.goto(`${BASE}/pdf/pdf-layers`, { waitUntil: 'networkidle' });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_PDF);

    await expect(page.locator('text=english-test.pdf')).toBeVisible();

    const removeBtn = page.locator('button[aria-label="Remove file"]');
    await removeBtn.click();

    // Should return to upload state
    await expect(page.locator('input[type="file"]')).toBeAttached();
    await expect(page.locator('text=Load Layers')).not.toBeVisible();
  });
});
