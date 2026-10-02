/**
 * writing-b17.test.ts — verification of Writing batch B17 (content and
 * marketing: the headline analyzer, the CTA button copy generator, the tagline
 * generator, the email subject line tester and the value proposition builder).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the headline's score and problems, the five
 *      CTA variants, the five tagline patterns, the subject-line rubric, and
 *      the assembled value proposition.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "headline-analyzer", name: "Headline Analyzer" },
  { slug: "cta-button-copy-generator", name: "CTA Button Copy Generator" },
  { slug: "tagline-generator", name: "Tagline Generator" },
  { slug: "email-subject-line-tester", name: "Email Subject Line Tester" },
  { slug: "value-proposition-builder", name: "Value Proposition Builder" },
];

test.describe("Writing B17 — page contract", () => {
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

test.describe("Writing B17 — functional results", () => {
  test.setTimeout(90_000);

  test("headline-analyzer scores the rubric and names the faults", async ({ page }) => {
    await page.goto(`${BASE}/writing/headline-analyzer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-headline").fill("The 7-step guide that saves your team six hours a week");
    await expect(page.getByTestId("res-score")).toHaveText("80");
    await expect(page.getByTestId("res-words")).toHaveText("11");
    await expect(page.getByTestId("res-power")).toHaveText("1");
    await expect(page.getByTestId("res-problems")).toHaveText("0");
    await expect(page.getByTestId("res-parts")).toContainText("Power word");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A flat headline loses the power, number and reader points.
    await page.getByTestId("in-headline").fill("This is a bad headline");
    await expect(page.getByTestId("res-score")).toHaveText("25");
    await expect(page.getByTestId("res-problems")).toHaveText("3");
    await expect(page.getByTestId("res-checks")).toContainText("power word");
  });

  test("cta-button-copy-generator composes five variants and flags a weak verb", async ({ page }) => {
    await page.goto(`${BASE}/writing/cta-button-copy-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-verb").fill("Download");
    await page.getByTestId("in-object").fill("the rota template");
    await page.getByTestId("in-benefit").fill("start this week");

    await expect(page.getByTestId("res-count")).toHaveText("5");
    await expect(page.getByTestId("res-variants")).toContainText("Download the rota template");
    await expect(page.getByTestId("res-variants")).toContainText("Ready to start this week? Download the rota template.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-verb").fill("Submit");
    await expect(page.getByTestId("res-checks")).toContainText("asks the reader for effort");
  });

  test("tagline-generator composes the patterns and flags two benefits", async ({ page }) => {
    await page.goto(`${BASE}/writing/tagline-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-brand").fill("Northwind");
    await page.getByTestId("in-benefit").fill("a calmer inbox");
    await page.getByTestId("in-audience").fill("support teams");

    await expect(page.getByTestId("res-count")).toHaveText("5");
    await expect(page.getByTestId("res-taglines")).toContainText("Northwind. A calmer inbox.");
    await expect(page.getByTestId("res-taglines")).toContainText("For support teams who want a calmer inbox: Northwind.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-benefit").fill("a calmer inbox and fewer tickets");
    await expect(page.getByTestId("res-checks")).toContainText("two benefits");
  });

  test("email-subject-line-tester scores length, triggers and concreteness", async ({ page }) => {
    await page.goto(`${BASE}/writing/email-subject-line-tester`, { waitUntil: "networkidle" });

    await page.getByTestId("in-subject").fill("Your refund in 10 working days");
    await expect(page.getByTestId("res-score")).toHaveText("100");
    await expect(page.getByTestId("res-chars")).toHaveText("30");
    await expect(page.getByTestId("res-words")).toHaveText("6");
    await expect(page.getByTestId("res-spam")).toHaveText("0");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-subject").fill("FREE!!! Act now — limited time offer");
    await expect(page.getByTestId("res-score")).toHaveText("30");
    await expect(page.getByTestId("res-spam")).toHaveText("3");
    await expect(page.getByTestId("res-checks")).toContainText("trigger phrase");
    await expect(page.getByTestId("res-checks")).toContainText("ALL CAPS");
  });

  test("value-proposition-builder assembles the pitch and asks for a figure", async ({ page }) => {
    await page.goto(`${BASE}/writing/value-proposition-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-audience").fill("support teams");
    await page.getByTestId("in-need").fill("are drowning in tickets");
    await page.getByTestId("in-brand").fill("Northwind");
    await page.getByTestId("in-category").fill("help desk");
    await page.getByTestId("in-benefit").fill("cuts first-response time in half");
    await page.getByTestId("in-alternative").fill("a shared inbox");
    await page.getByTestId("in-proof").fill("it routes 90% of tickets to the right person");

    await expect(page.getByTestId("res-words")).toHaveText("32");
    await expect(page.getByTestId("res-proposition")).toContainText(
      "For support teams who are drowning in tickets, Northwind is a help desk that cuts first-response time in half. Unlike a shared inbox, it routes 90% of tickets to the right person.",
    );
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A proof with no figure in it is an adjective in disguise.
    await page.getByTestId("in-proof").fill("it routes tickets to the right person");
    await expect(page.getByTestId("res-checks")).toContainText("no number");
  });
});
