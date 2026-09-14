import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL || "http://localhost:3013";
const browser = await chromium.launch();

for (const scheme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, colorScheme: scheme });
  await page.goto(`${BASE}/cad/scale-calculator`, { waitUntil: "networkidle", timeout: 120_000 });
  // Force the app's own theme via its toggle if present, else rely on colorScheme
  await page.getByTestId("in-scaleVal").fill("50");
  await page.getByTestId("in-x").fill("200");
  await page.waitForTimeout(600);
  await page.screenshot({ path: `scratch/restyle-theme-${scheme}.png`, fullPage: true });
  const heroBg = await page.locator(".border-l-4.border-primary").first().evaluate((el) => getComputedStyle(el).backgroundColor);
  const heroColor = await page.locator(".border-l-4.border-primary").first().locator(".font-mono").first().evaluate((el) => getComputedStyle(el).color);
  const amber = await page.getByTestId("equivalents-active-row").evaluate((el) => {
    const cells = el.querySelectorAll("td");
    return { bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(cells[0]).color };
  });
  console.log(`${scheme.toUpperCase()}  heroBg=${heroBg}  heroText=${heroColor}  amberRow=${JSON.stringify(amber)}`);
  await page.close();
}
await browser.close();
