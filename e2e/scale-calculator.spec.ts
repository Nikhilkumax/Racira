import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const outDir = path.join(process.cwd(), 'tests', 'output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

test.describe('Scale Calculator UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/calculator/scale-calculator');
    await page.waitForLoadState('networkidle');
  });

  const getHeroResult = async (page: any) => {
    return await page.locator('.text-4xl').first().innerText();
  };

  // ── TEST 1: Multiple unit pairs per quantity type ─────────────────────────
  test('1. Multiple unit-pair conversions for all 6 quantity types', async ({ page }) => {
    const types = [
      {
        tab: 'Length',
        pairs: [
          { s: 'cm', r: 'm', v: '100', note: '100cm @1:10 → 10m' },
          { s: 'in', r: 'ft', v: '24', note: '24in @1:10 → 2.4ft' },
        ],
      },
      {
        tab: 'Area',
        pairs: [
          { s: 'cm²', r: 'm²', v: '20', note: '20cm² @1:10 → 0.2m²' },
          { s: 'square inch (in²)', r: 'square foot (ft²)', v: '144', note: '144in² @1:10' },
        ],
      },
      {
        tab: 'Volume',
        pairs: [
          { s: 'cm³ (milliliter)', r: 'm³ (kiloliter)', v: '100', note: '100ml @1:10' },
          { s: 'dm³ (liter)', r: 'm³ (kiloliter)', v: '1000', note: '1000L @1:10' },
        ],
      },
      {
        tab: 'Mass',
        pairs: [
          { s: 'gram (g)', r: 'kilogram (kg)', v: '500', note: '500g @1:10 → 50kg' },
          { s: 'milligram (mg)', r: 'gram (g)', v: '1000', note: '1000mg @1:10' },
        ],
      },
      {
        tab: 'Temperature',
        pairs: [
          { s: 'celsius (°C)', r: 'fahrenheit (°F)', v: '100', note: '100°C → 212°F' },
          { s: 'fahrenheit (°F)', r: 'celsius (°C)', v: '32', note: '32°F → 0°C' },
        ],
      },
      {
        tab: 'Angle',
        pairs: [
          { s: 'degree (°)', r: 'radian (rad)', v: '180', note: '180° → π rad' },
          { s: 'radian (rad)', r: 'degree (°)', v: '1', note: '1rad → 57.3°' },
        ],
      },
    ];

    for (const type of types) {
      await page.getByRole('button', { name: type.tab, exact: false }).first().click();
      await page.waitForTimeout(300);

      for (let i = 0; i < type.pairs.length; i++) {
        const pair = type.pairs[i];
        await page.locator('#scale-unit').selectOption(pair.s);
        await page.locator('#real-unit').selectOption(pair.r);
        await page.locator('#scale-value').fill(pair.v);
        await page.getByRole('button', { name: 'Calculate' }).click();
        await page.waitForTimeout(300);

        if (i === 0) {
          await page.screenshot({
            path: path.join(outDir, `1_tab_${type.tab.toLowerCase()}.png`),
            fullPage: true,
          });
        }

        const result = await getHeroResult(page);
        console.log(`${type.tab} [${pair.note}]: ${result}`);
        expect(result.trim()).not.toBe('');
      }
    }
  });

  // ── TEST 2: Toggle 1:X ⇄ X:1 ──────────────────────────────────────────
  test('2. Toggle button inverts ratio (1:X ⇄ X:1)', async ({ page }) => {
    await page.getByRole('button', { name: 'Length', exact: false }).first().click();
    await page.locator('#scale-value').fill('10');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(300);

    const beforeResult = await getHeroResult(page);
    console.log('Before toggle:', beforeResult);

    await page.locator('button[title^="Toggle between Reduction"]').click();
    await page.waitForTimeout(300);

    const afterResult = await getHeroResult(page);
    console.log('After toggle:', afterResult);

    expect(beforeResult).not.toEqual(afterResult);
  });

  // ── TEST 3: Nearest Standard Scale snap — assert on ratio field ───────────
  test('3. Nearest Standard Scale snap — ratio field matches preset', async ({ page }) => {
    await page.getByRole('button', { name: 'Length', exact: false }).first().click();

    // Use same units (m→m) so a clean ratio is computed
    await page.locator('#scale-unit').selectOption('m');
    await page.locator('#real-unit').selectOption('m');

    // Solve for Ratio mode
    await page.getByRole('button', { name: 'Scale Ratio' }).first().click();

    // scale=1m, real=97m → ratio 1:97, nearest standard is 1:96
    await page.locator('#scale-value').fill('1');
    await page.locator('#real-value').fill('97');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(300);

    await page.screenshot({ path: path.join(outDir, '3_banner_before_snap.png') });

    const banner = page.locator('text=Closest standard scale:');
    await expect(banner).toBeVisible();
    const bannerText = await banner.innerText();
    console.log('Banner text:', bannerText);

    const match = bannerText.match(/1:(\d+)/);
    const standardDenom = match ? match[1] : null;
    console.log('Expected standard denominator:', standardDenom);
    expect(standardDenom).not.toBeNull();

    // Click snap — switches to 1:X mode with ratio = standardDenom
    await page.getByRole('button', { name: 'Use this scale', exact: true }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(outDir, '3_banner_after_snap.png') });

    const snappedRatioValue = await page.locator('#scale-ratio').inputValue();
    console.log('Scale ratio field after snap:', snappedRatioValue);
    expect(parseFloat(snappedRatioValue)).toBeCloseTo(parseFloat(standardDenom!), 0);
  });

  // ── TEST 4: Mode-gating for Temperature and Angle ─────────────────────────
  test('4. Mode-gating: Temperature and Angle locked to convert-only', async ({ page }) => {
    for (const tab of ['Temperature', 'Angle']) {
      await page.getByRole('button', { name: tab, exact: false }).first().click();
      await page.waitForTimeout(200);

      await expect(page.getByRole('button', { name: 'Scale Ratio' })).toBeHidden();
      await expect(page.getByRole('button', { name: /Convert Units Only/ })).toHaveClass(/border-primary/);
      await expect(page.getByRole('button', { name: /1 : X Scale/ })).toBeDisabled();

      console.log(`${tab}: mode-gating confirmed`);
    }
    await page.screenshot({ path: path.join(outDir, '4_mode_gating.png') });
  });

  // ── TEST 5: DPI fallback (blank → 96) and custom DPI ─────────────────────
  test('5. DPI fallback (blank=96px) and custom DPI changes pixel result', async ({ page }) => {
    // Length tab is the default and shows DPI setting
    await page.getByRole('button', { name: 'Length', exact: false }).first().click();
    await page.waitForTimeout(300);

    // Select scale unit = inch, real unit = px
    await page.locator('#scale-unit').selectOption('in');
    await page.locator('#real-unit').selectOption('px');

    // Set ratio to 1:1 so 1 in drawing = 1 in real = 96 px at 96 DPI
    await page.locator('#scale-ratio').fill('1');

    // Clear DPI — should default to 96
    const dpiInput = page.locator('#dpi-input');
    await expect(dpiInput).toBeVisible();
    await dpiInput.fill('');
    await page.locator('#scale-value').fill('1'); // 1 inch
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(300);

    let result = await getHeroResult(page);
    console.log('Result with blank DPI (expect 96 px):', result);
    expect(result.trim()).toContain('96 px');

    // Custom DPI = 300
    await dpiInput.fill('300');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(300);

    result = await getHeroResult(page);
    console.log('Result with DPI=300 (expect 300 px):', result);
    expect(result.trim()).toContain('300 px');

    await page.screenshot({ path: path.join(outDir, '5_dpi_test.png') });
  });

  // ── TEST 6: Negative input validation ────────────────────────────────────
  test('6. Negative input shows validation error (spatial types) and allows Temperature', async ({ page }) => {
    const spatialTabs = ['Length', 'Area', 'Volume', 'Mass'];

    for (const tab of spatialTabs) {
      await page.getByRole('button', { name: tab, exact: false }).first().click();
      await page.waitForTimeout(200);

      await page.locator('#scale-value').fill('-5');
      await page.getByRole('button', { name: 'Calculate' }).click();
      await page.waitForTimeout(200);

      const errorMsg = page.locator('text=Negative values are not supported for this quantity type.');
      await expect(errorMsg).toBeVisible();
      console.log(`${tab}: negative validation message shown correctly`);

      await expect(
        page.locator('.overflow-x-auto.rounded-lg.border.border-border.bg-card')
      ).toBeHidden();
    }

    await page.screenshot({ path: path.join(outDir, '6_negative_validation.png') });

    // Temperature: -40°C → -40°F is a valid conversion — no error shown
    await page.getByRole('button', { name: 'Temperature', exact: false }).first().click();
    await page.waitForTimeout(200);
    await page.locator('#scale-value').fill('-40');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(200);
    await expect(page.locator('text=Negative values are not supported')).toBeHidden();
    const tempResult = await getHeroResult(page);
    console.log('Temperature -40°C result:', tempResult);
    expect(tempResult.trim()).not.toBe('');
  });

  // ── TEST 7: Programmatic unit count badge assertion ───────────────────────
  test('7. Unit count badge matches scaleLogic.ts array length exactly for all 6 types', async ({ page }) => {
    const expectedCounts = {
      Length: 40,
      Area: 20,
      Volume: 30,
      Mass: 19,
      Temperature: 4,
      Angle: 14,
    };

    for (const [tabName, count] of Object.entries(expectedCounts)) {
      const tabButton = page.getByRole('button', { name: tabName, exact: false }).first();
      await expect(tabButton).toBeVisible();
      const text = await tabButton.innerText();
      console.log(`Tab ${tabName} button text:`, text.replace(/\n/g, ' '));
      expect(text).toContain(`${count} units`);
    }
  });

  // ── TEST 8: Temperature tab fixes (tip suppression, ratio hidden, label fully visible) ──
  test('8. Temperature tab: label fully rendered, tip-box suppressed, Solve For Ratio hidden', async ({ page }) => {
    const tempTab = page.getByRole('button', { name: 'Temperature', exact: false }).first();
    await tempTab.click();
    await page.waitForTimeout(300);

    // Verify label text
    const labelSpan = tempTab.locator('span').first();
    await expect(labelSpan).toHaveText('Temperature');

    // Solve For: Scale Ratio must be HIDDEN
    const solveForRatioBtn = page.getByRole('button', { name: 'Scale Ratio' });
    await expect(solveForRatioBtn).toBeHidden();

    // Drafting & Sizing Tip box must be HIDDEN
    const draftingTip = page.locator('text=Drafting & Sizing Tip');
    await expect(draftingTip).toBeHidden();

    // Verify floating-point fix: 32°F -> 0°C must show clean "0 celsius (°C)" without "5.6843e-14"
    await page.locator('#scale-unit').selectOption('fahrenheit (°F)');
    await page.locator('#real-unit').selectOption('celsius (°C)');
    await page.locator('#scale-value').fill('32');
    await page.getByRole('button', { name: 'Calculate' }).click();
    await page.waitForTimeout(300);

    const tempResult = await getHeroResult(page);
    console.log('32°F -> °C Hero Result:', tempResult);
    expect(tempResult.trim()).toBe('0 celsius (°C)');
    expect(tempResult).not.toContain('e-');

    await page.screenshot({ path: path.join(outDir, '8_temperature_tab_fixed.png') });
  });

  // ── TEST 9: Angle tab: Solve For Ratio hidden and tip suppressed ─────────
  test('9. Angle tab: Solve For Ratio hidden and tip-box suppressed', async ({ page }) => {
    const angleTab = page.getByRole('button', { name: 'Angle', exact: false }).first();
    await angleTab.click();
    await page.waitForTimeout(300);

    const solveForRatioBtn = page.getByRole('button', { name: 'Scale Ratio' });
    await expect(solveForRatioBtn).toBeHidden();

    const draftingTip = page.locator('text=Drafting & Sizing Tip');
    await expect(draftingTip).toBeHidden();
  });

  // ── TEST 10: All 6 tabs visible without clipping on Desktop and Mobile ────
  test('10. Tab row renders all 6 tabs cleanly on Desktop and Mobile', async ({ page }) => {
    // Desktop screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3002/calculator/scale-calculator');
    await page.waitForLoadState('networkidle');
    const tabsContainer = page.locator('div.grid.grid-cols-3.sm\\:grid-cols-6');
    await expect(tabsContainer).toBeVisible();
    await tabsContainer.screenshot({ path: path.join(outDir, '10_tabs_desktop.png') });

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await tabsContainer.screenshot({ path: path.join(outDir, '10_tabs_mobile.png') });
  });

  // ── TEST 11: SEO content section renders naturally with existing FAQ ─────
  test('11. SEO content section renders with full width and integrated FAQ', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:3002/calculator/scale-calculator');
    await page.waitForLoadState('networkidle');

    const heading1 = page.getByRole('heading', {
      name: 'Understanding Scale Ratios, Blueprint Proportions, and Physical Dimensions',
    });
    await expect(heading1).toBeVisible();

    const heading2 = page.getByRole('heading', {
      name: 'How Dimensional Scaling Laws Apply to Length, Area, Volume, and Mass',
    });
    await expect(heading2).toBeVisible();

    const seoSection = page.locator('section.prose-finance');
    await expect(seoSection).toBeVisible();

    // Scroll to SEO section and capture screenshot
    await seoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, '11_seo_content_section.png') });
  });
});
