import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3002/cad/schematic-symbol-library-browser', { waitUntil: 'networkidle' });
const out = await page.evaluate(() => {
  const prose = document.querySelector('.seo-prose');
  if (!prose) return 'NO .seo-prose';
  const h2s = Array.from(prose.querySelectorAll('h2')).map((h) => JSON.stringify(h.textContent.trim()));
  const h3s = Array.from(prose.querySelectorAll('h3')).map((h) => JSON.stringify(h.textContent.trim()));
  return { h2s, h3s: h3s.slice(0, 6), proseClass: prose.className, proseHtmlHead: prose.innerHTML.slice(0, 300) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
