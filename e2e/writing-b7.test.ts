/**
 * writing-b7.test.ts — verification of Writing batch B7 (Spelling &
 * Proofreading plus the language group: dictionary-backed spell checking,
 * mechanical proofreading checks, language detection, encoding conversion and
 * text expansion estimation).
 *
 * Two layers:
 *   1. Every slug in the batch renders as a real tool page — HTTP 200, exactly
 *      one non-empty `<h1>` carrying the registry name, no uncaught page error.
 *   2. Each tool is driven with a fixed input and asserted against a value the
 *      engine's own unit tests pin (two unknown words, three punctuation
 *      findings, one homophone hit, twelve profile languages) — not merely
 *      "something rendered".
 *
 * The spell checker loads its dictionary lazily in the browser, so its test
 * waits for the loaded state before asserting.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

/** Registry slug → the exact tool name the page shell renders as its h1. */
const BATCH: { slug: string; name: string }[] = [
  { slug: "spell-checker", name: "Spell Checker" },
  { slug: "homophone-confusion-detector", name: "Homophone Confusion Detector" },
  { slug: "punctuation-checker", name: "Punctuation Checker" },
  { slug: "apostrophe-error-finder", name: "Apostrophe Error Finder" },
  { slug: "capitalization-checker", name: "Capitalization Checker" },
  { slug: "proper-noun-checker", name: "Proper Noun Checker" },
  { slug: "consistent-spelling-checker", name: "Consistent Spelling Checker" },
  { slug: "language-detector", name: "Language Detector" },
  { slug: "character-encoding-converter", name: "Character Encoding Converter" },
  { slug: "text-expansion-estimator", name: "Text Expansion Estimator" },
];

