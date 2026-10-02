/**
 * writing-b23.test.ts — verification of Writing batch B23 (counterargument
 * generator, debate script formatter, IRB consent form template, plagiarism
 * self-check prep tool and writing portfolio builder).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the ten ordered moves and the absolute
 *      wording check, the BP slot placement and the format switch, the consent
 *      element count with its recording language and empty risk section, the
 *      quote report with its uncited quotation, and the portfolio grouping with
 *      its missing year.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "counterargument-generator", name: "Counterargument Generator" },
  { slug: "debate-script-formatter", name: "Debate Script Formatter" },
  { slug: "irb-consent-form-template", name: "IRB Consent Form Template" },
  { slug: "plagiarism-self-check-prep-tool", name: "Plagiarism Self-Check Prep Tool" },
  { slug: "writing-portfolio-builder", name: "Writing Portfolio Builder" },
];

test.describe("Writing B23 — page contract", () => {
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

test.describe("Writing B23 — functional results", () => {
  test.setTimeout(90_000);

  test("counterargument-generator orders the moves and checks the claim", async ({ page }) => {
    await page.goto(`${BASE}/writing/counterargument-generator`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-claim")
      .fill("Remote work always reduces informal knowledge sharing because teams are distributed.");

    await expect(page.getByTestId("res-frames-count")).toHaveText("10");
    await expect(page.getByTestId("res-shape")).toHaveText("Universal");
    await expect(page.getByTestId("res-absolutes")).toHaveText("1");
    await expect(page.getByTestId("res-vague")).toHaveText("0");
    await expect(page.getByTestId("res-frames").locator("li").first()).toContainText("Boundary");
    await expect(page.getByTestId("res-frames").locator("li").first()).toContainText("most relevant");
    await expect(page.getByTestId("res-checks")).toContainText("Absolute wording detected (always)");

    // A policy sentence with no stated reason is flagged for that instead.
    await page.getByTestId("in-claim").fill("The city should ban cars from the centre.");
    await expect(page.getByTestId("res-shape")).toHaveText("Policy");
    await expect(page.getByTestId("res-checks")).toContainText("The claim gives no reason");

    // The move count selector trims the list.
    await page.getByTestId("in-limit").selectOption("4");
    await expect(page.getByTestId("res-frames-count")).toHaveText("4");
    await expect(page.getByTestId("res-frames").locator("li")).toHaveCount(4);
  });

  test("debate-script-formatter places the cases and swaps the order", async ({ page }) => {
    await page.goto(`${BASE}/writing/debate-script-formatter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        [
          "PM | Zoning reform is the fastest route to affordable housing.",
          "LO | Rent controls protect sitting tenants from displacement.",
          "DPM | New supply takes a decade to reach the renters who need it.",
        ].join("\n"),
      );

    await expect(page.getByTestId("res-minutes")).toHaveText("56 min");
    await expect(page.getByTestId("res-filled")).toHaveText("3/8");
    await expect(page.getByTestId("res-format")).toHaveText("British");
    await expect(page.getByTestId("res-script")).toContainText("1. Prime Minister (7:00, pro)");
    await expect(page.getByTestId("res-script")).toContainText(
      "(not drafted) Rebuild the opposition case and extend it with a second argument.",
    );
    await expect(page.getByTestId("res-checks")).toContainText(
      "The con side has no rebuttal speech drafted; a side that only repeats its case loses the exchange.",
    );

    // Switching format re-maps the roles; BP labels do not exist in Public Forum.
    await page.getByTestId("in-format").selectOption("public-forum");
    await expect(page.getByTestId("res-format")).toHaveText("Public");
    await expect(page.getByTestId("res-checks")).toContainText("matches no role in Public Forum");
  });

  test("irb-consent-form-template assembles the elements and notices an empty risk section", async ({ page }) => {
    await page.goto(`${BASE}/writing/irb-consent-form-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("Remote work and informal knowledge sharing");
    await page.getByTestId("in-investigator").fill("Dr A. Researcher");
    await page.getByTestId("in-institution").fill("Northfield University");
    await page
      .getByTestId("in-purpose")
      .fill("We want to understand how remote arrangements change the way teams share knowledge.");
    await page
      .getByTestId("in-procedures")
      .fill("complete a 15 minute questionnaire and take part in one 30 minute interview.");
    await page.getByTestId("in-duration").fill("about 45 minutes in total, across one session.");
    await page
      .getByTestId("in-risks")
      .fill("Some questions ask about your workplace and may feel uncomfortable; the risk is no more than minimal.");
    await page
      .getByTestId("in-benefits")
      .fill("You will receive a summary of the findings and contribute to research on hybrid working.");
    await page.getByTestId("in-confidentiality").fill("Your answers are stored under a study code, not your name.");
    await page.getByTestId("in-contacts").fill("a.researcher@northfield.example or +1 555 0100.");

    await expect(page.getByTestId("res-sections")).toHaveText("10");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-form")).toContainText("Voluntary participation and withdrawal");
    await expect(page.getByTestId("res-form")).toContainText("I voluntarily agree to take part in this study.");

    // The recording switch adds the transcription language.
    await page.getByTestId("in-recording").check();
    await expect(page.getByTestId("res-form")).toContainText("Recordings are transcribed");

    // Emptying the risk section is caught rather than silently omitted.
    await page.getByTestId("in-risks").fill("");
    await expect(page.getByTestId("res-checks-count")).toHaveText("1");
    await expect(page.getByTestId("res-checks")).toContainText("The risk section is empty");
  });

  test("plagiarism-self-check-prep-tool tells cited and uncited quotations apart", async ({ page }) => {
    await page.goto(`${BASE}/writing/plagiarism-self-check-prep-tool`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        'The report argues that "remote work cuts informal contact by a third" (Smith, 2021). It also claims that "hybrid teams keep contact only through scheduled meetings and lose the corridor conversations entirely".',
      );

    await expect(page.getByTestId("res-citations")).toHaveText("1");
    await expect(page.getByTestId("res-uncited")).toHaveText("1");
    await expect(page.getByTestId("res-report")).toContainText("1. 8 words — cited");
    await expect(page.getByTestId("res-report")).toContainText("2. 14 words — NOT cited");
    await expect(page.getByTestId("res-checklist").locator("li")).toHaveCount(5);
    await expect(page.getByTestId("res-checks")).toContainText("1 quotation has no citation");

    // An unclosed quotation mark is reported first.
    await page.getByTestId("in-text").fill('He said "the plan is fine and the budget is settled.');
    await expect(page.getByTestId("res-checks")).toContainText("Quotation marks do not balance");
  });

  test("writing-portfolio-builder groups the pieces and names the missing year", async ({ page }) => {
    await page.goto(`${BASE}/writing/writing-portfolio-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Maya Chen");
    await page.getByTestId("in-positioning").fill("I write about cities and the people who fix them.");
    await page
      .getByTestId("in-pieces")
      .fill(
        [
          "The night bus network | journalism | City Weekly | 2025",
          "Who fixes the streetlights | journalism | City Weekly | 2023",
          "Three lessons from a failed pilot | essays | | 2024",
          "On the ninth floor | fiction | | 2022",
          "The last repair shop | fiction | Lit Mag | 2024",
          "Field notes | newsletter | | 2025",
          "Draft: the flood maps | journalism | |",
        ].join("\n"),
      );

    await expect(page.getByTestId("res-total")).toHaveText("7");
    await expect(page.getByTestId("res-genres")).toHaveText("4");
    await expect(page.getByTestId("res-placed")).toHaveText("3");
    await expect(page.getByTestId("res-selected")).toHaveText("7");
    await expect(page.getByTestId("res-portfolio")).toContainText("Journalism (3)");
    await expect(page.getByTestId("res-portfolio")).toContainText("The night bus network (2025)");
    await expect(page.getByTestId("res-scaffold")).toContainText("Maya Chen writes:");
    await expect(page.getByTestId("res-checks")).toContainText("1 piece has no year: Draft: the flood maps");
  });
});
