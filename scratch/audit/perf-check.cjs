// Measure browser-side load timing (DCL, load, networkidle) + responsiveness probe.
// Usage: node perf-check.cjs <baseURL> <url...>
const { chromium } = require("playwright");

const base = process.argv[2];
const urls = process.argv.slice(3).map(u => u.startsWith("http") ? u : base + u);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  for (const u of urls) {
    const page = await ctx.newPage();
    const t0 = Date.now();
    let dcl = -1, load = -1, netidle = -1, errs = 0;
    page.on("console", m => { if (m.type() === "error") errs++; });
    page.on("pageerror", () => errs++);
    page.once("domcontentloaded", () => { dcl = Date.now() - t0; });
    page.once("load", () => { load = Date.now() - t0; });
    try {
      await page.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 });
      dcl = Date.now() - t0;
      try {
        await page.waitForLoadState("load", { timeout: 30000 });
        load = Date.now() - t0;
      } catch {}
      try {
        await page.waitForLoadState("networkidle", { timeout: 30000 });
        netidle = Date.now() - t0;
      } catch {}
      // responsiveness probe: after load, run a quick main-thread task and time it
      await page.waitForTimeout(2000);
      const probe = await page.evaluate(() => {
        const t = performance.now();
        let acc = 0;
        for (let i = 0; i < 2e6; i++) acc += i;
        return { blockedMs: performance.now() - t, acc };
      });
      console.log(`${u.replace(base, "")} -> DCL=${dcl}ms load=${load}ms netidle=${netidle}ms consoleErrors=${errs} probeBlocked=${Math.round(probe.blockedMs)}ms`);
    } catch (e) {
      console.log(`${u.replace(base, "")} -> ERROR ${e.message.split("\n")[0].slice(0, 90)} (DCL=${dcl}ms)`);
    }
    await page.close().catch(() => {});
  }
  await browser.close();
})();
