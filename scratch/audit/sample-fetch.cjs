// Sample sitemap URLs per domain prefix and classify what LIVE renders.
// Usage: node scratch/audit/sample-fetch.cjs
const fs = require("fs");
const path = require("path");

const urls = fs.readFileSync(path.join(__dirname, "all-urls.txt"), "utf8")
  .split("\n").map(s => s.trim()).filter(Boolean);

// group by domain prefix
const byDomain = {};
for (const u of urls) {
  const parts = u.replace("https://racira.com/", "").split("/");
  const dom = parts[0] || "home";
  (byDomain[dom] = byDomain[dom] || []).push(u);
}

// Deterministic sample: take every nth to spread across the file, 24 max per domain (or all if fewer)
const sample = [];
for (const [dom, list] of Object.entries(byDomain)) {
  const n = Math.min(24, list.length);
  const step = Math.max(1, Math.floor(list.length / n));
  const picked = [];
  for (let i = 0; i < list.length && picked.length < n; i += step) picked.push(list[i]);
  // ensure last item included
  if (!picked.includes(list[list.length - 1]) && picked.length < n) picked.push(list[list.length - 1]);
  sample.push(...picked.map(u => ({ dom, url: u })));
}

const STUB_PATTERNS = [/is coming soon/i, /coming soon/i, /coming-soon/i, /we.?re crafting this tool/i, /we.?re polishing/i, /under construction/i];
const REAL_MARKERS = [/<form/i, /<input/i, /<button/i, /<select/i, /<textarea/i, /Calculate/i, /Convert/i, /Generate/i];

function classify(html, status) {
  if (status !== 200) return { kind: "error", detail: `HTTP ${status}` };
  const body = html.slice(0, 200000);
  const stub = STUB_PATTERNS.some(r => r.test(body));
  // A real tool page will have interactive controls; stub pages won't.
  const interactive = REAL_MARKERS.some(r => r.test(body));
  if (stub) return { kind: "stub", detail: "contains coming-soon marker" };
  if (interactive) return { kind: "real", detail: "interactive controls present" };
  return { kind: "unknown", detail: `len=${html.length}` };
}

(async () => {
  const results = [];
  let idx = 0;
  const CONC = 10;
  async function worker() {
    while (idx < sample.length) {
      const i = idx++;
      const { dom, url } = sample[i];
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 20000);
        const res = await fetch(url, { signal: ctl.signal, redirect: "follow" });
        clearTimeout(t);
        const html = await res.text();
        const c = classify(html, res.status);
        results.push({ dom, url, status: res.status, ...c });
      } catch (e) {
        results.push({ dom, url, status: 0, kind: "error", detail: e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  fs.writeFileSync(path.join(__dirname, "sample-results.json"), JSON.stringify(results, null, 2));

  // summary per domain
  const byDom = {};
  for (const r of results) {
    (byDom[r.dom] = byDom[r.dom] || []).push(r);
  }
  console.log("DOMAIN | sampled | real | stub | error | unknown");
  for (const [dom, list] of Object.entries(byDom)) {
    const cnt = k => list.filter(r => r.kind === k).length;
    console.log(`${dom} | ${list.length} | ${cnt("real")} | ${cnt("stub")} | ${cnt("error")} | ${cnt("unknown")}`);
  }
  console.log("\nTOTAL:", results.length, "real:", results.filter(r => r.kind === "real").length,
    "stub:", results.filter(r => r.kind === "stub").length,
    "error:", results.filter(r => r.kind === "error").length,
    "unknown:", results.filter(r => r.kind === "unknown").length);
})();
