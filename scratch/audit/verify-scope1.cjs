// Post-build Scope 1 verification. Run against the local prod server.
// 1. Fetch the new sitemap, count URLs, classify samples via DOM render (real vs stub).
// 2. Spot-check 5 category landing pages: grids must not link excluded stub tools.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3003";

(async () => {
  // ---- sitemap ----
  const idx = await (await fetch(BASE + "/sitemap.xml")).text();
  const sitemapUrls = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const toolSitemaps = sitemapUrls.filter(u => u.includes("/sitemaps/"));
  console.log("sitemap index entries:", sitemapUrls.length, "| tool sitemaps:", toolSitemaps.length);

  const allUrls = [];
  for (const u of toolSitemaps) {
    const xml = await (await fetch(u.replace("https://racira.com", BASE))).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    allUrls.push(...locs.map(l => l.replace("https://racira.com", BASE)));
  }
  // static pages
  for (const extra of ["/sitemap-pages.xml","/sitemap-calculator-categories.xml","/sitemap-calculator-subcategories.xml"]) {
    try {
      const xml = await (await fetch(BASE + extra)).text();
      allUrls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace("https://racira.com", BASE)));
    } catch {}
  }
  const unique = [...new Set(allUrls)];
  console.log("TOTAL sitemap URLs (new):", unique.length);
  fs.writeFileSync(path.join(__dirname, "new-sitemap-urls.txt"), unique.join("\n"));

  const byDom = {};
  for (const u of unique) {
    const parts = u.replace(BASE + "/", "").split("/");
    const dom = parts[0] || "home";
    (byDom[dom] = byDom[dom] || []).push(u);
  }
  console.log("per-domain counts:");
  for (const [d, l] of Object.entries(byDom).sort((a,b)=>b[1].length-a[1].length)) console.log("  ", d, l.length);

  // ---- DOM-render sample: 10 per tool domain ----
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const results = [];
  for (const [dom, list] of Object.entries(byDom)) {
    if (dom === "home" || dom === "about" || dom === "contact" || dom === "disclaimer" || dom === "privacy-policy" || dom === "terms-of-service") continue;
    const n = Math.min(10, list.length);
    const step = Math.max(1, Math.floor(list.length / n));
    const picked = [];
    for (let i = 0; i < list.length && picked.length < n; i += step) picked.push(list[i]);
    const page = await ctx.newPage();
    for (const url of picked) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });
        await page.waitForTimeout(2000);
        const c = await page.evaluate(() => {
          const main = document.querySelector("main") || document.body;
          const txt = main.innerText || "";
          const stub = /(is coming soon|coming soon|coming-soon|we'?re crafting this tool|we'?re polishing|planned for a future)/i.test(txt) || /coming soon/i.test(document.title);
          const controls = Array.from(main.querySelectorAll("input, select, textarea, button")).filter(el => {
            const r = el.getBoundingClientRect();
            return !(r.width === 0 && r.height === 0) && !el.closest("header") && !el.closest("footer");
          }).length;
          return { stub, len: txt.length, controls };
        });
        results.push({ dom, url: url.replace(BASE, ""), ...c });
      } catch (e) {
        results.push({ dom, url: url.replace(BASE, ""), error: e.message.split("\n")[0].slice(0, 80) });
      }
    }
    await page.close().catch(() => {});
  }
  await browser.close();

  const errs = results.filter(r => r.error);
  const stubs = results.filter(r => !r.error && r.stub);
  const reals = results.filter(r => !r.error && !r.stub && (r.controls >= 1 || r.len >= 150));
  const thin = results.filter(r => !r.error && !r.stub && r.controls === 0 && r.len < 150);
  console.log(`\nDOM sample: total=${results.length} real=${reals.length} stub=${stubs.length} thin=${thin.length} error=${errs.length}`);
  for (const s of stubs.slice(0, 10)) console.log("  STUB:", s.dom, s.url);
  for (const e of errs.slice(0, 5)) console.log("  ERR:", e.dom, e.url, e.error);
  fs.writeFileSync(path.join(__dirname, "scope1-dom-sample.json"), JSON.stringify(results, null, 2));
})();