test.describe("Writing B7 — page contract", () => {
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

test.describe("Writing B7 — functional results", () => {
  test.setTimeout(90_000);

  test("spell-checker looks words up in the lazily loaded dictionary", async ({ page }) => {
    await page.goto(`${BASE}/writing/spell-checker`, { waitUntil: "networkidle" });

    // "I" is a single letter, so it is dropped before tokenisation rather than
    // counted as skipped; the other three words are looked up.
    await page.getByTestId("in-text").fill("I recieve teh mail.");
    await expect(page.getByTestId("res-unknown")).toHaveText("2", { timeout: 60_000 });
    await expect(page.getByTestId("res-checked")).toHaveText("3");
    await expect(page.getByTestId("res-skipped")).toHaveText("0");
    // Suggestions come from edit distance against the dictionary.
    await expect(page.getByTestId("res-misspellings")).toContainText("receive");
    await expect(page.getByTestId("res-misspellings")).toContainText("teh");

    // The allow list silences a name the dictionary cannot know.
    await page.getByTestId("in-allow").fill("Racira");
    await page.getByTestId("in-text").fill("Racira writes.");
    await expect(page.getByTestId("res-unknown")).toHaveText("0");

    // The en_US dictionary is what answers, and the page says so.
    await page.getByTestId("in-text").fill("The colour is nice.");
    await expect(page.getByTestId("res-misspellings")).toContainText("colour");
    await expect(page.getByTestId("res-misspellings")).toContainText("color");
  });

  test("homophone-confusion-detector fires on context and stays quiet without it", async ({ page }) => {
    await page.goto(`${BASE}/writing/homophone-confusion-detector`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("Your going to love it.");
    await expect(page.getByTestId("res-findings")).toHaveText("1");
    await expect(page.getByTestId("res-findings-table")).toContainText("you're");

    // The same word in a possessive is correct and is not reported.
    await page.getByTestId("in-text").fill("Your book is on the table.");
    await expect(page.getByTestId("res-findings")).toHaveText("0");
  });

  test("punctuation-checker reports the mechanical faults and ignores near-misses", async ({ page }) => {
    await page.goto(`${BASE}/writing/punctuation-checker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("Hello , world.. This is (unfinished.");
    await expect(page.getByTestId("res-findings")).toHaveText("3");
    await expect(page.getByTestId("res-count-space-before-punctuation")).toHaveText("1");
    await expect(page.getByTestId("res-count-unmatched-brackets")).toHaveText("1");
    await expect(page.getByTestId("res-count-ellipsis-length")).toHaveText("1");

    // A grouped number and a time are not punctuation faults.
    await page.getByTestId("in-text").fill("We met at 10:30 and spent 1,000 dollars.");
    await expect(page.getByTestId("res-findings")).toHaveText("0");
  });

  test("apostrophe-error-finder uses its published list and needs evidence for ambiguous forms", async ({ page }) => {
    await page.goto(`${BASE}/writing/apostrophe-error-finder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("I dont know.");
    await expect(page.getByTestId("res-findings")).toHaveText("1");
    await expect(page.getByTestId("res-count-missing-apostrophe")).toHaveText("1");
    await expect(page.getByTestId("res-findings-table")).toContainText("don't");

    // "lets" is a real word, so the rule needs the next word as evidence.
    await page.getByTestId("in-text").fill("Lets you and me go.");
    await expect(page.getByTestId("res-findings-table")).toContainText("Let's");
    await page.getByTestId("in-text").fill("The plan lets you save.");
    await expect(page.getByTestId("res-findings")).toHaveText("0");
  });

  test("capitalization-checker splits errors from style and honours abbreviations", async ({ page }) => {
    await page.goto(`${BASE}/writing/capitalization-checker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("we met on monday.");
    await expect(page.getByTestId("res-findings")).toHaveText("2");
    await expect(page.getByTestId("res-count-sentence-start")).toHaveText("1");
    await expect(page.getByTestId("res-count-name-lowercase")).toHaveText("1");

    // Abbreviations do not end a sentence, and a brand keeps its inner capital.
    await page.getByTestId("in-text").fill("Use e.g. this one and the iPhone app.");
    await expect(page.getByTestId("res-findings")).toHaveText("0");
  });

  test("proper-noun-checker reports documented names and its own name-consistency findings", async ({ page }) => {
    await page.goto(`${BASE}/writing/proper-noun-checker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("I visited france.");
    await expect(page.getByTestId("res-findings")).toHaveText("1");
    await expect(page.getByTestId("res-findings-table")).toContainText("France");

    // A name outside the lexicon is listed, never corrected, and the two
    // occurrences of a name written two ways are the document's own fault.
    await page.getByTestId("in-text").fill("The Racira team and the racira team.");
    await expect(page.getByTestId("res-findings")).toHaveText("1");
    await expect(page.getByTestId("res-findings-table")).toContainText("inconsistent");
    await expect(page.getByTestId("res-unverified-list")).toContainText("Racira");
  });

  test("consistent-spelling-checker reports the mix, not the spelling", async ({ page }) => {
    await page.goto(`${BASE}/writing/consistent-spelling-checker`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("The color of the colour.");
    await expect(page.getByTestId("res-dominant")).toHaveText("Mixed");
    await expect(page.getByTestId("res-us")).toHaveText("1");
    await expect(page.getByTestId("res-uk")).toHaveText("1");
    await expect(page.getByTestId("res-mixed")).toHaveText("1");
    await expect(page.getByTestId("res-families")).toContainText("color");

    // One variant alone is a convention, not a fault.
    await page.getByTestId("in-text").fill("The color and the color.");
    await expect(page.getByTestId("res-dominant")).toHaveText("US");
    await expect(page.getByTestId("res-mixed")).toHaveText("0");

    // The stem-matched -ll- family is only reported when both shapes appear.
    await page.getByTestId("in-text").fill("We traveled and travelled.");
    await expect(page.getByTestId("res-dominant")).toHaveText("Mixed");
    await expect(page.getByTestId("res-families")).toContainText("traveled");
  });

  test("language-detector answers on real prose and refuses short or non-Latin samples", async ({ page }) => {
    await page.goto(`${BASE}/writing/language-detector`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("The quick brown fox jumps over the lazy dog and the sleepy cat.");
    await expect(page.getByTestId("res-language")).toHaveText("English");
    await expect(page.getByTestId("res-scores")).toContainText("English");

    // The same sentence in Spanish must win its own profile, not English.
    await page.getByTestId("in-text").fill("El zorro marrón rápido salta sobre el perro perezoso y el gato.");
    await expect(page.getByTestId("res-language")).toHaveText("Spanish");

    // Short input is refused rather than guessed.
    await page.getByTestId("in-text").fill("Hola");
    await expect(page.getByTestId("res-status")).toContainText("Not enough text");
    await expect(page.getByTestId("res-language")).toHaveText("—");

    // A non-Latin script is reported as unsupported, with the script named.
    await page.getByTestId("in-text").fill("Привет, как дела сегодня? Всё хорошо.");
    await expect(page.getByTestId("res-status")).toContainText("Cyrillic");
  });

  test("character-encoding-converter writes reference bytes and reports lossy substitutions", async ({ page }) => {
    await page.goto(`${BASE}/writing/character-encoding-converter`, { waitUntil: "networkidle" });

    // "é" is U+00E9: C3 A9 in UTF-8, E9 in Windows-1252.
    await page.getByTestId("in-text").fill("é");
    await expect(page.getByTestId("res-output")).toHaveText("C3 A9");
    await expect(page.getByTestId("res-bytes")).toHaveText("2");

    await page.getByTestId("in-encoding").selectOption("windows-1252");
    await expect(page.getByTestId("res-output")).toHaveText("E9");

    // € is representable in Windows-1252 but not in Latin-1, so it is flagged.
    await page.getByTestId("in-encoding").selectOption("iso-8859-1");
    await page.getByTestId("in-text").fill("€");
    await expect(page.getByTestId("res-lossy")).toHaveText("1");
    await expect(page.getByTestId("res-lossy-list")).toContainText("€");

    // The same codec runs backwards: E9 in Windows-1252 decodes to é.
    await page.getByTestId("in-mode").selectOption("decode");
    await page.getByTestId("in-encoding").selectOption("windows-1252");
    await page.getByTestId("in-bytes").fill("E9");
    await expect(page.getByTestId("res-decoded")).toHaveText("é");

    // Malformed bytes are refused with a stated reason, not decoded silently.
    await page.getByTestId("in-bytes").fill("ZZ");
    await expect(page.getByTestId("res-error")).toContainText("hexadecimal");
  });

  test("text-expansion-estimator applies the locale range and the character budget", async ({ page }) => {
    await page.goto(`${BASE}/writing/text-expansion-estimator`, { waitUntil: "networkidle" });

    // German is the default: Settings (8) is 10-11; Save document changes now
    // (25) is 30-34; totals 40-45.
    await page.getByTestId("in-text").fill("Settings\nSave document changes now");
    await expect(page.getByTestId("res-low-chars")).toHaveText("40");
    await expect(page.getByTestId("res-high-chars")).toHaveText("45");
    await expect(page.getByTestId("res-estimate")).toHaveText("40–45");
    await expect(page.getByTestId("res-too-short")).toHaveText("1");

    // A 30-character budget flags only the line whose high estimate is 34.
    await page.getByTestId("in-budget").fill("30");
    await expect(page.getByTestId("res-overflow")).toHaveText("1");

    // Japanese contracts: 8 characters at x0.50-x0.70 is 4-6.
    await page.getByTestId("in-locale").selectOption("ja-JP");
    await expect(page.getByTestId("res-lines")).toContainText("4–6");
  });
});
