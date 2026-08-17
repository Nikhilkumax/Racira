// Phase 2b Scope 1 verification: one tool page per domain, all 4 legal links present + 200.
// Fetches URLs from the local sitemap so it only tests real, discoverable pages.
const { chromium } = require("playwright");

const BASE = "http://localhost:3003";

const DOMAINS = [
  "3d", "animator", "audio", "cad", "calculator", "colors", "developers",
  "design", "finance", "games", "image", "photo", "productivity", "seo",
  "typography", "video", "voice", "writing", "pdf",
];

const LEGAL = [
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms of Service", path: "/terms-of-service" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

async function getSitemapUrls() {
  const idx = await (await fetch(`${BASE}/sitemap.xml`)).text();
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
  const raw = await getSitemapUrls();
  // sitemap URLs point at the production domain; rewrite to localhost for testing
  const all = raw.map((u) => {
    const p = new URL(u);
    return `http://localhost:3003${p.pathname}`;
  });
  const picks = {};
  for (const d of DOMAINS) {
    // prefer a tool-ish URL (deep path, not just the landing) within the domain
    const inDomain = all.filter((u) => new URL(u).pathname.startsWith(`/${d}/`));
    const deep = inDomain.filter((u) => new URL(u).pathname.split("/").filter(Boolean).length >= 2);
    const pool = deep.length ? deep : inDomain;
    picks[d] = pool[0] || `http://localhost:3003/${d}`;
  }

  const browser = await chromium.launch();
  const results = [];
  for (const d of DOMAINS) {
    const url = picks[d];
    const page = await browser.newPage();
    const hrefs = [];
    page.on("response", (r) => {
      if (r.url().includes("/privacy-policy") || r.url().includes("/terms-of-service") ||
          r.url().includes("/about") || r.url().includes("/contact")) hrefs.push(r.status());
    });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      results.push({ domain: d, url, status: "ERR", detail: e.message.slice(0, 60) });
      await page.close();
      continue;
    }
    const text = await page.evaluate(() => document.body.innerText);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("a")].map((a) => ({ href: a.getAttribute("href"), text: a.innerText.trim() }))
    );
    const found = {};
    for (const l of LEGAL) {
      const match = links.find(
        (a) => a.text.toLowerCase().includes(l.label.toLowerCase().split(" ")[0].toLowerCase()) && a.href
      );
      if (match) found[l.label] = match.href;
    }
    // map found hrefs to resolved status via fetch
    const statuses = {};
    for (const [label, href] of Object.entries(found)) {
      const full = href.startsWith("http") ? href : `${BASE}${href}`;
      statuses[label] = await (await fetch(full)).status;
    }
    const missing = LEGAL.filter((l) => !found[l.label]).map((l) => l.label);
    results.push({
      domain: d,
      url,
      status: "OK",
      legalFound: Object.keys(found).length,
      legalMissing: missing,
      statuses,
    });
    await page.close();
  }
  await browser.close();

  let pass = 0, fail = 0;
  for (const r of results) {
    const ok = r.status === "OK" && r.legalFound === 4 &&
      Object.values(r.statuses).every((s) => s === 200);
    if (ok) pass++; else fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${r.domain.padEnd(14)} legal=${r.legalFound}/4 ${JSON.stringify(r.statuses || {})}${r.legalMissing ? " missing=" + r.legalMissing.join(",") : ""}  ${r.url}`);
  }
  console.log(`\nTOTAL: ${pass}/${DOMAINS.length} domains pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
