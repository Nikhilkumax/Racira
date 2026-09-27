/**
 * colors-hex-input.test.ts — the Colors domain's hex inputs must keep whatever
 * the user is currently typing in the field, and only a complete 3-/6-digit hex
 * may be committed to the colour.
 *
 * Regression covered: culori's parse() (and so isValidColor) also accepts
 * partial forms such as "#9999" (CSS #RGBA), so a hex field that committed on
 * every keystroke normalized a half-typed value into a full colour and pushed
 * it back over the raw text — the "snap-back mid-edit" bug. Deleting characters
 * from the end of a full hex re-completed the value instead of leaving the
 * partial string in the field, and re-committed it as if a full colour had been
 * entered.
 *
 * Two implementations exist in this domain and both are swept here:
 *   - the shared <ColorField> (src/domains/colors/components/color-field.tsx),
 *     used by every tool that shows a hex field beside a native colour swatch.
 *     Each field is paired with its own swatch (the immediately preceding
 *     sibling input[type=color]) so tools that also render per-swatch pickers
 *     elsewhere on the page cannot be misread.
 *   - the 10-Color Palette Generator's own field (#ten-color-base) and inline
 *     picker field (aria-label="Hex colour"), whose commit proxies are each
 *     other.
 *
 * Routes come from src/domains/colors/registry.ts at run time, so every future
 * tool batch is covered the day it goes live. Pages without a hex text input
 * are skipped and reported as such. Note this test interacts with ~160 tool
 * pages and therefore takes minutes against a cold dev server.
 */
import { test, expect, Locator, Page } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:3002";
// Playwright runs from the config directory (project root).
const ROOT = process.cwd();

// ── Resolve live colors tool slugs from the registry (ground truth) ──────────
function resolveColorSlugs(): string[] {
  const regSrc = readFileSync(resolve(ROOT, "src/domains/colors/registry.ts"), "utf-8");
  const slugs: string[] = [];
  for (const line of regSrc.split(/\r?\n/)) {
    if (!/status:\s*"live"/.test(line)) continue;
    const m = line.match(/slug:\s*"([^"]+)"/);
    if (m) slugs.push(m[1]);
  }
  return slugs;
}

const SLUGS = resolveColorSlugs();
if (SLUGS.length < 200) {
  // Guard against a parsing regression silently shrinking the sweep.
  throw new Error(`colors-hex-input: registry parse found only ${SLUGS.length} live tools — refusing to sweep a truncated list`);
}

/**
 * Typing before React has hydrated the page writes only into the DOM, with no
 * handler attached: the text would change but nothing would commit, producing a
 * false failure. React stamps its fiber/props bookkeeping onto hydrated DOM
 * nodes, which makes hydration observable.
 */
async function waitForHydration(page: Page, selector: string): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps") || k.startsWith("__reactFiber"));
    },
    selector,
    { timeout: 20000 }
  );
}

/**
 * Types "#9999CC" into `text`, then backspaces once at a time and asserts that
 * each partial string sits in the field untouched while the committed colour
 * (read through `commitProxy`) only moves when the text is a complete hex.
 */
async function expectHexEditBehaviour(
  page: Page,
  text: Locator,
  commitProxy: Locator,
  label: string
): Promise<void> {
  await text.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Delete");
  await text.pressSequentially("#9999CC", { delay: 15 });
  // The proxy is compared case-insensitively: the inline picker's hex field
  // renders uppercase, the shared field and native swatch do not.
  const proxyValue = () => expect.poll(async () => (await commitProxy.inputValue()).toLowerCase(), { timeout: 3000 });
  // A full hex still commits live, exactly as before.
  await expect(text, `${label}: full hex sits as typed`).toHaveValue("#9999CC", { timeout: 3000 });
  await proxyValue().toBe("#9999cc");
  // First backspace: a 5-digit partial is not a complete hex, so it stays in the
  // field and the committed colour must not move.
  await page.keyboard.press("Backspace");
  await expect(text, `${label}: 5-digit partial stays raw`).toHaveValue("#9999C", { timeout: 3000 });
  await proxyValue().toBe("#9999cc");
  // Second backspace: "#9999" is the classic culori trap (CSS #RGBA). It must
  // stay raw and still commit nothing.
  await page.keyboard.press("Backspace");
  await expect(text, `${label}: #9999 partial stays raw`).toHaveValue("#9999", { timeout: 3000 });
  await proxyValue().toBe("#9999cc");
  // Third backspace: "#999" is a complete 3-digit hex and commits.
  await page.keyboard.press("Backspace");
  await expect(text, `${label}: 3-digit hex sits as typed`).toHaveValue("#999", { timeout: 3000 });
  await proxyValue().toBe("#999999");
}

test.describe("colors hex inputs keep raw partial text", () => {
  test.setTimeout(1_800_000);

  test("backspacing a full hex leaves the partial string and never re-commits mid-edit", async ({ page }) => {
    const failures: string[] = [];
    const checked: string[] = [];
    const skipped: string[] = [];

    for (const slug of SLUGS) {
      const route = `/colors/${slug}`;
      try {
        const resp = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
        const status = resp?.status() ?? 0;
        if (status >= 400) {
          // Not every registry slug has a dedicated page of its own.
          skipped.push(`${slug} (HTTP ${status})`);
          continue;
        }

        const colorCount = await page.locator('input[type="color"]').count();
        const baseCount = await page.locator("#ten-color-base").count();

        if (colorCount > 0) {
          await waitForHydration(page, 'input[type="color"] ~ input.font-mono');
          const textInputs = page.locator('input[type="color"] ~ input.font-mono');
          const total = await textInputs.count();
          const fields = Math.min(total, 3);
          for (let i = 0; i < fields; i++) {
            const text = textInputs.nth(i);
            // The field's own swatch is the input[type=color] immediately before
            // it, so per-swatch pickers rendered elsewhere never get misread.
            const swatch = text.locator('xpath=preceding-sibling::input[@type="color"][1]');
            await expectHexEditBehaviour(page, text, swatch, `${route} field ${i + 1}`);
          }
          if (fields > 0) checked.push(`${slug} (${fields}${total > fields ? ` of ${total}` : ""} field${fields > 1 ? "s" : ""})`);
          else skipped.push(`${slug} (colour swatch, no hex field)`);
          continue;
        }

        if (baseCount > 0) {
          // 10-Color Palette Generator: base field ↔ inline picker field.
          await waitForHydration(page, "#ten-color-base");
          const base = page.locator("#ten-color-base");
          const picker = page.locator('input[aria-label="Hex colour"]');
          await expectHexEditBehaviour(page, base, picker, `${route} base`);
          await expectHexEditBehaviour(page, picker, base, `${route} picker`);
          checked.push(`${slug} (base + picker field)`);
          continue;
        }

        skipped.push(slug);
      } catch (err) {
        failures.push(`${route}: ${(err as Error).message.split("\n")[0]}`);
      }
    }

    console.log(`colors-hex-input: ${checked.length} tools with hex inputs checked, ${skipped.length} routes without a hex input skipped.`);
    console.log(`checked: ${checked.join("; ")}`);
    if (failures.length) console.log(`failures:\n${failures.join("\n")}`);

    expect(failures, `hex-input regressions:\n${failures.join("\n")}`).toEqual([]);
    // Guard against the sweep silently finding almost nothing (e.g. a selector
    // regression) and passing vacuously.
    expect(checked.length, "tools with hex inputs found").toBeGreaterThan(120);
  });
});
