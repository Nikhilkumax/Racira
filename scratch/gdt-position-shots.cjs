/* One-off visual check: /cad/gdt/position at 375px and 1440px with the new
 * diagrams + enlarged text. Screenshots to scratch/. Not part of the suite. */
const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  for (const width of [375, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("http://localhost:3002/cad/gdt/position", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `scratch/gdt-position-${width}.png`, fullPage: true });
    const metrics = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const p = document.querySelector("article > p");
      const figs = [...document.querySelectorAll("figure")].map((f) => {
        const svg = f.querySelector("svg");
        const r = svg.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1Size: h1 ? getComputedStyle(h1).fontSize : null,
        bodySize: p ? getComputedStyle(p).fontSize : null,
        figs,
        cssLoaded: getComputedStyle(document.body).backgroundColor !== "rgba(0, 0, 0, 0)",
      };
    });
    console.log(width, "px:", JSON.stringify(metrics), "consoleErrors:", errors.length);
    await page.close();
  }
  await browser.close();
})();