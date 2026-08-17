// Read-only production error sweep: render tool pages per domain, capture console/page errors + failed requests + error overlays.
const { chromium } = require("playwright");

const PROD = "https://racira.com";
const DOMAINS = [
  "3d", "animator", "audio", "cad", "calculator", "colors", "developers",
  "design", "finance", "games", "image", "photo", "productivity", "seo",
  "typography", "video", "voice", "writing", "pdf",
];

async function getSitemapUrls() {
  const idx = await (await fetch(`${PROD}/sitemap.xml`)).text();
  const sitemaps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set();
  for (const s of sitemaps) {
    try {
      const xml = await (await fetch(s)).text();
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
    } catch (e) { /* skip */ }
  }
  return [...urls];
}

(async () => {
  const all = await getSitemapUrls();
  const picks = {};
  for (const d of DOMAINS) {
    const inDomain = all.filter((u) => new URL(u).pathname.startsWith(`/${d}/`));
    const deep = inDomain.filter((u) => new URL(u).pathname.split("/").filter(Boolean).length >= 2);
    const pool = deep.length ? deep : inDomain;
    picks[d] = pool.slice(0, 8); // up to 8 tool pages per domain
  }

  const browser = await chromium.launch();
  let total = 0, errors = 0;
  for (const d of DOMAINS) {
    for (const url of picks[d] || []) {
      const page = await browser.newPage();
      const consoleErrs = [];
      const pageErrs = [];
      const failed = [];
      page.on("console", (m) => { if (m.type() === "error") consoleErrs.push(m.text().slice(0, 150)); });
      page.on("pageerror", (e) => pageErrs.push(String(e).slice(0, 200)));
      page.on("requestfailed", (r) => failed.push(`${r.url().slice(0, 90)} ${r.failure()?.errorText}`));
      let status = 0;
      try {
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
        status = resp ? resp.status() : 0;
        await page.waitForTimeout(1500);
      } catch (e) { pageErrs.push("GOTO: " + e.message.slice(0, 120)); }
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
      const overlay = /Application error|client-side exception|Internal Server Error|Something went wrong|Error:/i.test(bodyText) ? "OVERLAY" : "";
      total++;
      const problems = [...consoleErrs.map((t) => `console: ${t}`), ...pageErrs.map((t) => `page: ${t}`), ...failed.map((t) => `net: ${t}`)];
      if (status !== 200 || overlay || problems.length) {
        errors++;
        console.log(`\n!! ${url}`);
        console.log(`   status=${status} ${overlay}`);
        for (const p of problems.slice(0, 5)) console.log(`   ${p}`);
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(`\nSWEEP: ${total} tool pages rendered, ${errors} with problems`);
})();
