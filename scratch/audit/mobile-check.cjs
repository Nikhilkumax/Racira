// Mobile viewport check: load pages at 375x667, detect horizontal overflow and CLS-ish layout issues.
// Usage: node mobile-check.cjs <baseURL> <url...>
const { chromium } = require("playwright");

const base = process.argv[2];
const urls = process.argv.slice(3).map(u => u.startsWith("http") ? u : base + u);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });
  for (const u of urls) {
    const page = await ctx.newPage();
    try {
      await page.goto(u, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1800);
      const m = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth > window.innerWidth + 1;
        let worst = null;
        if (overflow) {
          const els = [...document.querySelectorAll("body *")];
          for (const el of els) {
            const r = el.getBoundingClientRect();
            if (r.right > window.innerWidth + 1 || r.left < -1) {
              const cls = el.className && typeof el.className === "string" ? el.className.slice(0, 60) : el.tagName;
              if (!worst) worst = { tag: el.tagName, cls, right: Math.round(r.right), w: window.innerWidth };
            }
          }
        }
        return { overflow, innerWidth: window.innerWidth, scrollWidth: doc.scrollWidth, worst };
      });
      console.log(`${u.replace(base, "")} -> overflow=${m.overflow} scrollWidth=${m.scrollWidth} viewport=${m.innerWidth}${m.worst ? ` offender=<${m.worst.tag} class="${m.worst.cls}" right=${m.worst.right}>` : ""}`);
    } catch (e) {
      console.log(`${u.replace(base, "")} -> ERROR ${e.message.split("\n")[0].slice(0, 80)}`);
    }
    await page.close().catch(() => {});
  }
  await browser.close();
})();
