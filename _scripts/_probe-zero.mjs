import { chromium } from 'playwright';

const zero = [
  // sketch tool (Phase A, no SEO ever)
  '2d-cad-sketch-tool',
  // Batch 6 — 2D Drafting (3)
  'line-weight-manager',
  'scale-bar-tool',
  'cad-grid-planner',
  // Batch 6 — CNC & Fabrication (8)
  'material-cutting-reference',
  'tooling-library-browser',
  'g-code-reference-viewer',
  'machining-operation-selector',
  'chip-load-calculator',
  'cnc-material-thickness-guide',
  'laser-cutter-power-reference',
  'waterjet-cutting-reference',
];

const present = {
  // one sample per completed batch
  'scale-factor-calculator': 5,       // batch 1
  'distance-calculator-2d': 5,        // batch 2
  'cylindricity-reference': 5,        // batch 3
  'shaft-design-reference': 5,        // batch 4
  'wire-gauge-reference': 5,          // batch 5
  'schematic-symbol-library-browser': 5, // batch 5
};

const browser = await chromium.launch();
let failures = 0;

for (const slug of zero) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:3002/cad/${slug}`, { waitUntil: 'networkidle' });
  const has = await page.evaluate(() => !!document.querySelector('.seo-prose'));
  if (has) { failures++; console.log(`FAIL ${slug} — expected NO seo-prose, found one`); }
  else console.log(`PASS ${slug} — zero SEO (correct)`);
  await page.close();
}

for (const [slug, wantH2] of Object.entries(present)) {
  const page = await browser.newPage();
  await page.goto(`http://localhost:3002/cad/${slug}`, { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => {
    const prose = document.querySelector('.seo-prose');
    if (!prose) return { h2: 0 };
    return { h2: prose.querySelectorAll('h2').length };
  });
  if (info.h2 !== wantH2) { failures++; console.log(`FAIL ${slug} — expected ${wantH2} h2s, found ${info.h2}`); }
  else console.log(`PASS ${slug} — ${info.h2} h2 sections present`);
  await page.close();
}

await browser.close();
console.log(failures === 0 ? 'ALL ZERO-SEO CHECKS PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);