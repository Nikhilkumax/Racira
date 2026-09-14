// Browser check for the Scale Paper Tool combobox (Bug 2 grouping + Bug 3 filtering).
// Run against a live dev server:  node scratch/paper-combobox-check.mjs
import { chromium } from "playwright";

const URL = process.env.PAPER_URL ?? "http://localhost:3111/cad/scale-paper-tool";
const SHOT = "scratch/_paper-combobox.png";

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? "  ok   " : "  FAIL "} ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 120_000 });
const base = page.locator('[data-testid="in-base"]');
await base.waitFor({ timeout: 120_000 });

// ── initial state ───────────────────────────────────────────────────────────
console.log("\n[initial]");
check(
  (await base.inputValue()) === "A3 — 297 × 420 mm",
  `baseline input shows canonical label (got "${await base.inputValue()}")`,
);
check(
  (await page.locator('[data-testid="in-comp"]').inputValue()) === "A4 — 210 × 297 mm",
  "comparison input shows canonical label",
);

// ── open: groups render as headers ──────────────────────────────────────────
// The route is dev-compiled on demand and React hydrates after the HTML lands,
// so retry the click until the listbox actually opens.
const listbox = page.locator('[role="listbox"]').first();
async function openList() {
  await page.waitForLoadState("load");
  for (let i = 0; i < 40; i++) {
    await base.click();
    if (await listbox.isVisible().catch(() => false)) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

console.log("\n[grouping]");
check(await openList(), "combobox opens on click");

const allOptions = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
const rawHeaders = await page.locator('[role="listbox"] [role="presentation"]').allInnerTexts();
// Group headers are uppercased by CSS, so compare case-insensitively.
const headers = rawHeaders.map((h) => h.trim().toLowerCase());
console.log(`        ${allOptions.length} options across ${headers.length} group headers`);
// 125 catalog sizes + the synthetic "Custom size" row.
check(allOptions.length === 126, `all 126 options render (125 catalog + Custom) — got ${allOptions.length}`);
check(headers.length === 12, `12 group headers render (got ${headers.length})`);
for (const h of ["ISO A", "ISO B", "ISO C", "ANSI/US", "ARCH", "JIS B", "RA/SRA", "PA", "F Series", "Photo Sizes", "Traditional / Imperial", "Custom"]) {
  check(headers.includes(h.toLowerCase()), `group header present: ${h}`);
}

// every option must be unique — the core dedupe requirement
const uniq = new Set(allOptions);
check(uniq.size === allOptions.length, `no duplicate option labels (${uniq.size} unique / ${allOptions.length})`);

// ── filtering ───────────────────────────────────────────────────────────────
console.log("\n[filtering]");
await base.fill("letter");
let opts = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
console.log(`        "letter" -> ${opts.length}: ${opts.join(" | ")}`);
check(opts.some((o) => o.startsWith("Letter (ANSI A)")), 'typing "letter" surfaces Letter (ANSI A)');
check(!opts.some((o) => o.startsWith("A4 ")), 'typing "letter" filters out A4');
check(opts.length < allOptions.length, "result set actually shrank");

await base.fill("a4");
opts = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
console.log(`        "a4" -> ${opts.length}: ${opts.join(" | ")}`);
check(opts.some((o) => o.startsWith("A4 ")), 'typing "a4" surfaces A4');

await base.fill("ledger");
opts = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
console.log(`        "ledger" -> ${opts.length}: ${opts.join(" | ")}`);
check(opts.length === 1 && opts[0].startsWith("Tabloid / Ledger (ANSI B)"), "Tabloid/Ledger is a single merged row");

await base.fill("210");
opts = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
check(opts.some((o) => o.startsWith("A4 ")), 'numeric search "210" surfaces A4');

await base.fill("zzzz");
opts = await page.locator('[role="listbox"] [role="option"]').allInnerTexts();
check(opts.length === 0, "no-match query yields zero options");
const empty = await page.locator('[role="listbox"]').innerText();
check(empty.includes("No paper size matches"), "no-match state shows an explanatory message");

// ── selecting by click ──────────────────────────────────────────────────────
console.log("\n[selection]");
await base.fill("arch d");
await page.locator('[role="listbox"] [role="option"]').first().click();
check((await base.inputValue()).startsWith("ARCH D"), `clicking a result commits it (got "${await base.inputValue()}")`);
check((await page.locator('[role="listbox"]').count()) === 0, "list closes after selection");
const widthRes = await page.locator('[data-testid="res-width-pct"]').innerText();
check(widthRes.length > 0, `stats recomputed for new baseline (${widthRes})`);

// ── keyboard ────────────────────────────────────────────────────────────────
console.log("\n[keyboard]");
await base.click();
await base.fill("crown");
await page.keyboard.press("ArrowDown");
await page.keyboard.press("ArrowDown");
await page.keyboard.press("Enter");
const kb = await base.inputValue();
check(kb.startsWith("Crown") || kb.startsWith("Double Crown") || kb.startsWith("Quad Crown"),
  `ArrowDown+Enter selects from the filtered list (got "${kb}")`);

// ── custom size ─────────────────────────────────────────────────────────────
console.log("\n[custom size]");
const comp = page.locator('[data-testid="in-comp"]');
await comp.click();
await comp.fill("custom");
await page.locator('[role="listbox"] [data-option-id="custom"]').click();
check((await comp.inputValue()).startsWith("Custom size"), `comparison switched to Custom (got "${await comp.inputValue()}")`);
const cw = page.locator('[data-testid="in-comp-w"]');
const ch = page.locator('[data-testid="in-comp-h"]');
check(await cw.isVisible(), "width field appears for the custom side");
await cw.fill("500");
await ch.fill("700");
check((await comp.inputValue()) === "Custom size — 500 × 700 mm", `typed dims feed the label (got "${await comp.inputValue()}")`);

// ── escape ──────────────────────────────────────────────────────────────────
await base.click();
await page.keyboard.press("Escape");
check((await page.locator('[role="listbox"]').count()) === 0, "Escape closes the list");

await page.screenshot({ path: SHOT, fullPage: false });
check(errors.length === 0, `no uncaught page errors${errors.length ? `: ${errors.join("; ")}` : ""}`);

await browser.close();
console.log(failures ? `\n${failures} FAILURE(S)\n` : "\nall browser checks passed\n");
process.exit(failures ? 1 : 0);
