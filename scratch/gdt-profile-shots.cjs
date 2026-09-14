const { chromium } = require("@playwright/test");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const slug of ["profile-line", "profile-surface"]) {
    for (const width of [1280, 375]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(`http://localhost:3002/cad/gdt/${slug}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const figs = [...document.querySelectorAll("figure")];
        return {
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          figures: figs.length,
          labels: figs.map((f) => f.querySelector("svg")?.getAttribute("aria-label")?.split(":")[0]),
          h1: getComputedStyle(document.querySelector("h1")).fontSize,
          body: getComputedStyle(document.querySelector(".seo-prose p")).fontSize,
        };
      });
      const dir = `scratch/profile-shots/${slug}-${width}`;
      fs.mkdirSync(dir, { recursive: true });
      // Full-page screenshot (single pass; captures every diagram).
      await page.screenshot({ path: `${dir}/full.png`, fullPage: true });
      out.push({ slug, width, ...metrics, errors });
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
