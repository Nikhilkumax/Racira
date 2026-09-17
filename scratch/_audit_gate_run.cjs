/**
 * Gate runner: visually verifies a slice of the live queue in one browser session.
 * Per page: HTTP status, not-coming-soon, calc card present, Calculate click works,
 * results present after calc, horizontal-overflow CSS check, JS errors, screenshot.
 * Usage: node scratch/_audit_gate_run.cjs <startIndex> <count>
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const start = parseInt(process.argv[2] || '0', 10);
const count = parseInt(process.argv[3] || '20', 10);
const queue = JSON.parse(fs.readFileSync('scratch/_audit_live_queue.json', 'utf8'));
const slice = queue.slice(start, start + count);
const outDir = path.join('.qa-screens', 'batch1');
fs.mkdirSync(outDir, { recursive: true });
const BASE = 'http://localhost:3002';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (let i = 0; i < slice.length; i++) {
    const item = slice[i];
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR/i.test(m.text())) errors.push('console: ' + m.text()); });

    const rec = { idx: start + i, slug: item.slug, comp: item.compName };
    try {
      const resp = await page.goto(`${BASE}/calculator/${item.slug}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      rec.httpStatus = resp ? resp.status() : 0;
      await page.waitForTimeout(600);
      const html = await page.content();
      rec.comingSoon = /coming\s*soon/i.test(html) && !/card-calculator/.test(html);
      rec.hasCard = !!(await page.$('.card-calculator'));
      rec.hasH1 = !!(await page.$('h1'));

      // horizontal overflow check (CSS regression signal)
      rec.horizOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

      // click Calculate if present
      const btn = await page.$('button:has-text("Calculate")');
      if (btn) { await btn.click(); await page.waitForTimeout(500); rec.calcClicked = true; }
      else rec.calcClicked = false;

      const afterText = await page.evaluate(() => (document.querySelector('.card-calculator')?.closest('[class*="grid"]')?.textContent || '').length);
      rec.gridTextLen = afterText;

      const shot = path.join(outDir, `${item.slug}.png`);
      await page.screenshot({ path: shot });
      rec.screenshot = shot;
      rec.jsErrors = errors.slice(0, 3);
      rec.verdict = (!rec.comingSoon && rec.hasCard && rec.httpStatus === 200 && rec.horizOverflow <= 0 && rec.jsErrors.length === 0) ? 'PASS' : 'REVIEW';
    } catch (e) {
      rec.error = e.message;
      rec.verdict = 'ERROR';
    }
    results.push(rec);
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(`scratch/_gate_${start}_${start + slice.length - 1}.json`, JSON.stringify(results, null, 1));
  for (const r of results) {
    console.log(`${r.verdict.padEnd(6)} #${String(r.idx).padStart(3)} ${r.slug} http=${r.httpStatus} card=${r.hasCard} calc=${r.calcClicked} overflow=${r.horizOverflow} errs=${(r.jsErrors || []).length}${r.error ? ' ERR=' + r.error.slice(0, 80) : ''}`);
  }
})();
