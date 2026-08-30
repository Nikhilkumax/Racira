import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/edit-pdf-text';
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

test.describe('Edit PDF Text tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Page should show the tool title
    const heading = page.locator('h1');
    await expect(heading.first()).toContainText('Edit PDF Text');

    // Upload area should be present
    await expect(page.locator('text=drag and drop')).toBeVisible();
    await expect(page.locator('text=Your files never leave your device')).toBeVisible();
  });

  test('uploading a PDF opens the editor iframe', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Set a PDF file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(TEST_PDF);

    // Editor iframe should appear
    const iframe = page.locator('iframe[title="PDF Text Editor"]');
    await expect(iframe).toBeVisible({ timeout: 15000 });

    // Iframe should point to the standalone editor page
    const src = await iframe.getAttribute('src');
    expect(src).toBe('/edit-pdf-viewer/index.html');
  });

  test('editor iframe has COOP/COEP headers', async ({ page }) => {
    const response = await page.goto(TOOL_URL);
    const headers = response?.headers() || {};
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['cross-origin-embedder-policy']).toBe('require-corp');
  });

  test('standalone editor page loads with all DOM elements', async ({ page }) => {
    // Navigate directly to the standalone HTML
    const response = await page.goto('http://localhost:3002/edit-pdf-viewer/index.html');
    
    // Should have COOP/COEP headers
    const headers = response?.headers() || {};
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['cross-origin-embedder-policy']).toBe('require-corp');

    // Key DOM elements should exist
    await expect(page.locator('#text-editor-app')).toBeAttached();
    await expect(page.locator('#toolbar')).toBeAttached();
    await expect(page.locator('#stage')).toBeAttached();
    await expect(page.locator('#inspector')).toBeAttached();
    await expect(page.locator('#viewbar')).toBeAttached();
    await expect(page.locator('#save')).toBeAttached();
    await expect(page.locator('#page')).toBeAttached(); // canvas
  });
});
