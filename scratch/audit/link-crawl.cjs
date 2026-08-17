// Crawl homepage + 19 category landing pages on LOCAL build, collect all internal links,
// then HTTP-check each unique link. Reports 404s (broken href builders / dead links).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3003";
const CATS = ["calculator","pdf","image","design","colors","typography","photo","video","animator","voice","audio","writing","seo","developers","finance","productivity","games","3d","cad"];
const SEEDS = ["/", ...CATS.map(c => `/${c}`)];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const found = new Map(); // href -> source page
  for (const seed of SEEDS) {
    try {
      await page.goto(BASE + seed, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1500);
      const links = await page.evaluate((base) => {
        const out = [];
        for (const a of document.querySelectorAll("a[href]")) {
          let h = a.getAttribute("href");
          if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("http")) continue;
          if (h.startsWith("/")) out.push(h.split("#")[0].split("?")[0]);
        }
        return [...new Set(out)];
      });
      for (const l of links) if (!found.has(l)) found.set(l, seed);
    } catch (e) {
      console.log("SEED ERROR", seed, e.message.slice(0, 80));
    }
  }
  await browser.close();
  console.log("unique internal links found from seeds:", found.size);

  // HTTP-check all unique links
  const results = [];
  let idx = 0;
  const list = [...found.keys()];
  const CONC = 8;
  async function worker() {
    while (idx < list.length) {
      const i = idx++;
      const href = list[i];
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 20000);
        const res = await fetch(BASE + href, { signal: ctl.signal, redirect: "follow" });
        clearTimeout(t);
        await res.text();
        results.push({ href, status: res.status, from: found.get(href) });
      } catch (e) {
        results.push({ href, status: 0, from: found.get(href), err: e.message.slice(0, 60) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));

  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  console.log("status distribution:", JSON.stringify(byStatus));
  const bad = results.filter(r => r.status >= 400 || r.status === 0);
  console.log("NON-200 links:", bad.length);
  for (const b of bad.slice(0, 60)) console.log(`  ${b.status} ${b.href}   (found on ${b.from})${b.err ? " [" + b.err + "]" : ""}`);
  fs.writeFileSync(path.join(__dirname, "link-crawl-results.json"), JSON.stringify({ results, bad }, null, 2));
})();
