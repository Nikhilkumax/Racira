// Fetch a deterministic random sample of sitemap URLs per domain; report status codes.
// Usage: node sitemap-status.cjs <baseURL> <urlsFile> <out> [perDomain]
const fs = require("fs");
const path = require("path");

const base = process.argv[2];
const urlsFile = path.resolve(process.argv[3]);
const out = path.resolve(process.argv[4]);
const perDomain = parseInt(process.argv[5] || "20", 10);

const all = fs.readFileSync(urlsFile, "utf8").split("\n").map(s => s.trim().replace("https://racira.com", base)).filter(Boolean).filter(u => u.startsWith(base));
const byDomain = {};
for (const u of all) {
  const parts = u.replace(base + "/", "").split("/");
  const dom = parts[0] || "home";
  (byDomain[dom] = byDomain[dom] || []).push(u);
}

// deterministic pseudo-random sample
let seed = 42;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

const sample = [];
for (const [dom, list] of Object.entries(byDomain)) {
  const n = Math.min(perDomain, list.length);
  const idx = [...list.keys()].sort(() => rnd() - 0.5).slice(0, n);
  sample.push(...idx.map(i => ({ dom, url: list[i] })));
}

(async () => {
  const results = [];
  let idx = 0;
  const CONC = 12;
  async function worker() {
    while (idx < sample.length) {
      const i = idx++;
      const { dom, url } = sample[i];
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 25000);
        const res = await fetch(url, { signal: ctl.signal, redirect: "follow" });
        clearTimeout(t);
        await res.arrayBuffer();
        results.push({ dom, url, status: res.status });
      } catch (e) {
        results.push({ dom, url, status: 0, err: e.message.slice(0, 50) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  console.log(`total sampled: ${results.length}`);
  console.log("status distribution:", JSON.stringify(byStatus));
  const bad = results.filter(r => r.status >= 400 || r.status === 0);
  console.log("non-200:", bad.length);
  for (const b of bad.slice(0, 25)) console.log(`  ${b.status} ${b.dom} ${b.url.replace(base, "")}${b.err ? " " + b.err : ""}`);
})();
