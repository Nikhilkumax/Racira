import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/scanner-effect';
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

test.describe('Scanner Effect tool', () => {
  test('page loads, upload shows preview with controls', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Scanner Effect');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();

    // Upload PDF
    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);

    // Loading state appears
    await expect(page.locator('[data-state="loading"]')).toBeVisible({ timeout: 5000 });

    // Preview state appears with controls
    await expect(page.locator('[data-state="preview"]')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Grayscale')).toBeVisible();
    await expect(page.locator('text=Brightness')).toBeVisible();
    await expect(page.locator('text=Save PDF')).toBeVisible();
  });
});
