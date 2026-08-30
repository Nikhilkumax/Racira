import { test, expect } from '@playwright/test';
import fs from 'fs';

const TOOL_URL = '/pdf/edit-attachments';
const TEST_PDF_WITH_ATTACH = 'public/pdf/test-files/with-attachment.pdf';
const TEST_PDF_NO_ATTACH = 'public/pdf/test-files/english-test.pdf';

test.describe('Edit Attachments tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Edit Attachments');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('uploading a PDF with no attachments shows correct state', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF_NO_ATTACH);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('english-test.pdf');
    expect(body).toContain('KB');
    expect(body).toContain('0 attachments');
    expect(body).toContain('No attachments');

    // Save button should NOT appear (nothing to remove)
    await expect(page.locator('button:has-text("Save")')).not.toBeVisible();
  });

  test('uploading a PDF with attachment shows attachment name and remove button', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF_WITH_ATTACH);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // Structural assertion: attachment is listed by name
    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('1 attachment');
    expect(body).toContain('test-attachment.txt');

    // Remove button is present
    await expect(page.locator('button[title="Remove"]')).toBeVisible();
  });

  test('removing attachment and downloading produces a valid PDF with no attachments', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    // Upload PDF with 1 attachment
    await page.locator('input[type="file"]').setInputFiles(TEST_PDF_WITH_ATTACH);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    const bodyBefore = await page.textContent('[data-state="loaded"]');
    expect(bodyBefore).toContain('1 attachment');

    // Click remove on the attachment
    await page.locator('button[title="Remove"]').click();
    await page.waitForTimeout(300);

    // Save button should appear
    const saveBtn = page.locator('button:has-text("Save")');
    await expect(saveBtn).toBeVisible();

    // Capture the download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      saveBtn.click(),
    ]);

    // Save downloaded file
    const downloadPath = await download.path();
    const savedBytes = fs.readFileSync(downloadPath);

    // Structural assertion 1: output is a valid PDF
    expect(savedBytes.length).toBeGreaterThan(100);
    expect(savedBytes.slice(0, 5).toString()).toBe('%PDF-');

    // Structural assertion 2: output is smaller (attachment removed)
    const origBytes = fs.readFileSync(TEST_PDF_WITH_ATTACH);
    expect(savedBytes.length).toBeLessThan(origBytes.length);

    // Save the output for the re-upload verification below
    fs.writeFileSync('public/pdf/test-files/no-attachment-output.pdf', savedBytes);
  });

  test('re-uploaded output shows 0 attachments after removal', async ({ page }) => {
    // This test depends on the previous test having saved the output file
    // If the file doesn't exist, skip gracefully
    if (!fs.existsSync('public/pdf/test-files/no-attachment-output.pdf')) {
      // Run the removal first via a quick script
      const { execSync } = require('child_process');
      // Just skip — the previous test should have saved it
      test.skip();
      return;
    }

    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles('public/pdf/test-files/no-attachment-output.pdf');
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('0 attachments');
    expect(body).toContain('No attachments');
  });

  test('start over button returns to idle state', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF_NO_ATTACH);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    await page.locator('button:has-text("Start Over")').click();
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
  });
});
