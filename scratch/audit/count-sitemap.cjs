const BASE = "http://localhost:3003";
(async () => {
  const idx = await (await fetch(BASE + "/sitemap.xml")).text();
  const sitemapUrls = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const toolSitemaps = sitemapUrls.filter(u => u.includes("/sitemaps/"));
  console.log("sitemap index entries:", sitemapUrls.length, "| tool sitemaps:", toolSitemaps.length);
  const byDom = {};
  for (const u of toolSitemaps) {
    const local = u.replace("https://racira.com", BASE);
    const xml = await (await fetch(local)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const dom = new URL(local).pathname.split("/")[2]; // /sitemaps/<key>/<cat>/<n>
    byDom[dom] = (byDom[dom] || 0) + locs.length;
  }
  console.log("per-key counts (tool sitemaps only):");
  for (const [d, n] of Object.entries(byDom).sort((a, b) => b[1] - a[1])) console.log("  ", d, n);
  console.log("TOTAL tool URLs:", Object.values(byDom).reduce((a, b) => a + b, 0));

  // also count static sitemap pages
  for (const extra of ["/sitemap-pages.xml", "/sitemap-calculator-categories.xml", "/sitemap-calculator-subcategories.xml"]) {
    const xml = await (await fetch(BASE + extra)).text();
    const n = [...xml.matchAll(/<loc>/g)].length;
    console.log(extra, "->", n, "URLs");
  }
})();
