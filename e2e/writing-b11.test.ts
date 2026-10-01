/**
 * writing-b11.test.ts — verification of Writing batch B11 (the citation
 * leftovers plus the text-editing and organising tools).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the Bluebook case citation and supra short
 *      form, the APA and MLA newspaper entries, the Markdown rendering and
 *      outline, the numbered outline, and the line diff's stats.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "legal-citation-formatter", name: "Legal Citation Formatter" },
  { slug: "newspaper-article-citation-maker", name: "Newspaper Article Citation Maker" },
  { slug: "markdown-editor", name: "Markdown Editor" },
  { slug: "outline-builder", name: "Outline Builder" },
  { slug: "document-diff-viewer", name: "Document Diff Viewer" },
];

test.describe("Writing B11 — page contract", () => {
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

test.describe("Writing B11 — functional results", () => {
  test.setTimeout(90_000);

  test("legal-citation-formatter builds a Bluebook case, a supra short form and a table", async ({ page }) => {
    await page.goto(`${BASE}/writing/legal-citation-formatter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("Smith v. Jones");
    await page.getByTestId("in-court").fill("2d Cir.");
    await page.getByTestId("in-reporter").fill("F.3d");
    await page.getByTestId("in-volume").fill("123");
    await page.getByTestId("in-pages").fill("456");
    await page.getByTestId("in-year").fill("2020");

    await expect(page.getByTestId("res-citation")).toHaveText("Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");

    await page.getByTestId("in-signal").selectOption("See");
    await expect(page.getByTestId("res-citation")).toHaveText("See Smith v. Jones, 123 F.3d 456 (2d Cir. 2020).");

    await page.getByTestId("in-pinpoint").fill("460");
    await page.getByTestId("in-short-kind").selectOption("supra");
    await page.getByTestId("in-short-note").fill("4");
    await expect(page.getByTestId("res-short")).toHaveText("Smith, supra note 4 at 460.");

    await page.getByTestId("btn-add-authority").click();
    await expect(page.getByTestId("res-toa-count")).toHaveText("1");
    await expect(page.getByTestId("res-toa")).toContainText("Smith v. Jones");
    await expect(page.getByTestId("res-toa")).toContainText("Cases");
  });

  test("newspaper-article-citation-maker formats APA and appends the year for MLA", async ({ page }) => {
    await page.goto(`${BASE}/writing/newspaper-article-citation-maker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-authors").fill("Smith, John A.");
    await page.getByTestId("in-title").fill("Cities brace for the storm");
    await page.getByTestId("in-container").fill("The Herald");
    await page.getByTestId("in-date").fill("May 5");
    await page.getByTestId("in-year").fill("2021");
    await page.getByTestId("in-url").fill("https://herald.example.com/storm");

    await expect(page.getByTestId("res-entry")).toHaveText(
      "Smith, J. A. (2021, May 5). Cities brace for the storm. The Herald. https://herald.example.com/storm",
    );

    await page.getByTestId("in-style").selectOption("mla9");
    await expect(page.getByTestId("res-entry")).toContainText("The Herald, May 5, 2021,");

    await expect(page.getByTestId("res-checklist")).toContainText("Byline");
    await expect(page.getByTestId("res-all")).toContainText("Chicago 17");
  });

  test("markdown-editor renders the source and builds the outline", async ({ page }) => {
    await page.goto(`${BASE}/writing/markdown-editor`, { waitUntil: "networkidle" });

    await page.getByTestId("in-markdown").fill("# Title\n\nHello **world** with a [link](https://example.com).\n\n## Section");

    // Preview headings are demoted one level so the page keeps its single h1.
    const html = await page.getByTestId("res-preview").evaluate((node) => node.innerHTML);
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain("<h3>Section</h3>");

    await expect(page.getByTestId("res-outline-count")).toHaveText("2");
    await expect(page.getByTestId("res-headings")).toHaveText("2");
    await expect(page.getByTestId("res-links")).toHaveText("1");

    // Raw HTML in the source is escaped, not executed.
    await page.getByTestId("in-markdown").fill("<script>alert(1)</script>");
    const escaped = await page.getByTestId("res-preview").evaluate((node) => node.innerHTML);
    expect(escaped).not.toContain("<script>");
  });

  test("outline-builder numbers a nested outline", async ({ page }) => {
    await page.goto(`${BASE}/writing/outline-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-outline").fill("Intro\n  Background\n    Detail\n  Method\nConclusion");

    await expect(page.getByTestId("res-count")).toHaveText("5");
    await expect(page.getByTestId("res-depth")).toHaveText("3");
    await expect(page.getByTestId("res-numbered")).toContainText("1. Intro");
    await expect(page.getByTestId("res-numbered")).toContainText("1.1 Background");
    await expect(page.getByTestId("res-numbered")).toContainText("2. Conclusion");

    await page.getByTestId("in-scheme").selectOption("classic");
    await expect(page.getByTestId("res-numbered")).toContainText("I. Intro");
    await expect(page.getByTestId("res-numbered")).toContainText("A. Background");

    await expect(page.getByTestId("res-markdown")).toContainText("- Intro");
  });

  test("document-diff-viewer counts the change and marks the rows", async ({ page }) => {
    await page.goto(`${BASE}/writing/document-diff-viewer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-old").fill("one\ntwo\nthree");
    await page.getByTestId("in-new").fill("one\nTWO\nthree\nfour");

    await expect(page.getByTestId("res-added")).toHaveText("3");
    await expect(page.getByTestId("res-removed")).toHaveText("2");
    await expect(page.getByTestId("res-diff")).toContainText("TWO");
    await expect(page.getByTestId("res-patch")).toContainText("-two");
    await expect(page.getByTestId("res-patch")).toContainText("+TWO");

    await page.getByTestId("in-mode").selectOption("word");
    await expect(page.getByTestId("res-diff")).toContainText("TWO");
  });
});
