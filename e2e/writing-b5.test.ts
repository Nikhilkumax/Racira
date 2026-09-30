/**
 * writing-b5.test.ts — verification of Writing batch B5 (the text-analysis
 * engine: readability formulas, n-grams, sentence metrics and stylometry).
 *
 * Two layers:
 *   1. Every slug in the batch renders as a real tool page — HTTP 200, exactly
 *      one non-empty `<h1>` carrying the registry name, no uncaught page error.
 *   2. Each tool is driven with a fixed input and asserted against values from
 *      the engine's own reference tests (a read grade of 8.7, ten Gunning
 *      complex words, a 50% share, and so on) — not merely "something rendered".
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

/** Registry slug → the exact tool name the page shell renders as its h1. */
const BATCH: { slug: string; name: string }[] = [
  { slug: "readability-grade-scorer", name: "Readability Grade Scorer" },
  { slug: "sentence-complexity-analyzer", name: "Sentence Complexity Analyzer" },
  { slug: "overused-word-finder", name: "Overused Word Finder" },
  { slug: "sentence-variety-checker", name: "Sentence Variety Checker" },
  { slug: "clarity-score-tool", name: "Clarity Score Tool" },
  { slug: "vocabulary-richness-scorer", name: "Vocabulary Richness Scorer" },
  { slug: "keyword-density-analyzer", name: "Keyword Density Analyzer" },
  { slug: "flesch-kincaid-score-calculator", name: "Flesch-Kincaid Score Calculator" },
  { slug: "gunning-fog-index-calculator", name: "Gunning Fog Index Calculator" },
  { slug: "smog-index-calculator", name: "SMOG Index Calculator" },
  { slug: "lexical-diversity-calculator", name: "Lexical Diversity Calculator" },
  { slug: "text-fingerprint-analyzer", name: "Text Fingerprint Analyzer" },
];

/**
 * A 95-word, 6-sentence passage. Its engine reference values are fixed:
 * Flesch-Kincaid 8.7, Reading Ease 60.7, Fog 10.5, SMOG 10.9, 11 polysyllables,
 * 10 Gunning complex words, clarity 78.6.
 */
const PASSAGE =
  "Learning to write clearly is a skill that improves with practice and honest feedback. " +
  "Most writers know when a paragraph feels heavy, but they cannot always say which sentence caused the problem. " +
  "A readable draft uses ordinary words, keeps sentences short enough to follow, and varies the rhythm so the reader does not drift. " +
  "When a sentence carries three separate ideas, splitting it usually helps. " +
  "When a word has four syllables and a plain alternative exists, the plain one is usually better. " +
  "None of this needs special talent, only attention and a willingness to revise.";

/** Four sentences of very different lengths: 2, 12, 1, 15 words. */
const VARIED =
  "Birds fly. The quick brown fox jumps over the lazy dog every single morning. Rain. " +
  "The old house on the hill stood empty for many years, and nobody ever asked why.";

