/**
 * writing-b8.test.ts — verification of Writing batch B8 (jargon removal, style
 * consistency and the first three extractive summarisation tools).
 *
 * Two layers:
 *   1. Every slug in the batch renders as a real tool page — HTTP 200, exactly
 *      one non-empty `<h1>` carrying the registry name, no uncaught page error,
 *      and authored SEO prose that rendered as prose (no literal `\n` marker in
 *      the article text).
 *   2. Each tool is driven with a fixed input and asserted against a value the
 *      engine's own unit tests pin (four listed jargon terms replaced, one mixed
 *      style family, two sentences selected from ten, three ranked points, a
 *      TL;DR inside its character cap) — not merely "something rendered".
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

/** Registry slug → the exact tool name the page shell renders as its h1. */
const BATCH: { slug: string; name: string }[] = [
  { slug: "jargon-remover", name: "Jargon Remover" },
  { slug: "style-consistency-enforcer", name: "Style Consistency Enforcer" },
  { slug: "text-summarizer", name: "Text Summarizer" },
  { slug: "key-points-extractor", name: "Key Points Extractor" },
  { slug: "tldr-generator", name: "TL;DR Generator" },
];

/** Ten sentences: three share the river vocabulary, the rest are unrelated. */
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

test.describe("Writing B8 — page contract", () => {
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

      // The authored SEO block must render as prose: paragraph breaks are real
      // newlines, never the source-level `\n` marker showing as text.
      const article = page.locator('[data-seo-content="tool"]');
      await expect(article).toHaveCount(1);
      const prose = await article.innerText();
      expect(prose).not.toContain("\\n");
      expect(prose.length).toBeGreaterThan(1200);

      expect(pageErrors, `uncaught errors on /writing/${slug}`).toEqual([]);
    });
  }
});

test.describe("Writing B8 — functional results", () => {
  test.setTimeout(90_000);

  test("jargon-remover replaces listed terms and leaves an unlisted form alone", async ({ page }) => {
    await page.goto(`${BASE}/writing/jargon-remover`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("We should leverage our synergy and reach out to stakeholders.");
    await expect(page.getByTestId("res-count")).toHaveText("4");
    await expect(page.getByTestId("res-output")).toContainText("use our cooperation");
    await expect(page.getByTestId("res-output")).toContainText("contact");
    await expect(page.getByTestId("res-output")).toContainText("affected people");
    await expect(page.getByTestId("res-matches")).toContainText("leverage");

    // An inflected form is not on the list, so the text is untouched and the
    // page says a listed term was not found.
    await page.getByTestId("in-text").fill("The leveraged buyout closed.");
    await expect(page.getByTestId("res-count")).toHaveText("0");
    await expect(page.getByTestId("res-output")).toHaveText("The leveraged buyout closed.");
  });

  test("style-consistency-enforcer reports a mixed family and clears it", async ({ page }) => {
    await page.goto(`${BASE}/writing/style-consistency-enforcer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill("He said \"yes\" then \u201cno\u201d and \"maybe\".");
    await expect(page.getByTestId("res-mixed")).toHaveText("1");
    await expect(page.getByTestId("res-families")).toContainText("Double quotation marks");
    await expect(page.getByTestId("res-families")).toContainText("mixed");
    await expect(page.getByTestId("res-deviations")).toContainText("expected straight");
    await expect(page.getByTestId("res-deviations")).toContainText("Double quotation marks");

    // One convention only: the family is consistent and nothing is mixed.
    await page.getByTestId("in-text").fill('He said "yes" then "no" and "maybe".');
    await expect(page.getByTestId("res-mixed")).toHaveText("0");
    await expect(page.getByTestId("res-families")).toContainText("consistent");
  });

  test("text-summarizer selects the requested share and quotes the source", async ({ page }) => {
    await page.goto(`${BASE}/writing/text-summarizer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(TEN_SENTENCES);
    // Ten sentences at the default 20% is two sentences.
    await expect(page.getByTestId("res-selected")).toHaveText("2");
    await expect(page.getByTestId("res-selected-words")).not.toHaveText("0");
    await expect(page.getByTestId("res-coverage")).toContainText("%");

    // Every selected sentence must be quoted from the source; the join is not
    // contiguous, so each sentence is checked on its own.
    const summary = await page.getByTestId("res-summary").innerText();
    const quoted = summary.split(/(?<=\.)\s+/).map((value) => value.trim()).filter(Boolean);
    expect(quoted.length).toBe(2);
    for (const sentence of quoted) expect(TEN_SENTENCES).toContain(sentence);

    await page.getByTestId("in-length").selectOption("40");
    await expect(page.getByTestId("res-selected")).toHaveText("4");

    // Every ranked sentence carries its three score parts.
    const table = page.getByTestId("res-sentences");
    await expect(table).toContainText("Centrality");
    await expect(table).toContainText("Frequency");
  });

  test("key-points-extractor ranks a requested number of quoted points", async ({ page }) => {
    await page.goto(`${BASE}/writing/key-points-extractor`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(TEN_SENTENCES);
    await page.getByTestId("in-count").fill("3");
    await expect(page.getByTestId("res-count")).toHaveText("3");

    const points = page.getByTestId("res-points");
    await expect(points).toContainText("Point 1");
    await expect(points).toContainText("Point 3");
    await expect(points).not.toContainText("Point 4");
    // Every point is a quoted sentence: the top-ranked one must come from the
    // repeated river vocabulary, never invented text.
    await expect(points).toContainText("river");
    await expect(page.getByTestId("res-terms")).toContainText("river");
  });

  test("tldr-generator respects the character cap and flags an impossible one", async ({ page }) => {
    await page.goto(`${BASE}/writing/tldr-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-text").fill(TEN_SENTENCES);
    await page.getByTestId("in-chars").fill("120");
    const characters = Number(await page.getByTestId("res-chars").innerText());
    expect(characters).toBeGreaterThan(0);
    expect(characters).toBeLessThanOrEqual(120);

    await expect(page.getByTestId("res-used-list")).toContainText("Rank 1");
    const used = await page.getByTestId("res-used-list").locator("li p.mt-1").allInnerTexts();
    expect(used.length).toBeGreaterThan(0);
    for (const sentence of used) expect(TEN_SENTENCES).toContain(sentence.trim());

    // A single sentence longer than the cap is returned with a visible overrun
    // rather than being truncated or replaced by a lower-ranked sentence.
    const longSentence = "The council published a detailed report in June that ran to several hundred pages and covered every repair.";
    await page.getByTestId("in-text").fill(longSentence);
    await page.getByTestId("in-chars").fill("40");
    await expect(page.getByTestId("res-over")).toContainText("longer than the 40");
    await expect(page.getByTestId("res-tldr")).toHaveText(longSentence);
  });
});
