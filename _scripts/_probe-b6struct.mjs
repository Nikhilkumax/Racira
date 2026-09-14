import { chromium } from 'playwright';

const slugs = [
  'line-weight-manager',
  'scale-bar-tool',
  'cad-grid-planner',
  'material-cutting-reference',
  'tooling-library-browser',
  'g-code-reference-viewer',
  'machining-operation-selector',
  'chip-load-calculator',
  'cnc-material-thickness-guide',
  'laser-cutter-power-reference',
  'waterjet-cutting-reference',
];

const browser = await chromium.launch();
let failures = 0;

for (const slug of slugs) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:3002/cad/${slug}`, { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => {
    const prose = document.querySelector('.seo-prose');
    if (!prose) return { missing: true };
    const h2s = Array.from(prose.querySelectorAll('h2')).map((h) => h.textContent.trim());
    const sections = Array.from(prose.querySelectorAll('.seo-prose > div'));
    const faq = h2s.map((t) => t.toLowerCase()).findIndex((t) => t.includes('faq') || t.includes('frequently asked'));
    const h3s = Array.from(prose.querySelectorAll('h3')).map((h) => h.textContent.trim());
    const clone = prose.cloneNode(true);
    clone.querySelectorAll('h2, h3').forEach((h) => h.remove());
    const wordCount = clone.textContent.replace(/\s+/g, ' ').trim().split(' ').filter((w) => w.length > 0).length;
    const dupFaq = h3s.filter((q, i) => h3s.indexOf(q) !== i);
    return {
      missing: false,
      h2Count: h2s.length,
      faqIndex: faq,
      h3Count: h3s.length,
      h3DepthOk: sections.every((s, i) => {
        if (i !== faq) return true;
        return Array.from(s.querySelectorAll(':scope > h3')).length === s.querySelectorAll('h3').length;
      }),
      words: wordCount,
      dupFaq,
    };
  });

  let ok = true;
  const problems = [];
  if (info.missing) { ok = false; problems.push('NO .seo-prose'); }
  else {
    if (info.h2Count !== 5) { ok = false; problems.push(`h2 count ${info.h2Count}`); }
    if (info.faqIndex !== 4) { ok = false; problems.push(`FAQ index ${info.faqIndex}`); }
    if (info.h3Count < 3) { ok = false; problems.push(`h3 count ${info.h3Count}`); }
    if (!info.h3DepthOk) { ok = false; problems.push('h3 not direct section children'); }
    if (info.words < 500 || info.words > 1000) { ok = false; problems.push(`words ${info.words}`); }
    if (info.dupFaq.length > 0) { ok = false; problems.push(`dup FAQ: ${info.dupFaq.join(' | ')}`); }
    if (errors.length > 0) { ok = false; problems.push(`pageerrors: ${errors.join(' | ')}`); }
  }
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${slug}${problems.length ? ' — ' + problems.join('; ') : ''}${ok ? ` (${info.words}w)` : ''}`);
  await page.close();
}

await browser.close();
console.log(failures === 0 ? 'ALL 11 PASS' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);