test.describe("Writing B5 — page contract", () => {
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

test.describe("Writing B5 — functional results", () => {
  test.setTimeout(60_000);

  test("readability-grade-scorer reports every formula from one passage", async ({ page }) => {
    await page.goto(`${BASE}/writing/readability-grade-scorer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await expect(page.getByTestId("res-grade")).toHaveText("9th grade");
    await expect(page.getByTestId("res-fk")).toHaveText("8.7");
    await expect(page.getByTestId("res-flesch")).toHaveText("60.7");
    await expect(page.getByTestId("res-fog")).toHaveText("10.5");
    await expect(page.getByTestId("res-smog")).toHaveText("10.9");
  });

  test("sentence-complexity-analyzer estimates clauses per sentence", async ({ page }) => {
    await page.goto(`${BASE}/writing/sentence-complexity-analyzer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("The cat sat on the mat. Because it rained, the dog stayed inside and slept.");
    await expect(page.getByTestId("res-sentences")).toHaveText("2");
    await expect(page.getByTestId("res-avg-clauses")).toHaveText("2.00");
    // Sentence one is single-clause; sentence two has three clause markers.
    await expect(page.getByTestId("res-single-share")).toHaveText("50% (1)");
    await expect(page.getByTestId("res-complex-share")).toHaveText("50% (1)");
  });

  test("overused-word-finder counts repeats and lists them by frequency", async ({ page }) => {
    await page.goto(`${BASE}/writing/overused-word-finder`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("cat dog cat bird cat fish dog bird dog");
    // cat and dog each appear 3 times; ties break alphabetically, so cat leads.
    await expect(page.getByTestId("res-top")).toHaveText("cat");
    await expect(page.getByTestId("res-repeated")).toHaveText("2");
    await expect(page.getByTestId("res-terms")).toContainText("cat");
    await expect(page.getByTestId("res-terms")).toContainText("dog");
  });

  test("sentence-variety-checker measures the spread of sentence lengths", async ({ page }) => {
    await page.goto(`${BASE}/writing/sentence-variety-checker`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(VARIED);
    await expect(page.getByTestId("res-stdev")).toHaveText("6.4");
    await expect(page.getByTestId("res-mean")).toHaveText("7.8 words");
    await expect(page.getByTestId("res-max")).toHaveText("16 words");
    await expect(page.getByTestId("res-uniform")).toHaveText("no");
  });

  test("clarity-score-tool blends its four components into one score", async ({ page }) => {
    await page.goto(`${BASE}/writing/clarity-score-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await expect(page.getByTestId("res-score")).toHaveText("78.6");
    await expect(page.getByTestId("res-band")).toHaveText("Clear");
    await expect(page.getByTestId("res-c-sentence-length")).toBeVisible();
    await expect(page.getByTestId("res-c-sentence-variety")).toBeVisible();
  });

  test("vocabulary-richness-scorer reports type-token counts", async ({ page }) => {
    await page.goto(`${BASE}/writing/vocabulary-richness-scorer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("a b c a b c a");
    await expect(page.getByTestId("res-words")).toHaveText("7");
    await expect(page.getByTestId("res-unique")).toHaveText("3");
    await expect(page.getByTestId("res-ttr")).toHaveText("0.429");
    await expect(page.getByTestId("res-mattr")).toHaveText("0.429");
  });

  test("keyword-density-analyzer computes density against every word token", async ({ page }) => {
    await page.goto(`${BASE}/writing/keyword-density-analyzer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("seo seo seo content content marketing");
    await expect(page.getByTestId("res-words")).toHaveText("6");
    await expect(page.getByTestId("res-unique")).toHaveText("3");
    // "seo" is 3 of 6 words = 50.00%.
    await expect(page.getByTestId("res-top")).toHaveText("50.00%");
    await expect(page.getByTestId("res-single")).toContainText("seo");
  });

  test("flesch-kincaid-score-calculator shows both Flesch formulas", async ({ page }) => {
    await page.goto(`${BASE}/writing/flesch-kincaid-score-calculator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await expect(page.getByTestId("res-fk")).toHaveText("8.7");
    await expect(page.getByTestId("res-ease")).toHaveText("60.7");
    await expect(page.getByTestId("res-asl")).toHaveText("15.83 words");
    await expect(page.getByTestId("res-formula-fk")).toContainText("= 8.7");
  });

  test("gunning-fog-index-calculator counts complex words and lists them", async ({ page }) => {
    await page.goto(`${BASE}/writing/gunning-fog-index-calculator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await expect(page.getByTestId("res-fog")).toHaveText("10.5");
    await expect(page.getByTestId("res-complex")).toHaveText("10");
    await expect(page.getByTestId("res-words")).toHaveText("95");
    await expect(page.getByTestId("complex-list")).toContainText("syllables");
  });

  test("smog-index-calculator counts polysyllables and warns on a short sample", async ({ page }) => {
    await page.goto(`${BASE}/writing/smog-index-calculator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await expect(page.getByTestId("res-smog")).toHaveText("10.9");
    await expect(page.getByTestId("res-poly")).toHaveText("11");
    // Six sentences is well below the thirty SMOG was validated on.
    await expect(page.getByTestId("res-warning")).toBeVisible();
  });

  test("lexical-diversity-calculator separates tokens and types", async ({ page }) => {
    await page.goto(`${BASE}/writing/lexical-diversity-calculator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("a b c a b c a");
    await expect(page.getByTestId("res-tokens")).toHaveText("7");
    await expect(page.getByTestId("res-types")).toHaveText("3");
    await expect(page.getByTestId("res-ttr")).toHaveText("0.429");
  });

  test("text-fingerprint-analyzer scores identical texts as fully similar", async ({ page }) => {
    await page.goto(`${BASE}/writing/text-fingerprint-analyzer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(PASSAGE);
    await page.getByTestId("in-compare").fill(PASSAGE);
    await expect(page.getByTestId("res-similarity")).toHaveText("100.0%");
    await expect(page.getByTestId("res-band")).toHaveText("Nearly identical profile");
    await expect(page.getByTestId("res-compare")).toContainText("Words");
  });
});
