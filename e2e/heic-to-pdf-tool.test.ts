import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/heic-to-pdf';

test.describe('HEIC to PDF tool', () => {
  test('page loads with correct title and upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    const heading = page.locator('h1');
    await expect(heading.first()).toContainText('HEIC to PDF');

    // Should have a file upload area
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();

    // File input should accept HEIC files
    const accept = await fileInput.getAttribute('accept');
    expect(accept).toContain('.heic');
  });

  test('page shows expected description and privacy notice', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Should mention privacy/security
    await expect(page.locator('text=never uploaded to any server')).toBeVisible();
  });
});
