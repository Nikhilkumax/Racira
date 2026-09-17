/**
 * cad-site-identity.test.ts — regression lock for the CAD domain's
 * site-identity strings and its tool-count consistency.
 *
 * Background (the bugs this guards against):
 *   1. Brand-string overwrite: commit 84247bc1 ("CAD Started") pasted the
 *      dev-session status note "CAD is fixed" into <title>, og:title,
 *      twitter:title and the footer copyright — four locations that all read
 *      from one metadata source, so they all broke identically. The fix
 *      routes every one of them through src/domains/cad/site.ts (CAD_SITE).
 *   2. Count drift: the hero search placeholder counted only live-gated
 *      tools ("Search 67 CAD tools...") while the category badges on the same
 *      page summed to the full catalog (119) and the meta description claimed
 *      the same "119+". RESOLUTION (2026-09-15): the two numbers answer
 *      different questions and each is locked to its own source —
 *        - placeholder/aria-label = LIVE-gated count (onlyLive): the search
 *          box only claims what CategorySearch can actually return (it hides
 *          "soon" entries), so a catalog count there would overpromise.
 *        - category badges + meta description = catalog count (totalCount):
 *          marketing copy describing the roadmap/catalog size.
 *
 * Sentinel strings ("CAD is fixed", TODO, TBD, Lorem ipsum, …) are asserted
 * against every identity surface so a placeholder can never ship there again.
 */
import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:3002";
const ROOT = process.cwd();

// The exact, approved identity strings (must match src/domains/cad/site.ts).
const CAD_TITLE = "Free CAD Tools — Sketch, Draft & Measure | Racira";
const CAD_COPYRIGHT_SUFFIX = "Racira CAD. Built for engineers and designers.";

// Any of these appearing in an identity surface is a regression.
const SENTINELS = ["CAD is fixed", "TODO", "TBD", "Lorem ipsum", "placeholder", "undefined"];

function year(): string {
  return String(new Date().getFullYear());
}

/** Parse the tool count embedded in the registry comment footer ("N+ tools"). */
function registryTotalCount(): number {
  const src = readFileSync(resolve(ROOT, "src/domains/cad/registry.ts"), "utf-8");
  const m = src.match(/export const totalCount = allTools\.length/);
  if (!m) throw new Error("cad-site-identity: totalCount export missing from registry.ts");
  // Count the [\"Name\", \"desc\"] entries — same ground truth the app builds from.
  const entries = src.match(/\[\s*"[^"]+",\s*"[^"]*"\s*\]/g) ?? [];
  if (entries.length < 60) throw new Error(`cad-site-identity: registry parse found only ${entries.length} tools`);
  return entries.length;
}

