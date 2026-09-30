/**
 * writing-b1.test.ts — verification of Writing batch B1 (counters, timers, Intl
 * and encoding utilities).
 *
 * Two layers:
 *   1. Every slug in the batch renders as a real tool page — HTTP 200, exactly
 *      one non-empty `<h1>` carrying the registry name, no uncaught page error.
 *   2. Each tool is driven with a known input and asserted against a
 *      known-correct result (a real count, a real locale rendering, a real
 *      sort order) — not merely "something rendered".
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

/** Registry slug → the exact tool name the page shell renders as its h1. */
const BATCH: { slug: string; name: string }[] = [
  { slug: "word-count-tool", name: "Word Count Tool" },
  { slug: "character-count-tool", name: "Character Count Tool" },
  { slug: "reading-time-estimator", name: "Reading Time Estimator" },
  { slug: "sentence-count-tool", name: "Sentence Count Tool" },
  { slug: "average-word-length-calculator", name: "Average Word Length Calculator" },
  { slug: "number-format-checker", name: "Number Format Checker" },
  { slug: "locale-date-formatter", name: "Locale Date Formatter" },
  { slug: "number-locale-formatter", name: "Number Locale Formatter" },
  { slug: "rtl-text-tester", name: "RTL Text Tester" },
  { slug: "bidirectional-text-tester", name: "Bidirectional Text Tester" },
  { slug: "unicode-text-normalizer", name: "Unicode Text Normalizer" },
  { slug: "locale-aware-sort-tool", name: "Locale-Aware Sort Tool" },
  { slug: "writing-sprint-timer", name: "Writing Sprint Timer" },
  { slug: "writing-goal-tracker", name: "Writing Goal Tracker" },
  { slug: "flash-fiction-timer", name: "Flash Fiction Timer" },
  { slug: "focus-sentence-highlighter", name: "Focus Sentence Highlighter" },
  { slug: "footnote-formatter", name: "Footnote Formatter" },
  { slug: "distraction-free-writing-editor", name: "Distraction-Free Writing Editor" },
];

