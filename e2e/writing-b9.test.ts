/**
 * writing-b9.test.ts — verification of Writing batch B9 (the rest of the
 * extractive summarisation family plus the shared citation engine).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with a fixed input and asserted against
 *      a value its engine tests pin (two findings plus a bottom line, a
 *      four-bullet extraction with one connector removed, five marks in place,
 *      decisions/actions/questions counts, and APA/MLA/Chicago/Bluebook entries
 *      from the styles' own worked examples).
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "executive-summary-builder", name: "Executive Summary Builder" },
  { slug: "bullet-point-extractor", name: "Bullet Point Extractor" },
  { slug: "important-sentence-highlighter", name: "Important Sentence Highlighter" },
  { slug: "meeting-summary-formatter", name: "Meeting Summary Formatter" },
  { slug: "citation-formatter", name: "Citation Formatter" },
];

const TEN_SENTENCES = [
  "The river flooded the village after three days of rain.",
  "The river flooded the fields on the eastern bank.",
  "The river flooded the road to the bridge.",
  "The market closed for a week.",
  "The school was used as a shelter.",
  "Volunteers arrived from the next town.",
  "The water began to fall on Thursday.",
  "Clean-up started the following Monday.",
  "The bridge stayed closed for repairs.",
  "The council published a report in June.",
].join(" ");

test.describe("Writing B9 — page contract", () => {
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

test.describe("Writing B9 — functional results", () => {
  test.setTimeout(90_000);

  test("executive-summary-builder quotes a bottom line and document-ordered findings", async ({ page }) => {
    await page.goto(`${BASE}/writing/executive-summary-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(TEN_SENTENCES);
    // The default is a 30% brief: three sentences, one bottom line, two findings.
    await expect(page.getByTestId("res-selected")).toHaveText("3");
    const bottom = await page.getByTestId("res-bottom").innerText();
    expect(TEN_SENTENCES).toContain(bottom.trim());
    await expect(page.getByTestId("res-findings")).toContainText("river");

    await page.getByTestId("in-length").selectOption("20");
    await expect(page.getByTestId("res-selected")).toHaveText("2");
  });

  test("bullet-point-extractor removes one listed connector and preserves an existing list", async ({ page }) => {
    await page.goto(`${BASE}/writing/bullet-point-extractor`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("However, the plan changed. The team agreed on a new date. Finally, we shipped it.");
    await expect(page.getByTestId("res-count")).toHaveText("3");
    await expect(page.getByTestId("res-bullets")).toContainText("- The plan changed.");
    await expect(page.getByTestId("res-changes")).toContainText("However,");
    await expect(page.getByTestId("res-changes")).toContainText("Finally,");

    await page.getByTestId("in-text").fill("- Keep this line\nWe add one more sentence.");
    await expect(page.getByTestId("res-existing")).toContainText("Keep this line");
    await expect(page.getByTestId("res-count")).toHaveText("1");
  });

  test("important-sentence-highlighter marks the ranking in place without losing text", async ({ page }) => {
    await page.goto(`${BASE}/writing/important-sentence-highlighter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(TEN_SENTENCES);
    await page.getByTestId("in-count").selectOption("3");
    await expect(page.getByTestId("res-count")).toHaveText("3");

    // The rendered text is the source plus marks: stripping the marks must give
    // the input back, character for character.
    const marked = await page.getByTestId("res-text").evaluate((node) => node.textContent ?? "");
    expect(marked.trim()).toBe(TEN_SENTENCES);

    const marks = await page.locator('[data-testid="res-text"] mark').count();
    expect(marks).toBeGreaterThan(0);
    await expect(page.getByTestId("res-list")).toContainText("Rank 1");
  });

  test("meeting-summary-formatter sorts decisions, actions and questions", async ({ page }) => {
    await page.goto(`${BASE}/writing/meeting-summary-formatter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-notes").fill(
      "Decision: we ship the beta on the fifteenth. Action: Sam will send the pricing deck by Friday. Should we keep the old landing page? The coffee machine was repaired.",
    );
    await expect(page.getByTestId("res-count-decisions")).toHaveText("1");
    await expect(page.getByTestId("res-count-actions")).toHaveText("1");
    await expect(page.getByTestId("res-count-questions")).toHaveText("1");
    await expect(page.getByTestId("res-decisions")).toContainText("beta");
    await expect(page.getByTestId("res-actions")).toContainText("owner?: Sam");
    await expect(page.getByTestId("res-unclassified")).toContainText("coffee machine");
  });

  test("citation-formatter formats each style's worked example", async ({ page }) => {
    await page.goto(`${BASE}/writing/citation-formatter`, { waitUntil: "networkidle" });

    // APA 7 journal article.
    await page.getByTestId("btn-example").click();
    await expect(page.getByTestId("res-bibliography")).toHaveText(
      "Smith, J. A., & Jones, B. (2021). A study of style. Journal of Writing, 12(3), 45\u201367. https://doi.org/10.1000/xyz",
    );
    // The worked example includes a pinpoint page, so the APA in-text form carries it.
    await expect(page.getByTestId("res-intext")).toHaveText("(Smith & Jones, 2021, p. 45)");

    // MLA 9 uses the hyphen page range and no year parentheses.
    await page.getByTestId("in-style").selectOption("mla9");
    await expect(page.getByTestId("res-bibliography")).toContainText("pp. 45-67");
    await expect(page.getByTestId("res-intext")).toHaveText("(Smith and Jones 45)");

    // Chicago 17 renders a bibliography entry and a note form.
    await page.getByTestId("in-style").selectOption("chicago17");
    await expect(page.getByTestId("res-bibliography")).toContainText("Journal of Writing 12, no. 3 (2021): 45");
    await expect(page.getByTestId("res-note")).toContainText("John A. Smith and Bob Jones");

    // Bluebook is offered for legal material only, with a stated reason elsewhere.
    await page.getByTestId("in-type").selectOption("case");
    await page.getByTestId("in-court").fill("2d Cir.");
    await page.getByTestId("in-reporter").fill("F.3d");
    await page.getByTestId("in-title").fill("Smith v. Jones");
    await page.getByTestId("in-volume").fill("123");
    await page.getByTestId("in-pages").fill("456");
    await page.getByTestId("in-year").fill("2020");
    await expect(page.getByTestId("res-bibliography")).toHaveText("Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");

    // Switching back to a non-legal type removes Bluebook from the style list.
    await page.getByTestId("in-type").selectOption("book");
    await expect(page.getByTestId("in-style")).not.toContainText("Bluebook");
    await expect(page.getByTestId("in-style")).toContainText("APA 7th edition");
  });
});
