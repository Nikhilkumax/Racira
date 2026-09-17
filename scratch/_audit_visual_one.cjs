/**
 * Visual QA per calculator slug (uses the thread preview dev server on :3000).
 * - Verifies the [slug] page is NOT the ComingSoon template
 * - Confirms results panel is EMPTY before Calculate (Mortgage gold standard)
 * - Clicks Calculate, confirms primary result card appears
 * - Screenshots to .qa-screens/batch1/
 * Usage: node scratch/_audit_visual_one.cjs <slug> [compName]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const slug = process.argv[2];
const compName = process.argv[3] || '';
if (!slug) { console.error('usage: node scratch/_audit_visual_one.cjs <slug> [compName]'); process.exit(2); }

const BASE = 'http://localhost:3002';
const URL = `${BASE}/calculator/${slug}`;
const outDir = path.join('.qa-screens', 'batch1');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  try {
    const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
    const status = resp ? resp.status() : 0;
    const html = await page.content();

    const isComingSoon = /coming\s*soon/i.test(html) && !/card-calculator/.test(html);
    const hasCard = await page.$('.card-calculator');
    const hasH1 = await page.$('h1');

    // results area emptiness BEFORE calculate: find the results column (second grid child)
    const resultsBefore = await page.evaluate(() => {
      const grid = document.querySelector('.card-calculator')?.closest('[class*="grid"]');
      if (!grid) return null;
      const cols = grid.children;
      if (cols.length < 2) return null;
      const resultsCol = cols[cols.length - 1];
      return (resultsCol.textContent || '').trim().length;
    });

    const shotBefore = path.join(outDir, `${slug}-before.png`);
    await page.screenshot({ path: shotBefore, fullPage: false });

    // click Calculate
    let clicked = false;
    for (const sel of ['button:has-text("Calculate")', 'button[type="submit"]']) {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); clicked = true; break; }
    }
    await page.waitForTimeout(800);

    const resultsAfter = await page.evaluate(() => {
      const grid = document.querySelector('.card-calculator')?.closest('[class*="grid"]');
      if (!grid) return null;
      const cols = grid.children;
      if (cols.length < 2) return null;
      const resultsCol = cols[cols.length - 1];
      return (resultsCol.textContent || '').trim().length;
    });

    const shotAfter = path.join(outDir, `${slug}-after.png`);
    await page.screenshot({ path: shotAfter, fullPage: false });

    const verdict = {
      slug,
      url: URL,
      httpStatus: status,
      isComingSoonTemplate: isComingSoon,
      hasCalcCard: !!hasCard,
      hasH1: !!hasH1,
      resultsBeforeLen: resultsBefore,
      resultsAfterLen: resultsAfter,
      gatedCorrectly: resultsBefore === 0 && (resultsAfter || 0) > 0,
      calculateClicked: clicked,
      jsErrors: errors.slice(0, 5),
      screenshots: [shotBefore, shotAfter],
    };
    console.log(JSON.stringify(verdict, null, 1));
  } catch (e) {
    console.log(JSON.stringify({ slug, error: e.message, jsErrors: errors.slice(0, 5) }, null, 1));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
