/**
 * writing-b10.test.ts — verification of Writing batch B10 (the citation
 * engine's reference-list layer: bibliography, endnotes, reference lists,
 * in-text forms and the journal-article formatter).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with a fixed source and asserted against
 *      a value the citation engine pins: the APA book entry, Chicago's note
 *      form, the numbered APA reference line, the in-text forms of one source,
 *      and the journal-article entry with its per-style field checklist.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "bibliography-builder", name: "Bibliography Builder" },
  { slug: "endnote-manager", name: "Endnote Manager" },
  { slug: "reference-list-generator", name: "Reference List Generator" },
  { slug: "in-text-citation-builder", name: "In-Text Citation Builder" },
  { slug: "academic-journal-reference-formatter", name: "Academic Journal Reference Formatter" },
];

const BOOK_APA = "Smith, J. A. (2020). The Craft of Writing. Raven Press.";
const BOOK_CHICAGO =
  "1. See John A. Smith, The Craft of Writing (Boston: Raven Press, 2020).";
const JOURNAL_APA =
  "[1] Smith, J. A. (2021). A study of style. Journal of Writing, 12(3), 45\u201367. https://doi.org/10.1000/xyz";

/** Fill the shared entry editor's book fields for the entry at `suffix`. */
async function fillBook(page: import("@playwright/test").Page, suffix = "") {
  await page.getByTestId(`in-authors${suffix}`).fill("Smith, John A.");
  await page.getByTestId(`in-title${suffix}`).fill("The Craft of Writing");
  await page.getByTestId(`in-publisher${suffix}`).fill("Raven Press");
  await page.getByTestId(`in-place${suffix}`).fill("Boston");
  await page.getByTestId(`in-year${suffix}`).fill("2020");
}

test.describe("Writing B10 — page contract", () => {
  test.setTimeout(60_000);

  for (const { slug, name } of BATCH) {
    test(`${slug} renders with exactly one h1`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(`${BASE}/writing/${slug}`, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);

      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(name);

      const prose = await page.locator('[data-seo-content="tool"]').innerText();
      expect(prose).not.toContain("\\n");
      expect(prose.length).toBeGreaterThan(1200);

      expect(pageErrors, `uncaught errors on /writing/${slug}`).toEqual([]);
    });
  }
});

test.describe("Writing B10 — functional results", () => {
  test.setTimeout(90_000);

  test("bibliography-builder formats an APA book entry, then numbers it", async ({ page }) => {
    await page.goto(`${BASE}/writing/bibliography-builder`, { waitUntil: "networkidle" });

    await fillBook(page, "-1");
    await expect(page.getByTestId("res-count")).toHaveText("1");
    await expect(page.getByTestId("res-bibliography")).toHaveText(BOOK_APA);

    // Chicago keeps the place of publication; the same source reads differently.
    await page.getByTestId("in-style").selectOption("chicago17");
    await expect(page.getByTestId("res-bibliography")).toContainText("Boston: Raven Press");

    // Numbered order prefixes each entry with its rank.
    await page.getByTestId("in-numbered").selectOption("number");
    await expect(page.getByTestId("res-bibliography")).toContainText("[1] Smith, John A.");

    // The JSON export carries the fields, not a rendering.
    await expect(page.getByTestId("res-export")).toContainText('"family": "Smith"');
  });

  test("endnote-manager prints Chicago notes and falls back to reference form for APA", async ({ page }) => {
    await page.goto(`${BASE}/writing/endnote-manager`, { waitUntil: "networkidle" });

    await fillBook(page, "-1");
    await expect(page.getByTestId("res-count")).toHaveText("1");
    await expect(page.getByTestId("res-notes")).toContainText(BOOK_CHICAGO);

    // APA has no note device, so the endnote is the reference entry, with no signal.
    await page.getByTestId("in-style").selectOption("apa7");
    await expect(page.getByTestId("res-notes")).toContainText(BOOK_APA);
    await expect(page.getByTestId("res-notes")).not.toContainText("See John A. Smith");
  });

  test("reference-list-generator prints a numbered list beside matching markers", async ({ page }) => {
    await page.goto(`${BASE}/writing/reference-list-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-authors-1").fill("Smith, John A.");
    await page.getByTestId("in-title-1").fill("A study of style");
    await page.getByTestId("in-container-1").fill("Journal of Writing");
    await page.getByTestId("in-year-1").fill("2021");
    await page.getByTestId("in-volume-1").fill("12");
    await page.getByTestId("in-issue-1").fill("3");
    await page.getByTestId("in-pages-1").fill("45-67");
    await page.getByTestId("in-doi-1").fill("10.1000/xyz");

    await expect(page.getByTestId("res-count")).toHaveText("1");
    await expect(page.getByTestId("res-references")).toHaveText(JOURNAL_APA);
    await expect(page.getByTestId("res-markers")).toContainText("(Smith, 2021)");

    // Unnumbered order drops the [1] prefix and sorts alphabetically.
    await page.getByTestId("in-numbered").selectOption("no");
    await expect(page.getByTestId("res-references")).not.toContainText("[1]");
    await expect(page.getByTestId("res-references")).toContainText("Smith, J. A.");
  });

  test("in-text-citation-builder shows every form of one source across styles", async ({ page }) => {
    await page.goto(`${BASE}/writing/in-text-citation-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-authors").fill("Smith, John A.");
    await page.getByTestId("in-title").fill("The Craft of Writing");
    await page.getByTestId("in-year").fill("2020");
    await page.getByTestId("in-pinpoint").fill("45");

    await expect(page.getByTestId("res-styles")).toHaveText("4");

    // APA carries the year and a pinpoint into both the parenthetical and the narrative.
    await expect(page.getByTestId("res-apa7")).toContainText("(Smith, 2020, p. 45)");
    await expect(page.getByTestId("res-apa7")).toContainText("Smith (2020, p. 45)");

    // MLA keeps the page number and uses the family name alone in a narrative sentence.
    await expect(page.getByTestId("res-mla9")).toContainText("(Smith 45)");

    // Chicago is a note style, so its row shows the note rather than a narrative form.
    await expect(page.getByTestId("res-chicago17")).toContainText("John A. Smith, The Craft of Writing");
  });

  test("academic-journal-reference-formatter builds the article entry and its checklist", async ({ page }) => {
    await page.goto(`${BASE}/writing/academic-journal-reference-formatter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-authors").fill("Smith, John A.");
    await page.getByTestId("in-title").fill("A study of style");
    await page.getByTestId("in-container").fill("Journal of Writing");
    await page.getByTestId("in-year").fill("2021");
    await page.getByTestId("in-volume").fill("12");
    await page.getByTestId("in-issue").fill("3");
    await page.getByTestId("in-pages").fill("45-67");
    await page.getByTestId("in-doi").fill("10.1000/xyz");

    await expect(page.getByTestId("res-entry")).toHaveText(JOURNAL_APA.replace("[1] ", ""));
    await expect(page.getByTestId("res-intext")).toHaveText("(Smith, 2021)");
    await expect(page.getByTestId("res-checklist")).toContainText("APA 7");

    // MLA uses the hyphen page range and its own article-number form.
    await page.getByTestId("in-style").selectOption("mla9");
    await expect(page.getByTestId("res-entry")).toContainText("pp. 45-67");
    await page.getByTestId("in-pages").fill("");
    await page.getByTestId("in-articleNumber").fill("e12345");
    await expect(page.getByTestId("res-entry")).toContainText("Art. no. e12345");
  });
});
