import { chromium } from "@playwright/test";
const BASE = process.env.BASE_URL || "http://localhost:3013";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
await page.goto(`${BASE}/cad/scale-calculator`, { waitUntil: "networkidle", timeout: 120_000 });

// Mode b — inch-to-foot
await page.getByTestId("mode-inch-to-foot").click();
await page.waitForTimeout(300);
await page.getByTestId("in-drawn-inches").fill("1/4");
await page.getByTestId("in-real-feet").fill("1");
await page.waitForTimeout(500);
console.log("MODE B HERO:", JSON.stringify(await page.locator(".border-l-4.border-primary").first().innerText().catch(() => "(none)")));
console.log("MODE B MINI:", JSON.stringify(await page.locator(".bg-muted\\/30").first().innerText().catch(() => "(none)")));
console.log("MODE B BADGE:", JSON.stringify(await page.getByTestId("badge-live-ratio").innerText().catch(() => "(none)")));
console.log("MODE B ACTIVE:", JSON.stringify(await page.getByTestId("equivalents-active-row").innerText().catch(() => "(none)")));
await page.screenshot({ path: "scratch/restyle-mode2.png", fullPage: true });

// Mode c — scale factor (no numeric equivalent ratio → equivalents uses ratio)
await page.getByTestId("mode-scale-factor").click();
await page.waitForTimeout(300);
await page.getByTestId("in-scaleVal").fill("50");
await page.getByTestId("in-factor").fill("1.2");
await page.waitForTimeout(500);
console.log("MODE C HERO:", JSON.stringify(await page.locator(".border-l-4.border-primary").first().innerText().catch(() => "(none)")));
console.log("MODE C ACTIVE:", JSON.stringify(await page.getByTestId("equivalents-active-row").innerText().catch(() => "(none)")));

// Mode d — convert (no equivalents card content)
await page.getByTestId("mode-convert").click();
await page.waitForTimeout(500);
console.log("MODE D HERO:", JSON.stringify(await page.locator(".border-l-4.border-primary").first().innerText().catch(() => "(none)")));
console.log("MODE D EMPTY:", JSON.stringify(await page.getByTestId("equivalents-empty").innerText().catch(() => "(none)")));
await page.screenshot({ path: "scratch/restyle-mode4.png", fullPage: true });

// xToOne toggle in mode a
await page.getByTestId("mode-one-to-x").click();
await page.waitForTimeout(300);
await page.getByTestId("in-x").fill("200");
await page.getByTestId("btn-toggle-x").click();
await page.waitForTimeout(500);
console.log("TOGGLED HERO:", JSON.stringify(await page.locator(".border-l-4.border-primary").first().innerText().catch(() => "(none)")));
console.log("TOGGLED MINI:", JSON.stringify(await page.locator(".bg-muted\\/30").first().innerText().catch(() => "(none)")));

await browser.close();
