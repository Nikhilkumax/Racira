/**
 * writing-b20.test.ts — verification of Writing batch B20 (paraphrasing and
 * rewriting: the sentence rewriter, the simplify text tool, the formality
 * adjuster, the technical to plain language converter and the active voice
 * converter).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the four sentence moves, the simplification
 *      counts and before/after metrics, the formality score and substitutions,
 *      the acronym expansion and leftover list, and the passive conversions
 *      with their reasons.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "sentence-rewriter", name: "Sentence Rewriter" },
  { slug: "simplify-text-tool", name: "Simplify Text Tool" },
  { slug: "formality-adjuster", name: "Formality Adjuster" },
  {
    slug: "technical-to-plain-language-converter",
    name: "Technical to Plain Language Converter",
  },
  { slug: "active-voice-converter", name: "Active Voice Converter" },
];

test.describe("Writing B20 — page contract", () => {
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

test.describe("Writing B20 — functional results", () => {
  test.setTimeout(90_000);

  test("sentence-rewriter offers the clause-order and split moves", async ({ page }) => {
    await page.goto(`${BASE}/writing/sentence-rewriter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill("Because the rain fell, the match was cancelled. The report was finished, and the team went home.");

    await expect(page.getByTestId("res-sentences")).toHaveText("2");
    await expect(page.getByTestId("res-with-variants")).toHaveText("2");
    await expect(page.getByTestId("res-variants")).toHaveText("2");
    await expect(page.getByTestId("res-rewrites")).toContainText(
      "The match was cancelled because the rain fell.",
    );
    await expect(page.getByTestId("res-rewrites")).toContainText(
      "The report was finished. The team went home.",
    );

    // An expletive opening is noted rather than rewritten.
    await page.getByTestId("in-text").fill("There are very many reasons to keep the plan.");
    await expect(page.getByTestId("res-rewrites")).toContainText("There are many reasons to keep the plan.");
    await expect(page.getByTestId("res-notes")).toContainText("expletive");
  });

  test("simplify-text-tool replaces phrases, splits a sentence and moves the metrics", async ({ page }) => {
    await page.goto(`${BASE}/writing/simplify-text-tool`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        "In order to utilise the new system, we must make a decision about the data. The team will commence work at this point in time, and the manager will provide assistance to everyone who needs it because the rollout is large and touches every single part of the business that has ever been involved in reporting.",
      );

    await expect(page.getByTestId("res-replacements")).toHaveText("6");
    await expect(page.getByTestId("res-splits")).toHaveText("1");
    await expect(page.getByTestId("res-sentence-length")).toHaveText("28 → 15");
    await expect(page.getByTestId("res-simplified")).toContainText(
      "To use the new system, we must decide about the data.",
    );
    await expect(page.getByTestId("res-simplified")).toContainText(
      "The team will start work now. The manager will help everyone who needs it",
    );
    await expect(page.getByTestId("res-sentences")).toContainText("at this point in time → now");
  });

  test("formality-adjuster scores the text and shifts it in either direction", async ({ page }) => {
    await page.goto(`${BASE}/writing/formality-adjuster`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        "We need to figure out the budget, and the boss will look into the kids' programme. I think we can't start right away.",
      );

    await expect(page.getByTestId("res-score")).toHaveText("0");
    await expect(page.getByTestId("res-casual")).toHaveText("10");
    await expect(page.getByTestId("res-formal")).toHaveText("0");
    await expect(page.getByTestId("res-changes-count")).toHaveText("9");
    await expect(page.getByTestId("res-output")).toContainText("children's programme");
    await expect(page.getByTestId("res-changes")).toContainText("kids'");

    // The other direction: a formal paragraph read through the paired table.
    await page.getByTestId("in-direction").selectOption("casual");
    await page
      .getByTestId("in-text")
      .fill("We require sufficient funds to establish the programme. Moreover, we cannot commence immediately.");

    await expect(page.getByTestId("res-score")).toHaveText("100");
    await expect(page.getByTestId("res-output")).toHaveText(
      "We need enough money to set up the programme. Besides, we can't start right away.",
    );
  });

  test("technical-to-plain-language-converter expands acronyms and names the leftovers", async ({ page }) => {
    await page.goto(`${BASE}/writing/technical-to-plain-language-converter`, {
      waitUntil: "networkidle",
    });

    await page
      .getByTestId("in-text")
      .fill(
        "The API call uses a CDN and the SLA covers latency. Our team will leverage the microservice to onboard new users. The performance of the implementation was unacceptable.",
      );

    await expect(page.getByTestId("res-findings")).toHaveText("7");
    await expect(page.getByTestId("res-abbreviations")).toHaveText("3");
    await expect(page.getByTestId("res-sentences")).toHaveText("3");
    await expect(page.getByTestId("res-plain")).toContainText(
      "The application programming interface call uses a content delivery network and the service commitment covers delay.",
    );
    await expect(page.getByTestId("res-terms")).toContainText("found in a sentence of 11 words");
    await expect(page.getByTestId("res-leftover")).toContainText("implementation");
  });

  test("active-voice-converter recasts named actors and reports the rest", async ({ page }) => {
    await page.goto(`${BASE}/writing/active-voice-converter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        "The report was written by Maya. The package was delivered by the courier. The budget has been approved by the board. The decision was made. The plan is reviewed by the committee. She was tired by noon.",
      );

    await expect(page.getByTestId("res-converted")).toHaveText("3");
    await expect(page.getByTestId("res-agentless")).toHaveText("1");
    await expect(page.getByTestId("res-unconverted")).toHaveText("2");
    await expect(page.getByTestId("res-output")).toContainText("Maya wrote the report.");
    await expect(page.getByTestId("res-output")).toContainText("The board has approved the budget.");
    await expect(page.getByTestId("res-findings")).toContainText("No named actor");

    // A date after "by" is not an actor, so the clause stays as written.
    await page.getByTestId("in-text").fill("The draft was finished by Friday.");
    await expect(page.getByTestId("res-converted")).toHaveText("0");
    await expect(page.getByTestId("res-agentless")).toHaveText("1");
  });
});
