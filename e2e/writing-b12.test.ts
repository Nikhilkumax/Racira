/**
 * writing-b12.test.ts — verification of Writing batch B12 (the story
 * organisers and the manuscript formatter).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the scene board's totals, the version
 *      timeline's delta, the plot map's coverage, the beat sheet's progress and
 *      the formatter's substitutions and counts.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "scene-and-chapter-organizer", name: "Scene & Chapter Organizer" },
  { slug: "draft-versioning-tool", name: "Draft Versioning Tool" },
  { slug: "plot-point-mapper", name: "Plot Point Mapper" },
  { slug: "story-beat-builder", name: "Story Beat Builder" },
  { slug: "manuscript-formatter", name: "Manuscript Formatter" },
];

test.describe("Writing B12 — page contract", () => {
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

test.describe("Writing B12 — functional results", () => {
  test.setTimeout(90_000);

  test("scene-and-chapter-organizer totals the board and tallies POVs", async ({ page }) => {
    await page.goto(`${BASE}/writing/scene-and-chapter-organizer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-scenes").fill(
      "The pier | Mara | Harbour | 1200\nThe letter | Mara | Kitchen | 800\nThe chase | Dev | Rooftops | 2000\nThe return | Mara | Harbour",
    );

    await expect(page.getByTestId("res-scenes")).toHaveText("4");
    await expect(page.getByTestId("res-words")).toHaveText("4000");
    await expect(page.getByTestId("res-average")).toHaveText("1000");
    await expect(page.getByTestId("res-median")).toHaveText("800");
    await expect(page.getByTestId("res-longest")).toContainText("The chase");
    await expect(page.getByTestId("res-povs")).toContainText("Mara");
    await expect(page.getByTestId("res-povs")).toContainText("2000 words");
  });

  test("draft-versioning-tool records a timeline and the latest delta", async ({ page }) => {
    await page.goto(`${BASE}/writing/draft-versioning-tool`, { waitUntil: "networkidle" });

    await page.getByTestId("in-label").fill("Draft one");
    await page.getByTestId("in-draft").fill("one two three");
    await page.getByTestId("btn-save").click();

    await page.getByTestId("in-label").fill("Draft two");
    await page.getByTestId("in-draft").fill("one two three four");
    await page.getByTestId("btn-save").click();

    await expect(page.getByTestId("res-count")).toHaveText("2");
    await expect(page.getByTestId("res-timeline")).toContainText("Draft one");
    await expect(page.getByTestId("res-timeline")).toContainText("Draft two");
    await expect(page.getByTestId("res-timeline")).toContainText("(+1)");
    await expect(page.getByTestId("res-delta")).toHaveText("+1");
  });

  test("plot-point-mapper reports coverage against the chosen structure", async ({ page }) => {
    await page.goto(`${BASE}/writing/plot-point-mapper`, { waitUntil: "networkidle" });

    await page.getByTestId("in-notes").fill("Hook: Mara alone on the pier.\nInciting incident: the letter arrives.");
    await expect(page.getByTestId("res-coverage")).toHaveText("2/7");
    await expect(page.getByTestId("res-percent")).toHaveText("29%");
    await expect(page.getByTestId("res-next")).toHaveText("First plot point");

    // The same notes do not match Save the Cat's beats, so coverage resets.
    await page.getByTestId("in-structure").selectOption("save-the-cat");
    await expect(page.getByTestId("res-coverage")).toHaveText("0/15");
  });

  test("story-beat-builder tracks a beat sheet's progress", async ({ page }) => {
    await page.goto(`${BASE}/writing/story-beat-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-beat-1").check();
    await page.getByTestId("in-beat-2").check();
    await expect(page.getByTestId("res-progress")).toHaveText("2/7");
    await expect(page.getByTestId("res-next")).toHaveText("First plot point (25%)");

    await page.getByTestId("btn-all").click();
    await expect(page.getByTestId("res-progress")).toHaveText("7/7");
    await expect(page.getByTestId("res-sheet")).toContainText("7/7 beats drafted");
  });

  test("manuscript-formatter smartens the text and counts the parts", async ({ page }) => {
    await page.goto(`${BASE}/writing/manuscript-formatter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill('Chapter one\n\n"Wait," she said -- the harbour was quiet...\n\n***\n\nBy morning the boat was gone.');

    await expect(page.getByTestId("res-chapters")).toHaveText("1");
    await expect(page.getByTestId("res-scene-breaks")).toHaveText("1");
    await expect(page.getByTestId("res-changes")).toContainText("curled");
    await expect(page.getByTestId("res-changes")).toContainText("em dash");

    const text = await page.getByTestId("res-manuscript").innerText();
    expect(text).toContain("\u201cWait,\u201d");
    expect(text).toContain("\u2014");
    expect(text).toContain("* * *");

    await page.getByTestId("in-title-page").check();
    await page.getByTestId("in-title").fill("My Book");
    await page.getByTestId("in-author").fill("A. Writer");
    await expect(page.getByTestId("res-manuscript")).toContainText("My Book");
    await expect(page.getByTestId("res-manuscript")).toContainText("by A. Writer");
  });
});
