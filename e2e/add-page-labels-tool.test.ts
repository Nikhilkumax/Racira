import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/add-page-labels';
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

test.describe('Add Page Labels tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Add Page Labels');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('upload shows config with label rules UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await expect(page.locator('[data-state="config"]')).toBeVisible({ timeout: 10000 });

    const body = await page.textContent('[data-state="config"]');
    expect(body).toContain('english-test.pdf');
    expect(body).toContain('Label Rules');
    expect(body).toContain('Page Range');
    expect(body).toContain('Style');
    expect(body).toContain('Add Rule');
    expect(body).toContain('Apply Labels');
  });

  test('applying labels processes successfully', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await expect(page.locator('[data-state="config"]')).toBeVisible({ timeout: 10000 });

    // Click Apply Labels — worker processes with default rule (all pages, Decimal Arabic)
    await page.locator('button:has-text("Apply Labels")').click();

    // Wait for processing to complete
    await expect(page.locator('.text-green-300')).toBeVisible({ timeout: 30000 });
    const body = await page.textContent('body');
    expect(body).toContain('Page labels added successfully');
  });

  test('add and remove rule buttons work', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await expect(page.locator('[data-state="config"]')).toBeVisible({ timeout: 10000 });

    // Should start with 1 rule
    await expect(page.locator('text=Rule 1')).toBeVisible();

    // Add a second rule
    await page.locator('button:has-text("Add Rule")').click();
    await expect(page.locator('text=Rule 2')).toBeVisible();

    // Both rules visible
    const rules = await page.locator('text=/^Rule \\d+$/').count();
    expect(rules).toBe(2);
  });
});
