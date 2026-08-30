import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/bookmark-pdf';
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

test.describe('Edit Bookmarks tool', () => {
  test('page loads, upload PDF shows editor, add bookmark works', async ({ page }) => {
    // 1. Page loads with idle state
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Edit Bookmarks');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();

    // 2. Upload a PDF — watch for loading → loaded state transition
    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);

    // Signal: component enters loading state immediately on file selection
    await expect(page.locator('[data-state="loading"]')).toBeVisible({ timeout: 5000 });

    // Signal: component transitions to loaded state after pdfjs finishes
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // 3. Editor is now interactive — add a bookmark
    await page.click('button:has-text("Add Bookmark")');
    await page.waitForTimeout(500);
    const textInputs = await page.locator('input[type="text"]').count();
    expect(textInputs).toBeGreaterThanOrEqual(1);
  });
});