test.describe("Writing B1 — page contract", () => {
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

test.describe("Writing B1 — functional results", () => {
  test.setTimeout(60_000);

  test("word-count-tool counts words, characters and sentences", async ({ page }) => {
    await page.goto(`${BASE}/writing/word-count-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("The quick brown fox jumps over the lazy dog.");
    await expect(page.getByTestId("res-words")).toHaveText("9");
    await expect(page.getByTestId("res-characters")).toHaveText("44");
    await expect(page.getByTestId("res-sentences")).toHaveText("1");
    await expect(page.getByTestId("res-paragraphs")).toHaveText("1");
  });

  test("character-count-tool separates with-spaces, no-spaces and UTF-8 bytes", async ({ page }) => {
    await page.goto(`${BASE}/writing/character-count-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("hello");
    await expect(page.getByTestId("res-characters")).toHaveText("5");
    await expect(page.getByTestId("res-no-spaces")).toHaveText("5");
    await expect(page.getByTestId("res-bytes")).toHaveText("5 bytes");

    // "é" as e + combining acute is 2 UTF-16 units, 1 grapheme, 3 UTF-8 bytes.
    await page.getByTestId("in-text").fill("e\u0301");
    await expect(page.getByTestId("res-characters")).toHaveText("2");
    await expect(page.getByTestId("res-graphemes")).toHaveText("1");
    await expect(page.getByTestId("res-bytes")).toHaveText("3 bytes");
  });

  test("reading-time-estimator: 220 words at 220 wpm = 1 min", async ({ page }) => {
    await page.goto(`${BASE}/writing/reading-time-estimator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill(Array.from({ length: 220 }, () => "word").join(" "));
    await expect(page.getByTestId("res-words")).toHaveText("220");
    await expect(page.getByTestId("res-reading")).toHaveText("1 min");

    // Halving the rate doubles the time.
    await page.getByTestId("in-wpm").fill("110");
    await expect(page.getByTestId("res-reading")).toHaveText("2 min");
  });

  test("sentence-count-tool reports sentence count and average words", async ({ page }) => {
    await page.goto(`${BASE}/writing/sentence-count-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("One sentence. Two sentences! Three?");
    await expect(page.getByTestId("res-sentences")).toHaveText("3");
    await expect(page.getByTestId("res-avg-words")).toHaveText("1.67");
  });

  test("average-word-length-calculator: a bb ccc → avg 2, median 2, 6 letters", async ({ page }) => {
    await page.goto(`${BASE}/writing/average-word-length-calculator`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("a bb ccc");
    await expect(page.getByTestId("res-words")).toHaveText("3");
    await expect(page.getByTestId("res-letters")).toHaveText("6");
    await expect(page.getByTestId("res-avg")).toHaveText("2.00");
    await expect(page.getByTestId("res-median")).toHaveText("2");
  });

  test("number-format-checker flags mixed decimal separators", async ({ page }) => {
    await page.goto(`${BASE}/writing/number-format-checker`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("The total is 1,234.56 and the subtotal is 1.234,56.");
    await expect(page.getByTestId("findings")).toContainText("decimal separator");
    await expect(page.getByTestId("numbers-table")).toContainText("1,234.56");
  });

  test("locale-date-formatter renders en-US medium/short for a fixed instant", async ({ page }) => {
    await page.goto(`${BASE}/writing/locale-date-formatter`, { waitUntil: "networkidle" });
    await page.getByTestId("in-date").fill("2026-09-29T13:45");
    await expect(page.getByTestId("res-formatted")).toContainText("Sep 29, 2026");

    // Same instant, German locale: day first and a 24-hour clock.
    await page.getByTestId("in-locale").selectOption("de-DE");
    await expect(page.getByTestId("res-formatted")).toContainText("29.09.2026, 13:45");
  });

  test("number-locale-formatter switches grouping conventions with the locale", async ({ page }) => {
    await page.goto(`${BASE}/writing/number-locale-formatter`, { waitUntil: "networkidle" });
    await page.getByTestId("in-number").fill("1234567.89");
    await expect(page.getByTestId("res-formatted")).toHaveText("1,234,567.89");
    await page.getByTestId("in-locale").selectOption("de-DE");
    await expect(page.getByTestId("res-formatted")).toHaveText("1.234.567,89");
  });

  test("rtl-text-tester detects a right-to-left paragraph", async ({ page }) => {
    await page.goto(`${BASE}/writing/rtl-text-tester`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("مرحبا world");
    await expect(page.getByTestId("res-direction")).toContainText("Right-to-left");
    await expect(page.getByTestId("res-rtl-letters")).toHaveText("5");
    await expect(page.getByTestId("res-ltr-letters")).toHaveText("5");
  });

  test("bidirectional-text-tester wraps a segment in a first-strong isolate", async ({ page }) => {
    await page.goto(`${BASE}/writing/bidirectional-text-tester`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("Hello مرحبا world");
    await page.getByTestId("in-segment").fill("مرحبا");
    // FSI … PDI around the segment, which is replaced in place.
    await expect(page.getByTestId("res-wrapped")).toContainText("Hello \u2068مرحبا\u2069 world");
    await expect(page.getByTestId("res-replaced")).toHaveText("yes");
    await expect(page.getByTestId("res-controls")).toHaveText("2");
  });

  test("unicode-text-normalizer composes e + combining acute to U+00E9", async ({ page }) => {
    await page.goto(`${BASE}/writing/unicode-text-normalizer`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("e\u0301");
    await expect(page.getByTestId("res-normalized")).toHaveText("\u00e9");
    await expect(page.getByTestId("res-changed")).toHaveText("yes");

    // NFD leaves the decomposed pair alone, so nothing changes.
    await page.getByTestId("in-form").selectOption("NFD");
    await expect(page.getByTestId("res-changed")).toHaveText("no");
  });

  test("locale-aware-sort-tool collates differently from code-point order", async ({ page }) => {
    await page.goto(`${BASE}/writing/locale-aware-sort-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-lines").fill("Zebra\napple\nÄrger");

    const collated = (await page.getByTestId("res-sorted").textContent())!.trim().split("\n");
    expect(collated[0]).toBe("apple");
    expect(collated[2]).toBe("Zebra");

    // Raw code-point order puts "Zebra" first and the accented word last.
    const codePoint = (await page.getByTestId("res-codepoint").textContent())!.trim().split("\n");
    expect(codePoint[0]).toBe("Zebra");
    expect(codePoint[2]).toBe("Ärger");
  });

  test("writing-sprint-timer counts words written during the sprint", async ({ page }) => {
    await page.goto(`${BASE}/writing/writing-sprint-timer`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-countdown")).toHaveText("25:00");
    await page.getByTestId("btn-start").click();
    await page.getByTestId("in-draft").fill("one two three");
    await expect(page.getByTestId("res-words")).toHaveText("3");
    await expect(page.getByTestId("res-sprint-words")).toHaveText("3");
    await page.getByTestId("btn-pause").click();
  });

  test("writing-goal-tracker measures progress against the daily goal", async ({ page }) => {
    await page.goto(`${BASE}/writing/writing-goal-tracker`, { waitUntil: "networkidle" });
    await page.getByTestId("in-goal").fill("500");
    await page.getByTestId("in-draft").fill("one two three");
    await expect(page.getByTestId("res-words")).toHaveText("3");
    await expect(page.getByTestId("res-remaining")).toHaveText("497");
    await expect(page.getByTestId("progress-bar")).toBeVisible();
  });

  test("flash-fiction-timer enforces the word limit", async ({ page }) => {
    await page.goto(`${BASE}/writing/flash-fiction-timer`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-countdown")).toHaveText("05:00");
    await page.getByTestId("in-draft").fill("one two three");
    await expect(page.getByTestId("res-words")).toHaveText("3");
    await expect(page.getByTestId("res-remaining-words")).toHaveText("97");
    await expect(page.getByTestId("res-over")).toHaveText("no");
  });

  test("focus-sentence-highlighter steps through sentences", async ({ page }) => {
    await page.goto(`${BASE}/writing/focus-sentence-highlighter`, { waitUntil: "networkidle" });
    await page.getByTestId("in-text").fill("One sentence. Two sentences.");
    await expect(page.getByTestId("res-focused")).toHaveText("One sentence.");
    await expect(page.getByTestId("res-index")).toHaveText("1 of 2");
    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("res-focused")).toHaveText("Two sentences.");
  });

  test("footnote-formatter renumbers the sample body and notes", async ({ page }) => {
    await page.goto(`${BASE}/writing/footnote-formatter`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-markers")).toHaveText("3");
    await expect(page.getByTestId("res-matched")).toHaveText("3");
    await expect(page.locator('pre[data-testid="res-notes"]')).toContainText("Field notes, 12 March");

    // A note whose marker is missing from the body must be reported, not
    // silently dropped: the third note has no marker left in the body.
    await page.getByTestId("in-body").fill("Only one marker here[1] and another[2].");
    await expect(page.getByTestId("res-markers")).toHaveText("2");
    await expect(page.getByTestId("res-warnings")).toContainText("Note 3");
  });

  test("distraction-free-writing-editor counts what you write", async ({ page }) => {
    await page.goto(`${BASE}/writing/distraction-free-writing-editor`, { waitUntil: "networkidle" });
    await page.locator("textarea").first().fill("one two three");
    await expect(page.getByText("3 words")).toBeVisible();
    await expect(page.getByText("13 characters")).toBeVisible();
  });
});
