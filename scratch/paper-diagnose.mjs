// Diagnostic: dump the exact group-header texts and the full hydration error.
import { chromium } from "playwright";

const URL = process.env.PAPER_URL ?? "http://localhost:3111/cad/scale-paper-tool";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
await page.locator('[data-testid="in-base"]').waitFor({ timeout: 120_000 });
await page.locator('[data-testid="in-base"]').click();
await page.locator('[role="listbox"]').first().waitFor({ timeout: 15_000 });

const headers = await page.locator('[role="listbox"] [role="presentation"]').allInnerTexts();
console.log("group headers as rendered:");
headers.forEach((h, i) => console.log(`  ${String(i).padStart(2)} ${JSON.stringify(h)}`));

console.log("\noptions in first two groups:");
const first = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
console.log(`  total options: ${first.length}`);
console.log(`  first: ${JSON.stringify(first[0])}`);
console.log(`  last : ${JSON.stringify(first[first.length - 1])}`);

// Which headers are NOT in the expected set?
const expected = ["ISO A", "ISO B", "ISO C", "ANSI/US", "ARCH", "JIS B", "RA/SRA", "PA", "F Series", "Photo Sizes", "Traditional / Imperial"];
console.log("\nexpected headers missing from rendered set:");
for (const e of expected) if (!headers.includes(e)) console.log(`  MISSING: ${JSON.stringify(e)}`);
console.log("\nrendered headers not in expected set:");
for (const h of headers) if (!expected.includes(h)) console.log(`  EXTRA: ${JSON.stringify(h)}`);

console.log("\n--- console / errors ---");
console.log(logs.length ? logs.join("\n\n") : "(none)");

await browser.close();
