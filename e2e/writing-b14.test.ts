/**
 * writing-b14.test.ts — verification of Writing batch B14 (specialized and
 * academic: fallacy cues, thesis assembly, argument maps, survey wording and
 * the peer review checklist).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the fallacy cue count and names, the exact
 *      assembled thesis sentence and its word count, the map's completeness and
 *      the missing-warrant prompt, the survey question and flagged counts, and
 *      the checklist progress before and after marking every item.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "logical-fallacy-detector", name: "Logical Fallacy Detector" },
  { slug: "thesis-statement-builder", name: "Thesis Statement Builder" },
  { slug: "argument-mapping-tool", name: "Argument Mapping Tool" },
  { slug: "survey-question-builder", name: "Survey Question Builder" },
  { slug: "peer-review-checklist", name: "Peer Review Checklist" },
];

test.describe("Writing B14 — page contract", () => {
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

test.describe("Writing B14 — functional results", () => {
  test.setTimeout(90_000);

  test("logical-fallacy-detector finds each cue and names the fallacy", async ({ page }) => {
    await page.goto(`${BASE}/writing/logical-fallacy-detector`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("Everyone knows the plan is wrong.\nEither we cut the budget or the project fails.");
    await expect(page.getByTestId("res-count")).toHaveText("2");
    await expect(page.getByTestId("res-findings")).toContainText("Appeal to popularity");
    await expect(page.getByTestId("res-findings")).toContainText("False dilemma");
    await expect(page.getByTestId("res-findings")).toContainText("Everyone knows");
    await expect(page.getByTestId("res-reference")).toContainText("Slippery slope");

    // A passage with no cue phrases empties the findings rather than guessing.
    await page.getByTestId("in-text").fill("The report lists three causes and a recommendation.");
    await expect(page.getByTestId("res-count")).toHaveCount(0);
    await expect(page.getByText("No cue phrases found")).toBeVisible();
  });

  test("thesis-statement-builder assembles the sentence and flags hedges", async ({ page }) => {
    await page.goto(`${BASE}/writing/thesis-statement-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-topic").fill("remote work");
    await page.getByTestId("in-position").fill("should be limited");
    await page.getByTestId("in-reasons").fill("it blurs rest\nit hides costs");

    await expect(page.getByTestId("res-thesis")).toHaveText("Remote work should be limited because it blurs rest and it hides costs.");
    await expect(page.getByTestId("res-words")).toHaveText("13");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A hedge in the position is caught and named.
    await page.getByTestId("in-position").fill("I think should be limited");
    await expect(page.getByTestId("res-checks")).toContainText("A hedge");
    await expect(page.getByTestId("res-checks")).toContainText("I think");
  });

  test("argument-mapping-tool reports the shape and asks for the missing warrant", async ({ page }) => {
    await page.goto(`${BASE}/writing/argument-mapping-tool`, { waitUntil: "networkidle" });

    await page.getByTestId("in-claim").fill("Remote work should be limited");
    await page
      .getByTestId("in-reasons")
      .fill("it blurs rest | two studies | rest needs separation\nit hides costs | a survey | the budget hides the cost");
    await page.getByTestId("in-objection").fill("some roles need in-person work");
    await page.getByTestId("in-rebuttal").fill("those roles are a small minority");

    await expect(page.getByTestId("res-completeness")).toHaveText("5/5");
    await expect(page.getByTestId("res-evidenced")).toHaveText("2");
    await expect(page.getByTestId("res-warranted")).toHaveText("2");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);
    await expect(page.getByTestId("res-map")).toContainText("# Claim");
    await expect(page.getByTestId("res-map")).toContainText("### Reason 1");
    await expect(page.getByTestId("res-map")).toContainText("rest needs separation");

    // Dropping one warrant brings the prompt back.
    await page.getByTestId("in-reasons").fill("it blurs rest | two studies | rest needs separation\nit hides costs | a survey");
    await expect(page.getByTestId("res-warranted")).toHaveText("1");
    await expect(page.getByTestId("res-checks")).toContainText("no warrant");
  });

  test("survey-question-builder counts the questions and the wording issues", async ({ page }) => {
    await page.goto(`${BASE}/writing/survey-question-builder`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-questions")
      .fill("How often do you use the tool?\nDon't you agree the onboarding is obviously too long?\nHow satisfied are you with the price and the support?");
    await expect(page.getByTestId("res-questions")).toHaveText("3");
    await expect(page.getByTestId("res-rows")).toContainText("Leading");
    await expect(page.getByTestId("res-rows")).toContainText("Double-barrelled");
    await expect(page.getByText("2 with a wording issue", { exact: true })).toBeVisible();

    // A single clean question is reported as clean.
    await page.getByTestId("in-questions").fill("How often do you use the tool?");
    await expect(page.getByTestId("res-questions")).toHaveText("1");
    await expect(page.getByTestId("res-rows")).toContainText("No wording issue found.");
  });

  test("peer-review-checklist tracks progress overall and per section", async ({ page }) => {
    await page.goto(`${BASE}/writing/peer-review-checklist`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("res-progress")).toHaveText("0/12");
    await expect(page.getByTestId("res-sections")).toContainText("Summary");
    await expect(page.getByTestId("res-report")).toContainText("[ ] Does the abstract state");

    await page.getByTestId("in-abstract-claim").check();
    await expect(page.getByTestId("res-progress")).toHaveText("1/12");
    await expect(page.getByTestId("res-report")).toContainText("[x] Does the abstract state");

    await page.getByTestId("btn-all").click();
    await expect(page.getByTestId("res-progress")).toHaveText("12/12");
    await expect(page.getByTestId("res-bar").locator("div")).toHaveAttribute("style", /width: 100%/);
    await expect(page.getByTestId("res-sections")).toContainText("Summary");
    await expect(page.getByTestId("res-sections")).toContainText("2/2");

    await page.getByTestId("btn-none").click();
    await expect(page.getByTestId("res-progress")).toHaveText("0/12");
  });
});
