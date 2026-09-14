/**
 * Screenshot the restyled Scale Calculator across the four modes.
 * Run: node scratch/scale-calc-restyle-shots.mjs
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:3012";
const URL = `${BASE}/cad/scale-calculator`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

await page.goto(URL, { waitUntil: "networkidle", timeout: 120_000 });

const shot = async (name) => {
  await page.screenshot({ path: `scratch/restyle-${name}.png`, fullPage: true });
  console.log(`wrote scratch/restyle-${name}.png`);
};

// Mode a — 1:200 with real value solved from scale + ratio
await page.getByTestId("in-scaleVal").fill("50");
await page.getByTestId("in-x").fill("200");
await page.waitForTimeout(400);
await shot("mode1-hero");

// Dump what the hero / mini-stats / equivalents rendered
const heroText = await page.locator(".border-l-4.border-primary").first().innerText().catch(() => "(none)");
console.log("HERO:", JSON.stringify(heroText));
const badge = await page.getByTestId("badge-live-ratio").innerText().catch(() => "(none)");
console.log("BADGE:", JSON.stringify(badge));
const tableRows = await page.getByTestId("equivalents-table").locator("tbody tr").count().catch(() => -1);
console.log("EQUIV ROWS:", tableRows);
const activeRow = await page.getByTestId("equivalents-active-row").innerText().catch(() => "(none)");
console.log("ACTIVE ROW:", JSON.stringify(activeRow));

// Mode a — custom scale (1:75) should append a row
await page.getByTestId("in-x").fill("75");
await page.waitForTimeout(400);
const rowsCustom = await page.getByTestId("equivalents-table").locator("tbody tr").count();
console.log("EQUIV ROWS (custom 1:75):", rowsCustom);

await browser.close();
