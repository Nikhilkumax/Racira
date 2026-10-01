/**
 * writing-b13.test.ts — verification of Writing batch B13 (the creative writing
 * tools: dialogue, description, poetry forms, character profiles, conflict).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the dialogue counts, the description
 *      completeness and filter words, the form check, the profile checks and the
 *      conflict's escalation shape.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "dialogue-practice-tool", name: "Dialogue Practice Tool" },
  { slug: "scene-description-builder", name: "Scene Description Builder" },
  { slug: "poetry-form-guide", name: "Poetry Form Guide" },
  { slug: "character-profile-builder", name: "Character Profile Builder" },
  { slug: "conflict-and-resolution-planner", name: "Conflict & Resolution Planner" },
];

const PASSAGE = [
  'Mara: "We should turn back."',
  'Dev: "Not yet — the tide is with us."',
  'Mara: "The tide is the problem," she said quietly.',
  '"Nonsense," Dev barked.',
  '"Are you certain?" she asked.',
].join("\n");

test.describe("Writing B13 — page contract", () => {
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

test.describe("Writing B13 — functional results", () => {
  test.setTimeout(90_000);

  test("dialogue-practice-tool attributes speeches and lists said-bookisms", async ({ page }) => {
    await page.goto(`${BASE}/writing/dialogue-practice-tool`, { waitUntil: "networkidle" });

    await page.getByTestId("in-dialogue").fill(PASSAGE);
    await expect(page.getByTestId("res-lines")).toHaveText("5");
    await expect(page.getByTestId("res-plain-tags")).toHaveText("2");
    await expect(page.getByTestId("res-questions")).toHaveText("1");
    await expect(page.getByTestId("res-adverbs")).toHaveText("1");
    await expect(page.getByTestId("res-bookisms")).toContainText("barked");
    await expect(page.getByTestId("res-speakers")).toContainText("2 speech(es) · 9 words");
    await expect(page.getByTestId("res-longest")).toHaveText("Dev, 7 words");
  });

  test("scene-description-builder scores the prompts and flags filter words", async ({ page }) => {
    await page.goto(`${BASE}/writing/scene-description-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-place").fill("the harbour");
    await page.getByTestId("in-time").fill("dawn");
    await page.getByTestId("in-light").fill("grey");
    await page.getByTestId("in-mood").fill("uneasy");

    await expect(page.getByTestId("res-coverage")).toHaveText("4/8");
    await expect(page.getByTestId("res-missing")).toContainText("Weather");
    await expect(page.getByTestId("res-sheet")).toContainText("Place: the harbour");

    await page.getByTestId("in-passage").fill("She saw the door and heard a noise.");
    await expect(page.getByTestId("res-filter")).toContainText("saw");
    await expect(page.getByTestId("res-filter")).toContainText("heard");
  });

  test("poetry-form-guide measures a draft against the chosen form", async ({ page }) => {
    await page.goto(`${BASE}/writing/poetry-form-guide`, { waitUntil: "networkidle" });

    await page.getByTestId("in-poem").fill("one\ntwo\nthree");
    await expect(page.getByTestId("res-lines")).toHaveText("3/3");
    await expect(page.getByTestId("res-syllables")).toHaveText("1-1-1");
    await expect(page.getByTestId("res-passes")).toHaveText("differs from the form");
    await expect(page.getByTestId("res-notes")).toContainText("Syllables differ");

    await page.getByTestId("in-form").selectOption("free-verse");
    await expect(page.getByTestId("res-passes")).toHaveText("matches the form");
  });

  test("character-profile-builder scores the sheet and flags thin spots", async ({ page }) => {
    await page.goto(`${BASE}/writing/character-profile-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-want").fill("control");
    await page.getByTestId("in-need").fill("Control");

    await expect(page.getByTestId("res-completeness")).toHaveText("3/10");
    await expect(page.getByTestId("res-missing")).toContainText("Arc");
    await expect(page.getByTestId("res-checks")).toContainText("worded identically");
  });

  test("conflict-and-resolution-planner scores the plan and checks the escalation", async ({ page }) => {
    await page.goto(`${BASE}/writing/conflict-and-resolution-planner`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("The ledger");
    await page.getByTestId("in-parties").fill("Mara and Dev");
    await page.getByTestId("in-stakes").fill("the ledger that clears her father");
    await page.getByTestId("in-resolution").fill("Mara gets the ledger");
    await page.getByTestId("in-cost").fill("Dev's trust");
    await page.getByTestId("in-escalation").fill("Mara copies the key\nDev changes the lock\nMara breaks in anyway");

    await expect(page.getByTestId("res-completeness")).toHaveText("8/8");
    await expect(page.getByTestId("res-turns")).toHaveText("3");

    // Dropping the cost and a turn brings the shape notes back.
    await page.getByTestId("in-cost").fill("");
    await page.getByTestId("in-escalation").fill("Mara copies the key\nDev explains the lock");
    await expect(page.getByTestId("res-turns")).toHaveText("2");
    await expect(page.getByTestId("res-notes")).toContainText("Only 2 escalation turn");
    await expect(page.getByTestId("res-notes")).toContainText("no cost");
  });
});