test.describe("CAD site identity (title / og / twitter / footer)", () => {
  test("/cad: title, og:title, twitter:title and footer copyright match the approved strings exactly", async ({ page }) => {
    await page.goto(`${BASE}/cad`, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(CAD_TITLE);

    const og = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(og).toBe(CAD_TITLE);

    const tw = await page.locator('meta[name="twitter:title"]').getAttribute("content");
    expect(tw).toBe(CAD_TITLE);

    const footerP = page.locator("footer p", { hasText: "Built for engineers and designers." });
    await expect(footerP).toHaveText(`© ${year()} ${CAD_COPYRIGHT_SUFFIX}`);
  });

  test("/cad: no identity surface ever contains a placeholder-like sentinel string", async ({ page }) => {
    await page.goto(`${BASE}/cad`, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    const og = (await page.locator('meta[property="og:title"]').getAttribute("content")) ?? "";
    const tw = (await page.locator('meta[name="twitter:title"]').getAttribute("content")) ?? "";
    const footer = (await page.locator("footer p", { hasText: "Built for" }).textContent()) ?? "";
    for (const [surface, value] of [["title", title], ["og:title", og], ["twitter:title", tw], ["footer", footer]] as const) {
      for (const s of SENTINELS) {
        expect(value, `${surface} must never contain "${s}"`).not.toContain(s);
      }
    }
  });

  test("/cad/two-level-slug pages inherit the fixed brand (category, tool, gdt guide)", async ({ page }) => {
    for (const [route, expected] of [
      ["/cad/2d-drafting", "2D Drafting — Racira CAD"],
      ["/cad/2d-cad-sketch-tool", "2D CAD Sketch Tool — Racira CAD"],
    ] as const) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(expected);
      const footer = page.locator("footer p", { hasText: "Built for engineers and designers." });
      await expect(footer).toHaveText(`© ${year()} ${CAD_COPYRIGHT_SUFFIX}`);
    }
    // GD&T guide page: title comes from the guide's own seoTitle (ends
    // "| Racira") or the CAD_SITE fallback (ends "— Racira CAD") — either way
    // it must carry the real brand, never the bug string.
    await page.goto(`${BASE}/cad/gdt/position`, { waitUntil: "domcontentloaded" });
    const gdtTitle = await page.title();
    expect(gdtTitle).toMatch(/Racira( CAD)?$/);
    expect(gdtTitle).not.toContain("CAD is fixed");
  });

  test("spot-check: other domains' titles carry the real brand, never the CAD bug string", async ({ page }) => {
    for (const route of ["/pdf", "/calculator", "/developers"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const title = await page.title();
      expect(title, `${route} title should carry the Racira brand`).toContain("Racira");
      expect(title, `${route} must never show the CAD bug string`).not.toContain("CAD is fixed");
    }
  });
});

test.describe("CAD tool-count honesty (placeholder=live vs badges/meta=catalog)", () => {
  test("/cad: hero placeholder count === LIVE tool count (non-Soon) — the number the search can actually return", async ({ page }) => {
    await page.goto(`${BASE}/cad`, { waitUntil: "domcontentloaded" });

    // 1. Hero search placeholder (also mirrored into aria-label).
    const placeholder = await page.locator('input[aria-label^="Search"]').getAttribute("placeholder");
    const phMatch = placeholder?.match(/^Search (\d+) CAD tools?\.\.\.$/);
    expect(phMatch, `placeholder "${placeholder}" must embed the tool count`).toBeTruthy();
    const placeholderCount = Number(phMatch![1]);

    // The honesty lock: count non-"Soon" tool cards on the page — exactly what
    // CategorySearch's isSearchable() filter surfaces in search results.
    const soonBadges = await page.locator("main .tool-card span", { hasText: /^Soon$/ }).count();
    const allCards = await page.locator("main .tool-card").count();
    const liveCards = allCards - soonBadges;
    expect(liveCards, "placeholder must equal the number of non-Soon tool cards").toBe(placeholderCount);

    // 2. Sum of the per-category "(N)" badges rendered on the same page.
    const badgeTexts = await page.locator("main section h2").allTextContents();
    let badgeSum = 0;
    for (const t of badgeTexts) {
      const m = t.match(/\((\d+)\)/);
      if (m) badgeSum += Number(m[1]);
    }
    expect(badgeSum, "category badges must exist to sum against").toBeGreaterThan(0);

    // 3. Meta description "N+ free CAD tools...".
    const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const descMatch = desc.match(/^(\d+)\+ free CAD tools in your browser\. No signup required\.$/);
    expect(descMatch, `meta description "${desc}" must embed the tool count`).toBeTruthy();
    const descCount = Number(descMatch![1]);

    const registryCount = registryTotalCount();

    // Anti-drift locks, per source: placeholder=live cards; badges/meta=registry catalog.
    expect(placeholderCount).toBe(liveCards);
    expect(badgeSum).toBe(registryCount);
    expect(descCount).toBe(registryCount);
  });

  test("the meta description count stays truthful to the registry over time", async ({ page }) => {
    await page.goto(`${BASE}/cad`, { waitUntil: "domcontentloaded" });
    const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const claimed = Number(desc.match(/^(\d+)\+/)?.[1] ?? NaN);
    expect(claimed).toBe(registryTotalCount());
  });
});
