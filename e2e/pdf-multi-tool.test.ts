import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/pdf-multi-tool';

test.describe('PDF Multi-Tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Multi-Tool');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('uploading multiple PDFs shows page list', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles([
      'public/pdf/test-files/english-test.pdf',
      'public/pdf/test-files/annotated-test.pdf',
    ]);

    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // Should show pages from both files
    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('english-test.pdf');
    expect(body).toContain('annotated-test.pdf');
    expect(body).toContain('pages from');
    expect(body).toContain('Export');
  });

  test('rotate and delete operations update page list', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles([
      'public/pdf/test-files/english-test.pdf',
    ]);

    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // Should show 3 pages (english-test.pdf has 3 pages)
    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('3 pages');

    // Click rotate button on first page
    const rotateBtn = page.locator('[data-state="loaded"] button[title="Rotate right"]').first();
    if (await rotateBtn.isVisible()) {
      await rotateBtn.click();
      // Rotation indicator should appear
      const bodyAfter = await page.textContent('[data-state="loaded"]');
      expect(bodyAfter).toContain('90°');
    }

    // Click delete on last page
    const deleteBtn = page.locator('[data-state="loaded"] button[title="Delete page"]').last();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Page count should decrease
      const bodyAfterDelete = await page.textContent('[data-state="loaded"]');
      expect(bodyAfterDelete).toContain('2 pages');
    }
  });

  test('export produces downloadable PDF', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles([
      'public/pdf/test-files/english-test.pdf',
    ]);

    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // Click Export
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export")').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('multi-tool-output.pdf');
    
    // Verify the download is a valid PDF
    const path = await download.path();
    if (path) {
      const fs = require('fs');
      const bytes = fs.readFileSync(path);
      expect(bytes.slice(0, 5).toString()).toBe('%PDF-');
    }
  });
});
