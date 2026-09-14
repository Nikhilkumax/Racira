import { chromium } from 'playwright';

const BASE = 'http://localhost:3002';
const browser = await chromium.launch();
const page = await browser.newPage();

const out = (...a) => console.log(...a);

async function stats(label) {
  const seg = (await page.getByTestId('res-seg').textContent())?.trim();
  const total = (await page.getByTestId('res-total').textContent())?.trim();
  const real = (await page.getByTestId('res-real').textContent())?.trim();
  const steps = (await page.getByTestId('res-steps').textContent())?.trim();
  const eff = (await page.locator('text=/Effective scale/').first().locator('xpath=..').textContent())?.replace(/\s+/g, ' ').trim();
  out(`\n[${label}]`);
  out(`  seg=${seg}  total=${total}  real=${real}  steps=${steps}`);
  out(`  effective="${eff}"`);
  return { seg, total, real, steps, eff };
}

await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: 'networkidle' });

out('=== ITEM 1/2: defaults (1:200, m, 1 per seg, 100mm) ===');
await stats('defaults');

out('\n--- change x to 100 (reactivity of stat rows) ---');
await page.getByTestId('in-x').fill('100');
await stats('x=100');

out('\n--- restore 200, toggle X:1 (flipX) ---');
await page.getByTestId('in-x').fill('200');
const toggle = page.getByRole('button', { name: /Toggle X : 1|Show 1 : X/i });
out(`  toggle button text: "${(await toggle.textContent())?.trim()}"`);
await toggle.click();
await stats('flipX=true x=200');
out(`  toggle button text now: "${(await toggle.textContent())?.trim()}"`);
await toggle.click();
await stats('flipX=false x=200 again');

out('\n=== ITEM 2: scale-mode reactivity ===');
await page.getByRole('radio', { name: /Inches-to-the-foot/i }).check();
await stats('inch-to-foot 0.25 = 1-0');
await page.getByRole('radio', { name: /Scale factor/i }).check();
await stats('scale-factor 1.2');
await page.getByTestId('in-factor').fill('5');
await stats('scale-factor 5');
await page.getByRole('radio', { name: /One-to-X/i }).check();
await stats('back to one-to-X (x still 200)');

out('\n=== ITEM 3: SVG preview structure ===');
const svg = await page.evaluate(() => {
  const s = document.querySelector('svg[role="img"]');
  if (!s) return { found: false };
  return {
    found: true,
    aria: s.getAttribute('aria-label'),
    viewBox: s.getAttribute('viewBox'),
    width: s.getAttribute('width'),
    height: s.getAttribute('height'),
    rects: s.querySelectorAll('rect').length,
    lines: s.querySelectorAll('line').length,
    texts: [...s.querySelectorAll('text')].map((t) => t.textContent),
    textCount: s.querySelectorAll('text').length,
    bbox: (() => { const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
  };
});
out('  svg:', JSON.stringify(svg));

out('\n=== ITEM 3b: each bar style ===');
for (const style of ['double-row', 'single-row', 'line']) {
  await page.getByTestId('in-barStyle').selectOption(style);
  const info = await page.evaluate(() => {
    const s = document.querySelector('svg[role="img"]');
    if (!s) return null;
    return {
      rects: s.querySelectorAll('rect').length,
      lines: s.querySelectorAll('line').length,
      texts: [...s.querySelectorAll('text')].map((t) => t.textContent),
      bbox: (() => { const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
    };
  });
  out(`  ${style}: ${JSON.stringify(info)}`);
}
await page.getByTestId('in-barStyle').selectOption('double-row');

out('\n=== ITEM 4: Steps manual/automatic ===');
out(`  manual select present: ${await page.getByTestId('in-stepMode').count()}`);
out(`  stepCount visible (auto): ${await page.getByTestId('in-stepCount').count()}`);
await page.getByTestId('in-stepMode').selectOption('manual');
out(`  stepCount visible (manual): ${await page.getByTestId('in-stepCount').count()}`);
await stats('manual, stepCount=5');
await page.getByTestId('in-stepCount').fill('8');
await stats('manual, stepCount=8');
await page.getByTestId('in-stepCount').fill('3');
await stats('manual, stepCount=3');
await page.getByTestId('in-stepMode').selectOption('automatic');
out(`  stepCount visible (back to auto): ${await page.getByTestId('in-stepCount').count()}`);
await stats('auto again');
await page.getByTestId('in-divStyle').selectOption('proportional');
await stats('auto, proportional');
await page.getByTestId('in-divStyle').selectOption('exponential');

out('\n=== ITEM 5: Reset button presence ===');
const buttons = await page.evaluate(() =>
  [...document.querySelectorAll('button')].map((b) => ({ text: (b.textContent || '').trim().slice(0, 40), testid: b.getAttribute('data-testid') }))
);
out('  buttons:', JSON.stringify(buttons));
out(`  button containing "Reset": ${buttons.filter((b) => /reset/i.test(b.text)).length}`);

out('\n=== ITEM 6: Download labels ===');
const dl = await page.evaluate(() => {
  const body = document.body.innerText;
  return {
    hasDownloadAs: /Download as/i.test(body),
    hasSummaryLine: /width of the scale bar/i.test(body),
    hasPlainSummary: /scale bar is/i.test(body),
  };
});
out('  ', JSON.stringify(dl));

await browser.close();
