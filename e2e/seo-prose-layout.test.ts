/**
 * seo-prose-layout.test.ts — layout guard for the shared `.seo-prose`
 * SEO-content typography.
 *
 * History: the CAD SEO section rendered every paragraph as a `<div>` and
 * wrapped every section in another `<div>`. Neither matched the element
 * selectors in `.seo-prose`, so paragraphs ran together with no gap and the
 * container rhythm never reached the headings — the Scale Calculator
 * reference (`.prose-finance` + `space-y-6`) had clear spacing throughout.
 *
 * The fix is a contract, not a one-off patch, and this test pins it:
 *   1. every paragraph is its own block element — never a wrapper `<div>`;
 *   2. headings/paragraphs stay DIRECT children of `.seo-prose`, because
 *      `space-y-6` only applies between direct children;
 *   3. the resulting rhythm equals the reference section's rhythm exactly
 *      (24px between blocks, 32px above the opening heading).
 *
 * Rule 2 is the subtle one: a per-section wrapper silently collapses every
 * gap inside it, so the test asserts the *measured* gaps rather than trusting
 * the class name.
 */
import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:3002";

/** The reference section the CAD spacing must match. */
const REFERENCE = "/calculator/scale-calculator";
/** CAD tool pages rendering through the shared CAD SeoContent component. */
const CAD_PAGES = ["/cad/scale-bar-tool", "/cad/scale-paper-tool", "/cad/line-weight-manager"];

/** 24px = `space-y-6`; 32px = `mt-8` on the opening heading. */
const BLOCK_GAP_PX = 24;
const FIRST_HEADING_TOP_PX = 32;

type ProseShape = {
  tag: string;
  gapBefore: number | null;
  marginTop: string;
};

/** Measure the direct children of a prose container: tag, measured gap from
 *  the previous sibling, and computed top margin. */
async function proseShape(page: Page, selector: string): Promise<ProseShape[]> {
  return page.evaluate((sel) => {
    const container = document.querySelector(sel);
    if (!container) throw new Error(`no ${sel} on the page`);
    const kids = [...container.children] as HTMLElement[];
    return kids.map((el, i) => {
      const prev = kids[i - 1];
      return {
        tag: el.tagName,
        gapBefore: prev
          ? Math.round(el.getBoundingClientRect().top - prev.getBoundingClientRect().bottom)
          : null,
        marginTop: getComputedStyle(el).marginTop,
      };
    });
  }, selector);
}

test.describe("SEO prose layout", () => {
  test.setTimeout(120_000);

  test("every SEO paragraph is its own <p> — no wrapper divs, no run-together copy", async ({
    page,
  }) => {
    for (const path of CAD_PAGES) {
      await page.goto(`${BASE}${path}`);
      const wrapperDivs = await page.locator(".seo-prose > div").count();
      const paragraphs = await page.locator(".seo-prose > p").count();
      const headings = await page.locator(".seo-prose > h2, .seo-prose > h3").count();

      // `.seo-prose p` styling (margin, leading, colour) is an element
      // selector — a div wrapper skips it and adjacent blocks collapse.
      expect(wrapperDivs, `${path} must not wrap its SEO blocks in <div>`).toBe(0);
      expect(paragraphs, `${path} should render per-paragraph <p> blocks`).toBeGreaterThan(3);
      expect(headings, `${path} should render section headings`).toBeGreaterThan(3);
    }
  });

  test("adjacent paragraphs are separated, not run together", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`);
    const shape = await proseShape(page, ".seo-prose");
    const paragraphs = shape
      .map((block, i) => ({ ...block, i }))
      .filter((block) => block.tag === "P");

    // The two paragraphs under the opening heading were the visible symptom:
    // both present, both separate elements, with a real gap between them.
    const stacked = paragraphs.filter((p) => shape[p.i - 1]?.tag === "P");
    expect(stacked.length, "the section should have stacked paragraphs").toBeGreaterThan(0);
    for (const p of stacked) expect(p.gapBefore).toBeGreaterThan(0);
  });

  test("block rhythm matches the Scale Calculator reference exactly", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`);
    const ours = await proseShape(page, ".seo-prose");

    await page.goto(`${BASE}${REFERENCE}`);
    const reference = await proseShape(page, ".prose-finance");

    const gaps = (shape: ProseShape[]) => shape.map((b) => b.gapBefore).filter((g) => g !== null);
    const referenceGaps = gaps(reference);

    // Sanity-check the reference itself before comparing against it.
    expect(referenceGaps.length).toBeGreaterThan(3);
    expect(new Set(referenceGaps)).toEqual(new Set([BLOCK_GAP_PX]));
    expect(reference[0].marginTop).toBe(`${FIRST_HEADING_TOP_PX}px`);

    // Every block after the first gets the same uniform gap; the opening
    // heading keeps the reference's larger top margin.
    expect(new Set(gaps(ours))).toEqual(new Set([BLOCK_GAP_PX]));
    expect(ours[0].tag).toBe("H2");
    expect(ours[0].marginTop).toBe(`${FIRST_HEADING_TOP_PX}px`);
  });

  test("no SEO block is nested inside a paragraph (invalid HTML would break the layout)", async ({
    page,
  }) => {
    for (const path of CAD_PAGES) {
      await page.goto(`${BASE}${path}`);
      const nested = await page
        .locator(".seo-prose p div, .seo-prose p p, .seo-prose p h2, .seo-prose p h3, .seo-prose p ol, .seo-prose p ul")
        .count();
      expect(nested, `${path} must not nest block elements inside <p>`).toBe(0);
    }
  });
});
