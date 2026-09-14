const { chromium } = require('playwright');
const path = require('path');

const targetDir = 'C:\\Users\\nikhi\\.gemini\\antigravity\\brain\\37ff9a84-f90c-4ba5-9fd1-76eea4a77521';

async function capturePreviews() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 750 },
    deviceScaleFactor: 2, // crisp high-DPI screenshots
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3099/cad/scale-calculator...');
  await page.goto('http://localhost:3099/cad/scale-calculator', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Mode 1: 1:200 mm -> m
  console.log('Capturing Mode 1 (1:200 mm -> m)...');
  await page.fill('[data-testid="in-scaleVal"]', '1');
  await page.fill('[data-testid="in-x"]', '200');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_mode1_1_200.png') });

  // 2. Mode 2: 1/4" = 1'-0"
  console.log('Capturing Mode 2 (1/4" = 1\'-0")...');
  await page.click('[data-testid="mode-inch-to-foot"]');
  await page.waitForTimeout(300);
  await page.fill('[data-testid="in-scaleVal"]', '1');
  await page.fill('[data-testid="in-drawn-inches"]', '1/4');
  await page.fill('[data-testid="in-real-feet"]', '1');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_mode2_inch_foot.png') });

  // 3. Mode 3: Scale factor 1.2x
  console.log('Capturing Mode 3 (Scale factor 1.2x)...');
  await page.click('[data-testid="mode-scale-factor"]');
  await page.waitForTimeout(300);
  await page.selectOption('[data-testid="in-realUnit"]', 'mm');
  await page.fill('[data-testid="in-scaleVal"]', '100');
  await page.fill('[data-testid="in-factor"]', '1.2');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_mode3_scale_factor.png') });

  // 4. Mode 4: Convert units mm -> ft
  console.log('Capturing Mode 4 (Convert mm -> ft)...');
  await page.click('[data-testid="mode-convert"]');
  await page.waitForTimeout(300);
  await page.selectOption('[data-testid="in-convInUnit"]', 'mm');
  await page.selectOption('[data-testid="in-convOutUnit"]', 'ft');
  await page.fill('[data-testid="in-convIn"]', '1000');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_mode4_convert.png') });

  await browser.close();
  console.log('All screenshots captured and saved to:', targetDir);
}

capturePreviews().catch(err => {
  console.error(err);
  process.exit(1);
});
