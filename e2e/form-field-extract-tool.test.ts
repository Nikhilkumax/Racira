import { test, expect } from '@playwright/test';

const TOOL_URL = '/pdf/form-field-extract';
const PDF_WITH_FORMS = 'public/pdf/test-files/with-form-fields.pdf';
const PDF_WITHOUT_FORMS = 'public/pdf/test-files/english-test.pdf';

test.describe('Extract Form Fields tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Extract Form Fields');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('extracts form fields from a PDF with forms', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(PDF_WITH_FORMS);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    const body = await page.textContent('[data-state="loaded"]');

    // Structural assertion: correct field count
    expect(body).toContain('3 fields found');

    // Structural assertion: specific field names are present
    expect(body).toContain('Full Name');
    expect(body).toContain('Agree to Terms');
    expect(body).toContain('Country');

    // Structural assertion: field types are displayed
    expect(body).toContain('text');
    expect(body).toContain('checkbox');
    expect(body).toContain('dropdown');

    // Structural assertion: export button exists
    await expect(page.locator('button:has-text("Export as JSON")')).toBeVisible();

    // Structural assertion: table headers are present
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Page")')).toBeVisible();
  });

  test('shows empty state for PDF without form fields', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(PDF_WITHOUT_FORMS);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('0 fields found');
    expect(body).toContain('No interactive form fields');

    // Export button should not appear for 0 fields (or should be disabled)
    await expect(page.locator('button:has-text("Export as JSON")')).toBeVisible();
  });

  test('start over returns to idle state', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(PDF_WITH_FORMS);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    await page.locator('button:has-text("Start Over")').click();
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
  });
});
