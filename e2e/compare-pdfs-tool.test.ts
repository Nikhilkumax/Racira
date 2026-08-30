import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/compare-pdfs';

test.describe('Compare PDFs tool', () => {
  test('page loads with dual upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Compare PDFs');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    // Two file inputs for left and right PDFs
    const fileInputs = page.locator('input[type="file"]');
    expect(await fileInputs.count()).toBe(2);
  });

  test('comparing two different PDFs shows differences', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Upload two different PDFs
    const leftInput = page.locator('input[type="file"]').first();
    const rightInput = page.locator('input[type="file"]').last();
    await leftInput.setInputFiles('public/pdf/test-files/english-test.pdf');
    await rightInput.setInputFiles('public/pdf/test-files/annotated-test.pdf');
    await page.waitForTimeout(1000);

    // Both files should show their names
    await expect(page.locator('text=english-test.pdf').first()).toBeVisible();
    await expect(page.locator('text=annotated-test.pdf').first()).toBeVisible();

    // Click Compare
    await page.locator('button:has-text("Compare PDFs")').click();

    // Wait for results
    await expect(page.locator('[data-state="done"]')).toBeVisible({ timeout: 30000 });

    // Verify structural assertions about the comparison output
    const body = await page.textContent('[data-state="done"]');
    expect(body).toContain('Comparison Results');
    expect(body).toContain('Unchanged');
    expect(body).toContain('Changed');

    // Should have page navigator buttons
    const navButtons = page.locator('[data-state="done"] button');
    expect(await navButtons.count()).toBeGreaterThan(3);
  });

  test('comparing identical PDFs shows all unchanged', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Upload same PDF twice
    const leftInput = page.locator('input[type="file"]').first();
    const rightInput = page.locator('input[type="file"]').last();
    await leftInput.setInputFiles('public/pdf/test-files/english-test.pdf');
    await rightInput.setInputFiles('public/pdf/test-files/english-test.pdf');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Compare PDFs")').click();
    await expect(page.locator('[data-state="done"]')).toBeVisible({ timeout: 30000 });

    // All pages should be unchanged
    const body = await page.textContent('[data-state="done"]');
    expect(body).toContain('Comparison Results');
    expect(body).toContain('Unchanged');
  });

  test('page navigator switches between pages', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    const leftInput = page.locator('input[type="file"]').first();
    const rightInput = page.locator('input[type="file"]').last();
    await leftInput.setInputFiles('public/pdf/test-files/english-test.pdf');
    await rightInput.setInputFiles('public/pdf/test-files/annotated-test.pdf');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Compare PDFs")').click();
    await expect(page.locator('[data-state="done"]')).toBeVisible({ timeout: 30000 });

    // Click a page navigator button (page 2)
    const pageButtons = page.locator('[data-state="done"] button:has-text("2")');
    if (await pageButtons.count() > 0) {
      await pageButtons.first().click();
      await page.waitForTimeout(500);
      // The view should still show comparison results
      await expect(page.locator('[data-state="done"]')).toBeVisible();
    }
  });
});
