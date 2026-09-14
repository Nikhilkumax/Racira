const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const artifactDir = path.resolve(__dirname, '..');
  console.log('Artifact dir:', artifactDir);

  console.log('Navigating to http://localhost:3099/cad/scale-calculator...');
  await page.goto('http://localhost:3099/cad/scale-calculator', { waitUntil: 'networkidle' });

  // 1. Initial page screenshot
  await page.screenshot({ path: path.join(artifactDir, 'preview_initial.png') });
  console.log('Saved preview_initial.png');

  // 2. Mode 1 test: 1:200 mm -> m
  console.log('\n--- Testing Mode 1: 1:200 mm -> m ---');
  await page.fill('[data-testid="in-scaleVal"]', '1');
  await page.fill('[data-testid="in-x"]', '200');
  await page.waitForTimeout(300);

  const mode1RealVal = await page.inputValue('[data-testid="in-realVal"]');
  const mode1Banner = await page.textContent('[data-testid="banner"]');
  console.log('Mode 1 Result - Real Val input:', mode1RealVal, '| Banner:', mode1Banner);
  await page.screenshot({ path: path.join(artifactDir, 'preview_mode1_1_200.png') });
  console.log('Saved preview_mode1_1_200.png');

  // Test Mode 1 edit order flip: now edit Real Val to 0.4 m -> X should become 400
  console.log('\n--- Testing Mode 1 Edit Order: edit realVal to 0.4 -> X should solve 400 ---');
  await page.fill('[data-testid="in-realVal"]', '0.4');
  await page.waitForTimeout(300);
  const mode1XVal = await page.inputValue('[data-testid="in-x"]');
  console.log('Mode 1 Result - X input after editing realVal:', mode1XVal, '(expected 400)');

  // Test Mode 1 Toggle button
  console.log('\n--- Testing Mode 1 Toggle button ---');
  await page.click('[data-testid="btn-toggle-x"]');
  await page.waitForTimeout(300);
  const mode1ToggleBanner = await page.textContent('[data-testid="banner"]');
  console.log('Banner after Toggle:', mode1ToggleBanner);
  await page.screenshot({ path: path.join(artifactDir, 'preview_mode1_toggled.png') });
  console.log('Saved preview_mode1_toggled.png');

  // Test Reset button
  console.log('\n--- Testing Reset button ---');
  await page.click('[data-testid="btn-reset"]');
  await page.waitForTimeout(300);
  const resetScaleVal = await page.inputValue('[data-testid="in-scaleVal"]');
  const resetX = await page.inputValue('[data-testid="in-x"]');
  const resetReal = await page.inputValue('[data-testid="in-realVal"]');
  console.log('Reset check - scaleVal:', resetScaleVal, 'x:', resetX, 'real:', resetReal);

  // 3. Mode 2 test: 1/4" = 1'-0"
  console.log('\n--- Testing Mode 2: Inches-to-the-foot scale ---');
  await page.click('[data-testid="mode-inch-to-foot"]');
  await page.waitForTimeout(300);

  // Set drawnInches = 1/4 (or 0.25), realFeet = 1, scaleVal = 1
  await page.fill('[data-testid="in-scaleVal"]', '1'); // 1 mm
  await page.fill('[data-testid="in-drawn-inches"]', '1/4');
  await page.fill('[data-testid="in-real-feet"]', '1');
  await page.waitForTimeout(300);

  const mode2RealVal = await page.inputValue('[data-testid="in-realVal"]');
  const mode2Banner = await page.textContent('[data-testid="banner"]');
  console.log('Mode 2 Result - Real Val input:', mode2RealVal, '| Banner:', mode2Banner);
  await page.screenshot({ path: path.join(artifactDir, 'preview_mode2_inch_foot.png') });
  console.log('Saved preview_mode2_inch_foot.png');

  // 4. Mode 3 test: Scale factor 1.2
  console.log('\n--- Testing Mode 3: Scale factor 1.2 ---');
  await page.click('[data-testid="mode-scale-factor"]');
  await page.waitForTimeout(300);
  await page.selectOption('[data-testid="in-realUnit"]', 'mm');
  await page.fill('[data-testid="in-scaleVal"]', '100');
  await page.fill('[data-testid="in-factor"]', '1.2');
  await page.waitForTimeout(300);

  const mode3RealVal = await page.inputValue('[data-testid="in-realVal"]');
  const mode3Banner = await page.textContent('[data-testid="banner"]');
  console.log('Mode 3 Result - Real Val input (mm):', mode3RealVal, '| Banner:', mode3Banner);
  await page.screenshot({ path: path.join(artifactDir, 'preview_mode3_scale_factor.png') });
  console.log('Saved preview_mode3_scale_factor.png');

  // 5. Mode 4 test: Convert units mm -> ft (1000 mm -> ~3.28084 ft)
  console.log('\n--- Testing Mode 4: Convert units mm -> ft ---');
  await page.click('[data-testid="mode-convert"]');
  await page.waitForTimeout(300);
  await page.selectOption('[data-testid="in-convInUnit"]', 'mm');
  await page.selectOption('[data-testid="in-convOutUnit"]', 'ft');
  await page.fill('[data-testid="in-convIn"]', '1000');
  await page.waitForTimeout(300);

  const mode4ConvOut = await page.inputValue('[data-testid="in-convOut"]');
  const mode4Banner = await page.textContent('[data-testid="banner"]');
  console.log('Mode 4 Result - Converted Output:', mode4ConvOut, '| Banner:', mode4Banner);
  await page.screenshot({ path: path.join(artifactDir, 'preview_mode4_convert.png') });
  console.log('Saved preview_mode4_convert.png');

  // 6. Inspect unit dropdown options for Petameter (Pm)
  console.log('\n--- Checking Dropdown rendering for Petameter (Pm) ---');
  await page.click('[data-testid="mode-one-to-x"]');
  await page.waitForTimeout(200);
  const pmOptionText = await page.$eval('[data-testid="in-scaleUnit"] option[value="Pm"]', el => el.textContent);
  console.log('Pm option text content:', pmOptionText);

  await browser.close();
  console.log('\nBrowser verification complete!');
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
