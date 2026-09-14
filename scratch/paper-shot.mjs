// Capture screenshots of the new paper-size combobox for review.
import { chromium } from "playwright";

const URL = process.env.PAPER_URL ?? "http://localhost:3111/cad/scale-paper-tool";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: "load", timeout: 120_000 });

const base = page.locator('[data-testid="in-base"]');
await base.waitFor({ timeout: 120_000 });

async function openList() {
  for (let i = 0; i < 40; i++) {
    await base.click();
    if (await page.locator('[role="listbox"]').first().isVisible().catch(() => false)) return;
    await page.waitForTimeout(1000);
  }
  throw new Error("listbox never opened");
}

// 1. full open list showing group headers
await openList();
await page.screenshot({ path: "scratch/_paper-open.png" });

// 2. filtered view
await base.fill("letter");
await page.waitForTimeout(300);
await page.screenshot({ path: "scratch/_paper-filtered.png" });

// 3. the Custom group: pick it as the comparison paper and type a size
const comp = page.locator('[data-testid="in-comp"]');
await comp.click();
await comp.fill("custom");
await page.locator('[role="listbox"] [data-option-id="custom"]').click();
await page.locator('[data-testid="in-comp-w"]').fill("500");
await page.locator('[data-testid="in-comp-h"]').fill("700");
await page.waitForTimeout(300);
await page.screenshot({ path: "scratch/_paper-custom.png" });

await browser.close();
console.log("wrote scratch/_paper-open.png, _paper-filtered.png and _paper-custom.png");
