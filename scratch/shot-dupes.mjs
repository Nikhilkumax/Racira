// Screenshot evidence for the six ambiguous historical name pairs (#4).
// Opens the baseline combobox filtered to each name and saves the open dropdown.
// Run: node scratch/shot-dupes.mjs   (writes to scratch/dupe-shots/)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const ROUTE = "http://localhost:3002/cad/scale-paper-tool";
const OUT = "scratch/dupe-shots";
mkdirSync(OUT, { recursive: true });

// query → row ids that must be visible before the shot is taken
const CASES = [
  ["Royal", /royal/i, ["Royal", "Royal-19x27"]],
  ["Super Royal", /super royal/i, ["Super-Royal", "Super-Royal-20x28"]],
  ["Imperial", /imperial —/i, ["Imperial", "Imperial-23x31"]],
  ["Cartridge", /cartridge/i, ["Cartridge", "Cartridge-12x26"]],
  ["Post", /post —/i, ["Post", "Post-15x19"]],
  ["Foolscap", /foolscap/i, ["Foolscap", "Foolscap-12x16", "Foolscap-Paper-Cut"]],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(ROUTE, { waitUntil: "load" });

const input = page.locator('[data-testid="in-base"]');
await input.click();

for (const [name, query, mustInclude] of CASES) {
  await input.fill("");
  await input.fill(name);
  const rows = page.locator('[role="listbox"] [role="option"]');
  await rows.first().waitFor();
  for (const id of mustInclude) {
    if (!await page.locator(`[role="listbox"] [data-option-id="${id}"]`).isVisible()) {
      throw new Error(`"${name}" shot: expected row ${id} to be visible`);
    }
  }
  await page.locator(`[role="listbox"] [data-option-id="${mustInclude[0]}"]`).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/${mustInclude[0]}.png`, clip: { x: 60, y: 300, width: 480, height: 440 } });
  console.log(`  saved  ${OUT}/${mustInclude[0]}.png  (${await rows.count()} rows shown for "${name}")`);
}

await browser.close();
console.log("done");
