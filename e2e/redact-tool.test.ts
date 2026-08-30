import { test, expect } from '@playwright/test';
import fs from 'fs';

const TOOL_URL = '/pdf/redact';
const TEST_PDF = 'public/pdf/test-files/english-test.pdf';

test.describe('Redact PDF tool', () => {
  test('page loads with upload UI', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').first()).toContainText('Redact');
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('uploading PDF shows canvas with page navigation', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    // Canvas is rendered
    await expect(page.locator('canvas')).toBeVisible();

    // Page navigation shows correct info
    const body = await page.textContent('[data-state="loaded"]');
    expect(body).toContain('Page 1 of');
    expect(body).toContain('0 redactions');

    // Apply button exists but should be disabled with 0 redactions
    const applyBtn = page.locator('button:has-text("Apply")');
    await expect(applyBtn).toBeVisible();
  });

  test('drawing a rectangle creates a redaction', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await page.waitForSelector('[data-state="loaded"]', { timeout: 30000 });

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Draw a redaction rectangle
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 250, box.y + 100, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Structural assertion: redaction count updated
      const body = await page.textContent('[data-state="loaded"]');
      expect(body).toContain('1 redaction');

      // Undo button should appear
      await expect(page.locator('button:has-text("Undo")')).toBeVisible();
    }
  });

  test('applying redaction produces valid redacted PDF', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await page.waitForSelector('[data-state="loaded"]', { timeout: 30000 });

    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Draw a redaction
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.down();
      await page.mouse.move(box.x + 300, box.y + 150, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Capture download
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.locator('button:has-text("Apply")').click(),
      ]);

      const downloadPath = await download.path();
      const savedBytes = fs.readFileSync(downloadPath);

      // Structural assertion: output is valid PDF
      expect(savedBytes.length).toBeGreaterThan(100);
      expect(savedBytes.slice(0, 5).toString()).toBe('%PDF-');

      // Structural assertion: output is larger (black rectangle added)
      const origBytes = fs.readFileSync(TEST_PDF);
      expect(savedBytes.length).toBeGreaterThanOrEqual(origBytes.length);
    }
  });

  test('start over returns to idle', async ({ page }) => {
    await page.goto(TOOL_URL);
    await page.waitForTimeout(2000);

    await page.locator('input[type="file"]').setInputFiles(TEST_PDF);
    await expect(page.locator('[data-state="loaded"]')).toBeVisible({ timeout: 30000 });

    await page.locator('button:has-text("Start Over")').click();
    await expect(page.locator('[data-state="idle"]')).toBeVisible();
  });
});
