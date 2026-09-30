/**
 * writing-b6.test.ts — verification of Writing batch B6 (Grammar & Style:
 * mechanical checks, phrase detectors and register analysis).
 *
 * Two layers:
 *   1. Every slug in the batch renders as a real tool page — HTTP 200, exactly
 *      one non-empty `<h1>` carrying the registry name, no uncaught page error.
 *   2. Each tool is driven with a fixed input and asserted against a value the
 *      engine's own unit tests pin (three mechanical issues, a 50% passive
 *      share, a formality score of 96.3, and so on) — not merely "something
 *      rendered".
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

/** Registry slug → the exact tool name the page shell renders as its h1. */
const BATCH: { slug: string; name: string }[] = [
  { slug: "grammar-checker", name: "Grammar Checker" },
  { slug: "passive-voice-detector", name: "Passive Voice Detector" },
  { slug: "cliche-detector", name: "Cliché Detector" },
  { slug: "redundancy-finder", name: "Redundancy Finder" },
  { slug: "wordy-phrase-simplifier", name: "Wordy Phrase Simplifier" },
  { slug: "tone-analyzer", name: "Tone Analyzer" },
  { slug: "formality-level-detector", name: "Formality Level Detector" },
  { slug: "style-guide-adherence-checker", name: "Style Guide Adherence Checker" },
  { slug: "academic-writing-tone-checker", name: "Academic Writing Tone Checker" },
];

/** Measured as 96.25 → 96.3 in the engine, very formal. */
const FORMAL =
  "The committee therefore recommends that the proposal be approved. Furthermore, the evidence supports the conclusion.";

test.describe("Writing B6 — page contract", () => {
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

      expect(pageErrors, `uncaught errors on /writing/${slug}`).toEqual([]);
    });
  }
});

test.describe("Writing B6 — functional results", () => {
  test.setTimeout(60_000);

  test("grammar-checker counts issues across its six rules", async ({ page }) => {
    await page.goto(`${BASE}/writing/grammar-checker`, { waitUntil: "networkidle" });

    // repeated "is", "your going", and a lowercase sentence start.
    await page.getByTestId("in-text").fill("This is is a test. your going to love it.");
    await expect(page.getByTestId("res-issues")).toHaveText("3");
    await expect(page.getByTestId("res-count-repeated-word")).toHaveText("1");
    await expect(page.getByTestId("res-count-confusable")).toHaveText("1");

    // A single article error, and nothing else.
    await page.getByTestId("in-text").fill("I ate a apple.");
    await expect(page.getByTestId("res-issues")).toHaveText("1");
    await expect(page.getByTestId("res-count-a-an")).toHaveText("1");
    await expect(page.getByTestId("res-count-repeated-word")).toHaveText("0");
  });

  test("passive-voice-detector reports the share of affected sentences", async ({ page }) => {
    await page.goto(`${BASE}/writing/passive-voice-detector`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("The ball was thrown. She ran home.");
    await expect(page.getByTestId("res-hits")).toHaveText("1");
    await expect(page.getByTestId("res-share")).toHaveText("50%");
    await expect(page.getByTestId("res-candidate")).toHaveText("1");

    // An expressed agent raises the hit to strong.
    await page.getByTestId("in-text").fill("The report was written by the analyst.");
    await expect(page.getByTestId("res-strong")).toHaveText("1");
  });

  test("cliche-detector matches phrases from its published list", async ({ page }) => {
    await page.goto(`${BASE}/writing/cliche-detector`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("At the end of the day, circle back and touch base.");
    await expect(page.getByTestId("res-count")).toHaveText("3");
    // The table preserves the source casing of the matched phrase.
    await expect(page.getByTestId("res-matches")).toContainText("At the end of the day");
  });

  test("redundancy-finder flags doubled meanings", async ({ page }) => {
    await page.goto(`${BASE}/writing/redundancy-finder`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("It was a free gift and a brief summary.");
    await expect(page.getByTestId("res-count")).toHaveText("2");
    await expect(page.getByTestId("res-matches")).toContainText("free gift");
  });

  test("wordy-phrase-simplifier rewrites the text and lists every change", async ({ page }) => {
    await page.goto(`${BASE}/writing/wordy-phrase-simplifier`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("In order to win, due to the fact that we tried.");
    await expect(page.getByTestId("res-count")).toHaveText("2");
    await expect(page.getByTestId("res-simplified")).toHaveText("To win, because we tried.");
    await expect(page.getByTestId("res-matches")).toContainText("due to the fact that");
  });

  test("tone-analyzer follows the sentiment lexicon", async ({ page }) => {
    await page.goto(`${BASE}/writing/tone-analyzer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("This is a great and wonderful success.");
    await expect(page.getByTestId("res-polarity")).toHaveText("Positive");
    await expect(page.getByTestId("res-signal-confidence")).toHaveText("Assertive");

    await page.getByTestId("in-text").fill("This is a terrible and painful failure.");
    await expect(page.getByTestId("res-polarity")).toHaveText("Negative");
  });

  test("formality-level-detector scores formal prose above informal prose", async ({ page }) => {
    await page.goto(`${BASE}/writing/formality-level-detector`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(FORMAL);
    await expect(page.getByTestId("res-score")).toHaveText("96.3");
    await expect(page.getByTestId("res-band")).toHaveText("Very formal");

    await page.getByTestId("in-text").fill("I really don't think we're gonna like it, you know.");
    await expect(page.getByTestId("res-band")).toHaveText("Very informal");
  });

  test("style-guide-adherence-checker applies the selected guide's preference", async ({ page }) => {
    await page.goto(`${BASE}/writing/style-guide-adherence-checker`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("apples, oranges and pears");

    // Chicago requires the serial comma, so the missing one is a finding.
    await expect(page.getByTestId("res-issues")).toHaveText("1");

    // AP omits it, so the same sentence is clean.
    await page.getByTestId("in-guide").selectOption("ap");
    await expect(page.getByTestId("res-issues")).toHaveText("0");

    // Oxford prefers single quotes, so a double-quoted span is flagged.
    await page.getByTestId("in-guide").selectOption("oxford");
    await page.getByTestId("in-text").fill('He said "hello there".');
    await expect(page.getByTestId("res-issues")).toHaveText("1");
    await expect(page.getByTestId("res-findings")).toContainText("Quotation marks");
  });

  test("academic-writing-tone-checker flags register conventions", async ({ page }) => {
    await page.goto(`${BASE}/writing/academic-writing-tone-checker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("Don't use you here, it's really very big stuff.");
    await expect(page.getByTestId("res-warnings")).toHaveText("5");
    await expect(page.getByTestId("res-check-contractions")).toContainText("Warn");

    const clean =
      "The study examines the relationship between temperature and growth. Furthermore, the results suggest a strong correlation.";
    await page.getByTestId("in-text").fill(clean);
    await expect(page.getByTestId("res-warnings")).toHaveText("0");
    await expect(page.getByTestId("res-check-contractions")).toHaveText("Pass");
  });
});
