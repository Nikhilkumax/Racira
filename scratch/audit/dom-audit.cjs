// Render sampled URLs in a real browser and classify the hydrated DOM.
// Usage: node scratch/audit/dom-audit.cjs <baseURL> <urlsFile> <outJson> [perDomain]
// baseURL: e.g. https://racira.com or http://localhost:3003
// urlsFile: list of absolute URLs (may be on baseURL host or elsewhere)
// perDomain: max samples per domain (default 12)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const [baseURL, urlsFile, outJson, perDomainArg] = process.argv.slice(2);
const perDomain = parseInt(perDomainArg || "12", 10);

const all = fs.readFileSync(path.resolve(urlsFile), "utf8")
  .split("\n").map(s => s.trim()).filter(Boolean);

// Keep only URLs under baseURL
const urls = all.filter(u => u.startsWith(baseURL));
const byDomain = {};
for (const u of urls) {
  const parts = u.replace(baseURL + "/", "").split("/");
  const dom = parts[0] || "home";
  (byDomain[dom] = byDomain[dom] || []).push(u);
}

const sample = [];
for (const [dom, list] of Object.entries(byDomain)) {
  const n = Math.min(perDomain, list.length);
  const step = Math.max(1, Math.floor(list.length / n));
  const picked = [];
  for (let i = 0; i < list.length && picked.length < n; i += step) picked.push(list[i]);
  if (!picked.includes(list[list.length - 1]) && picked.length < n) picked.push(list[list.length - 1]);
  sample.push(...picked.map(u => ({ dom, url: u })));
}

const STUB_RE = /(is coming soon|coming soon|coming-soon|we'?re crafting this tool|we'?re polishing)/i;

function classifyDom(page, url) {
  return page.evaluate(({ url, STUB_SRC }) => {
    const stubRe = /(is coming soon|coming soon|coming-soon|we'?re crafting this tool|we'?re polishing)/i;
    const main = document.querySelector("main") || document.body;
    const mainText = (main.innerText || "").trim();
    const stub = stubRe.test(mainText) || stubRe.test(document.title);
    // interactive controls inside main, excluding header/footer nav chrome
    const controls = Array.from(main.querySelectorAll("input, select, textarea, button")).filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false; // hidden
      const inHeader = !!el.closest("header");
      const inFooter = !!el.closest("footer");
      return !inHeader && !inFooter;
    });
    const visibleControls = controls.filter(el => {
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden";
    }).length;
    const imgCount = main.querySelectorAll("img, canvas, video, svg").length;
    return {
      stub,
      mainTextLen: mainText.length,
      visibleControls,
      imgCount,
      url,
    };
  }, { url, STUB_SRC: String(STUB_RE) });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const results = [];
  let idx = 0;
  const CONC = 4;
  async function worker() {
    while (idx < sample.length) {
      const i = idx++;
      const { dom, url } = sample[i];
      const page = await ctx.newPage();
      let status = 0;
      let errors = [];
      page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
      try {
        const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        status = resp ? resp.status() : 0;
        // wait for hydration: a couple of rAF + small delay
        await page.waitForTimeout(2500);
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const c = await classifyDom(page, url);
        let kind;
        if (status !== 200) kind = "error";
        else if (c.stub) kind = "stub";
        else if (c.visibleControls >= 1 && c.mainTextLen > 100) kind = "real";
        else if (c.mainTextLen < 100) kind = "blank";
        else kind = "unknown";
        results.push({ dom, url, status, kind, ...c, err: errors.slice(0, 3) });
      } catch (e) {
        results.push({ dom, url, status, kind: "error", mainTextLen: 0, visibleControls: 0, imgCount: 0, err: [e.message.slice(0, 200)] });
      } finally {
        await page.close().catch(() => {});
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  await browser.close();
  fs.writeFileSync(path.resolve(outJson), JSON.stringify(results, null, 2));
  const byDom = {};
  for (const r of results) (byDom[r.dom] = byDom[r.dom] || []).push(r);
  console.log("DOMAIN | n | real | stub | blank | unknown | error");
  for (const [dom, list] of Object.entries(byDom)) {
    const cnt = k => list.filter(r => r.kind === k).length;
    console.log(`${dom} | ${list.length} | ${cnt("real")} | ${cnt("stub")} | ${cnt("blank")} | ${cnt("unknown")} | ${cnt("error")}`);
  }
  const total = results.length;
  console.log(`\nTOTAL ${total}: real ${results.filter(r => r.kind === "real").length}, stub ${results.filter(r => r.kind === "stub").length}, blank ${results.filter(r => r.kind === "blank").length}, unknown ${results.filter(r => r.kind === "unknown").length}, error ${results.filter(r => r.kind === "error").length}`);
})();
