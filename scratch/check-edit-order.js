const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3099/cad/scale-calculator');

  // Step 1: user fills scaleVal = 1
  await page.fill('[data-testid="in-scaleVal"]', '1');
  // Step 2: user fills x = 200
  await page.fill('[data-testid="in-x"]', '200');
  await page.waitForTimeout(300);

  console.log('--- Step 1 & 2: filled scaleVal=1, x=200 ---');
  console.log('scaleVal:', await page.inputValue('[data-testid="in-scaleVal"]'));
  console.log('x:', await page.inputValue('[data-testid="in-x"]'));
  console.log('realVal (auto-computed):', await page.inputValue('[data-testid="in-realVal"]'));
  console.log('Banner:', await page.textContent('[data-testid="banner"]'));

  // Step 3: user edits realVal to 0.4
  // Now most recent 2 are: x (200) and realVal (0.4)
  // The least recently touched is scaleVal (1).
  // Therefore scaleVal should be auto-computed to: 0.4 m / 200 = 0.002 m = 2 mm!
  await page.fill('[data-testid="in-realVal"]', '0.4');
  await page.waitForTimeout(300);

  console.log('\n--- Step 3: edited realVal=0.4 ---');
  console.log('scaleVal (auto-computed):', await page.inputValue('[data-testid="in-scaleVal"]'));
  console.log('x (kept):', await page.inputValue('[data-testid="in-x"]'));
  console.log('realVal (user):', await page.inputValue('[data-testid="in-realVal"]'));
  console.log('Banner:', await page.textContent('[data-testid="banner"]'));

  // Step 4: now user edits scaleVal to 2
  // Then touches scaleVal again to 1
  // Now the two most recent are realVal (0.4) and scaleVal (1).
  // Now x is least recently touched, so x should auto-compute: (0.4 m) / (1 mm) = 400!
  await page.fill('[data-testid="in-scaleVal"]', '1');
  await page.waitForTimeout(300);

  console.log('\n--- Step 4: edited scaleVal=1 (now realVal and scaleVal are 2 most recent) ---');
  console.log('scaleVal (user):', await page.inputValue('[data-testid="in-scaleVal"]'));
  console.log('x (auto-computed):', await page.inputValue('[data-testid="in-x"]'));
  console.log('realVal (kept):', await page.inputValue('[data-testid="in-realVal"]'));
  console.log('Banner:', await page.textContent('[data-testid="banner"]'));

  await browser.close();
})();
