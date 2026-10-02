/**
 * writing-b19.test.ts — verification of Writing batch B19 (creative writing:
 * the story idea generator, the world building template, the writing prompt
 * generator, the villain motivation builder and the first line generator).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the assembled premise and its variants, the
 *      world bible and its filled count, the prompt bank's fixed order, the
 *      villain profile, and the first-line candidates with the borrowed-move
 *      checker.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "story-idea-generator", name: "Story Idea Generator" },
  { slug: "world-building-template", name: "World Building Template" },
  { slug: "writing-prompt-generator", name: "Writing Prompt Generator" },
  { slug: "villain-motivation-builder", name: "Villain Motivation Builder" },
  { slug: "first-line-generator", name: "First Line Generator" },
];

test.describe("Writing B19 — page contract", () => {
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

test.describe("Writing B19 — functional results", () => {
  test.setTimeout(90_000);

  test("story-idea-generator assembles the premise and spins the variants", async ({ page }) => {
    await page.goto(`${BASE}/writing/story-idea-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-genre").fill("noir");
    await page.getByTestId("in-protagonist").fill("Mara");
    await page.getByTestId("in-want").fill("to buy back her father's shop");
    await page.getByTestId("in-obstacle").fill("the buyer is her brother");
    await page.getByTestId("in-setting").fill("a flooded river town");

    await expect(page.getByTestId("res-words")).toHaveText("21");
    await expect(page.getByTestId("res-completeness")).toHaveText("4/4");
    await expect(page.getByTestId("res-variants-count")).toHaveText("4");
    await expect(page.getByTestId("res-premise")).toHaveText(
      "Mara wants to buy back her father's shop, but the buyer is her brother. (noir, set in a flooded river town.)",
    );
    await expect(page.getByTestId("res-variants")).toContainText(
      "What if the buyer is her brother is right?",
    );
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-setting").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("Add a setting");
  });

  test("world-building-template assembles the bible and counts the areas", async ({ page }) => {
    await page.goto(`${BASE}/writing/world-building-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Vess");
    await page.getByTestId("in-premise").fill("A river town that floods on the same day each year.");
    await page.getByTestId("in-geography").fill("Built on two banks that slowly trade places.");
    await page.getByTestId("in-culture").fill("Flood week is a festival and a reckoning.");
    await page.getByTestId("in-politics").fill("The dam council holds every seat and every grudge.");
    await page.getByTestId("in-economy").fill("Boat repair, insurance and smuggled grain.");
    await page.getByTestId("in-rules").fill("The flood is predictable to the hour and never to the metre.");
    await page.getByTestId("in-history").fill("The old town is under the reservoir and still on the maps.");
    await page.getByTestId("in-conflicts").fill("The council needs the dam; the lower town needs it open.");

    await expect(page.getByTestId("res-words")).toHaveText("90");
    await expect(page.getByTestId("res-filled")).toHaveText("7/7");
    await expect(page.getByTestId("res-problems")).toHaveText("0");
    await expect(page.getByTestId("res-bible")).toContainText("World: Vess\nA river town that floods on the same day each year.");
    await expect(page.getByTestId("res-bible")).toContainText("Conflicts\nThe council needs the dam; the lower town needs it open.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // The conflict is the question that turns a setting into a story.
    await page.getByTestId("in-conflicts").fill("");
    await expect(page.getByTestId("res-filled")).toHaveText("6/7");
    await expect(page.getByTestId("res-checks")).toContainText("conflict the world is built around");
  });

  test("writing-prompt-generator serves the fixed bank in order", async ({ page }) => {
    await page.goto(`${BASE}/writing/writing-prompt-generator`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("res-count")).toHaveText("6");
    await expect(page.getByTestId("res-prompts")).toContainText("Write about someone who apologises before they are accused.");

    await page.getByTestId("btn-next").click();
    await expect(page.getByTestId("res-prompts")).toContainText("Write about someone whose greatest skill is also their worst habit.");
    await expect(page.getByTestId("res-prompts")).not.toContainText("Write about someone who apologises before they are accused.");

    await page.getByTestId("btn-reset").click();
    await expect(page.getByTestId("res-prompts")).toContainText("Write about someone who apologises before they are accused.");

    // Switching category resets the cycle and swaps the bank.
    await page.getByTestId("in-category").selectOption("conflict");
    await expect(page.getByTestId("res-prompts")).toContainText("Two people want the same thing, and one of them deserves it.");
  });

  test("villain-motivation-builder assembles the profile and asks for the limit", async ({ page }) => {
    await page.goto(`${BASE}/writing/villain-motivation-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-villain").fill("Councillor Voss");
    await page.getByTestId("in-want").fill("to keep the dam closed");
    await page.getByTestId("in-wound").fill("her town was flooded when she was nine");
    await page.getByTestId("in-justification").fill("the lower town can move, the reservoir cannot");
    await page.getByTestId("in-method").fill("she buys votes with grain and never threatens twice");
    await page.getByTestId("in-limit").fill("she will not flood a house she has slept in");
    await page.getByTestId("in-self-story").fill("the only adult in a room of children");

    await expect(page.getByTestId("res-words")).toHaveText("64");
    await expect(page.getByTestId("res-filled")).toHaveText("7/7");
    await expect(page.getByTestId("res-problems")).toHaveText("0");
    await expect(page.getByTestId("res-profile")).toContainText("Villain: Councillor Voss\nWants: to keep the dam closed");
    await expect(page.getByTestId("res-profile")).toContainText("Line they will not cross\nshe will not flood a house she has slept in");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-limit").fill("");
    await expect(page.getByTestId("res-filled")).toHaveText("6/7");
    await expect(page.getByTestId("res-checks")).toContainText("line they will not cross");
  });

  test("first-line-generator composes candidates and checks a borrowed move", async ({ page }) => {
    await page.goto(`${BASE}/writing/first-line-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-character").fill("Mara");
    await page.getByTestId("in-place").fill("Vess");

    await expect(page.getByTestId("res-count")).toHaveText("4");
    await expect(page.getByTestId("res-lines")).toContainText("Mara arrived in Vess with a suitcase and no reason anyone believed.");
    await expect(page.getByTestId("res-lines")).toContainText("The first rule of Vess was not to ask. Mara asked.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A weather opening is the move the own-line checker exists to catch.
    await page.getByTestId("in-own-line").fill("It was a dark and stormy night.");
    await expect(page.getByTestId("res-checks")).toContainText("Opening on the weather");

    // The strange register re-renders the candidates.
    await page.getByTestId("in-tone").selectOption("strange");
    await expect(page.getByTestId("res-lines")).toContainText("The morning Mara arrived, Vess had one street fewer than the map showed.");
  });
});
