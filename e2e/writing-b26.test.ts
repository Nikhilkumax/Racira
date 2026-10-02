/**
 * writing-b26.test.ts — verification of Writing batch B26 (plot structure
 * planner, genre blender idea tool, ending generator, rich text editor and
 * block-based editor).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the four premise facts on seven beats with
 *      their structure switch, the five fixed scaffolds and the same-genre
 *      check, the six ending shapes with the obstacle check, the rich text
 *      editor's marks, escaping and block kinds, and the block editor's block,
 *      to-do and Markdown counts.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "plot-structure-planner", name: "Plot Structure Planner" },
  { slug: "genre-blender-idea-tool", name: "Genre Blender Idea Tool" },
  { slug: "ending-generator", name: "Ending Generator" },
  { slug: "rich-text-editor", name: "Rich Text Editor" },
  { slug: "block-based-editor", name: "Block-Based Editor" },
];

test.describe("Writing B26 — page contract", () => {
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

test.describe("Writing B26 — functional results", () => {
  test.setTimeout(90_000);

  test("plot-structure-planner anchors the four facts and follows the structure switch", async ({ page }) => {
    await page.goto(`${BASE}/writing/plot-structure-planner`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-logline")
      .fill("A debt collector must return a house to the family she took it from before the bank sells it twice.");
    await page.getByTestId("in-protagonist").fill("A debt collector working the same routes for nine years.");
    await page.getByTestId("in-goal").fill("Return the house before the sale goes through.");
    await page.getByTestId("in-conflict").fill("The bank that pays her salary wants the sale to close.");
    await page
      .getByTestId("in-stakes")
      .fill("If the sale closes, the family joins the waiting list she administers.");

    await expect(page.getByTestId("res-beats")).toHaveText("7");
    await expect(page.getByTestId("res-anchored")).toHaveText("4");
    await expect(page.getByTestId("res-filled")).toHaveText("4");
    await expect(page.getByTestId("res-words")).toHaveText("61");
    await expect(page.getByTestId("res-plan")).toContainText("Three-act structure — A debt collector must return a house");
    await expect(page.getByTestId("res-plan")).toContainText("1. Hook (0%)");
    await expect(page.getByTestId("res-plan")).toContainText("4. Midpoint (50%)");
    await expect(page.getByTestId("res-beat-3")).toContainText("The bank that pays her salary");

    // Switching structure keeps the four anchors on the new beats.
    await page.getByTestId("in-structure").selectOption("hero-journey");
    await expect(page.getByTestId("res-beats")).toHaveText("12");
    await expect(page.getByTestId("res-anchored")).toHaveText("4");

    // A missing fact is named rather than quietly left to the draft.
    await page.getByTestId("in-goal").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("No goal; without something wanted");
  });

  test("genre-blender-idea-tool builds the five scaffolds and refuses one genre twice", async ({ page }) => {
    await page.goto(`${BASE}/writing/genre-blender-idea-tool`, { waitUntil: "networkidle" });

    await page.getByTestId("in-first").selectOption("fantasy");
    await page.getByTestId("in-second").selectOption("science-fiction");
    await page.getByTestId("in-element").fill("a ledger written in two hands");

    await expect(page.getByTestId("res-ideas")).toHaveText("5");
    await expect(page.getByTestId("res-genre-first")).toContainText("a map that redraws itself");
    await expect(page.getByTestId("res-genre-second")).toContainText("a ship running past its rated life");
    await expect(page.getByTestId("res-idea-0")).toContainText(
      "A fantasy story opens on a map that redraws itself; a science fiction story opens on a ship running past its rated life.",
    );
    await expect(page.getByTestId("res-idea-0")).toContainText("a ledger written in two hands");
    await expect(page.getByTestId("res-blend")).toContainText("Collision");
    await expect(page.getByTestId("res-blend")).toContainText("Frame");

    // The same genre twice is not a blend, and the checks say why.
    await page.getByTestId("in-second").selectOption("fantasy");
    await expect(page.getByTestId("res-ideas")).toHaveText("0");
    await expect(page.getByTestId("res-checks")).toContainText("the same genre twice");
  });

  test("ending-generator drafts the six shapes and names a missing obstacle", async ({ page }) => {
    await page.goto(`${BASE}/writing/ending-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-protagonist").fill("Mara");
    await page.getByTestId("in-want").fill("keep the farm solvent through the winter");
    await page.getByTestId("in-obstacle").fill("the bank's new manager");
    await page.getByTestId("in-turn").fill("the recognition that she no longer wants the farm, only the fight");

    await expect(page.getByTestId("res-ideas")).toHaveText("6");
    await expect(page.getByTestId("res-idea-0")).toContainText("1. Full circle");
    await expect(page.getByTestId("res-idea-0")).toContainText("Mara is back in the place the story opened on");
    await expect(page.getByTestId("res-idea-5")).toContainText("6. Quiet return");
    await expect(page.getByTestId("res-idea-5")).toContainText("the recognition that she no longer wants the farm");
    await expect(page.getByTestId("res-idea-1")).toContainText("Requires: A cost the reader saw the protagonist refuse earlier.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // An ending with no force to answer drafts nothing.
    await page.getByTestId("in-obstacle").fill("");
    await expect(page.getByTestId("res-ideas")).toHaveText("0");
    await expect(page.getByTestId("res-checks")).toContainText("No obstacle; without the force that pushed back");
  });

  test("rich-text-editor formats a selection and escapes pasted markup", async ({ page }) => {
    await page.goto(`${BASE}/writing/rich-text-editor`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("res-words")).toHaveText("12");
    await expect(page.getByTestId("res-lines")).toHaveText("2");
    await expect(page.getByTestId("res-marks")).toHaveText("0");
    await expect(page.getByTestId("res-preview")).toContainText("Everything you type stays plain text.");

    const area = page.getByTestId("in-document");
    await area.click();
    await page.keyboard.press("Control+a");
    await page.getByTestId("mark-bold").click();

    await expect(page.getByTestId("res-marks")).toHaveText("2");
    await expect(page.getByTestId("res-formatted")).toHaveText("12");
    await expect(page.getByTestId("res-html")).toContainText("<strong>Everything you type stays plain text.</strong>");
    await expect(page.getByTestId("res-preview")).toContainText("Everything you type stays plain text.");

    // Toggling the same mark removes it again.
    await page.getByTestId("mark-bold").click();
    await expect(page.getByTestId("res-marks")).toHaveText("0");

    // Text that looks like markup is escaped, not interpreted.
    await area.fill("<b>hi</b> & co");
    await expect(page.getByTestId("res-html")).toContainText("&lt;b&gt;hi&lt;/b&gt; &amp; co");
    await expect(page.getByTestId("res-preview")).toContainText("<b>hi</b> & co");

    // The line's block kind renders below the page's own heading level.
    await page.getByTestId("in-kind").selectOption("heading");
    await expect(page.getByTestId("res-html")).toContainText("<h2>");
  });

  test("block-based-editor ticks to-dos, reorders and exports Markdown", async ({ page }) => {
    await page.goto(`${BASE}/writing/block-based-editor`, { waitUntil: "networkidle" });

    await expect(page.getByTestId("res-blocks")).toHaveText("5");
    await expect(page.getByTestId("res-words")).toHaveText("15");
    await expect(page.getByTestId("res-todos")).toHaveText("1/2");
    await expect(page.getByTestId("res-markdown")).toContainText("# Launch page");
    await expect(page.getByTestId("res-markdown")).toContainText("## Field notes");
    await expect(page.getByTestId("res-markdown")).toContainText("- [x] Book the hall");
    await expect(page.getByTestId("res-markdown")).toContainText("- [ ] Print the signs");
    await expect(page.getByTestId("res-outline")).toContainText("Launch page");
    await expect(page.getByTestId("res-outline")).toContainText("- Field notes");

    // A to-do ticks, and the export follows the model.
    await page.getByTestId("in-todo-2").check();
    await expect(page.getByTestId("res-todos")).toHaveText("2/2");
    await expect(page.getByTestId("res-markdown")).toContainText("- [x] Print the signs");

    // Retyping a block changes what the Markdown export can express.
    await page.getByTestId("in-type-0").selectOption("paragraph");
    await expect(page.getByTestId("res-markdown")).not.toContainText("## Field notes");

    // Removing a block and rebuilding the page from pasted text.
    await page.getByTestId("remove-4").click();
    await expect(page.getByTestId("res-blocks")).toHaveText("4");

    await page.getByTestId("in-source").fill("# Agenda\n- [ ] Call the venue\n- [x] Send invites");
    await page.getByTestId("structure-it").click();
    await expect(page.getByTestId("res-blocks")).toHaveText("3");
    await expect(page.getByTestId("res-markdown")).toContainText("# Launch page");
    await expect(page.getByTestId("res-markdown")).toContainText("## Agenda");
    await expect(page.getByTestId("res-todos")).toHaveText("1/2");
  });
});
