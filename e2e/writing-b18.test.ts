/**
 * writing-b18.test.ts — verification of Writing batch B18 (content and
 * marketing continued: the landing page copy builder, the ad copy framework
 * builder, the social post caption builder, the product launch copy builder and
 * the case study template).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the page skeleton and its counts, the PAS
 *      draft and its missing-slot check, the four captions and their limits, the
 *      announcement and its date check, and the study's quantified results.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "landing-page-copy-builder", name: "Landing Page Copy Builder" },
  { slug: "ad-copy-framework-builder", name: "Ad Copy Framework Builder" },
  { slug: "social-post-caption-builder", name: "Social Post Caption Builder" },
  { slug: "product-launch-copy-builder", name: "Product Launch Copy Builder" },
  { slug: "case-study-template", name: "Case Study Template" },
];

test.describe("Writing B18 — page contract", () => {
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

test.describe("Writing B18 — functional results", () => {
  test.setTimeout(90_000);

  test("landing-page-copy-builder assembles the page skeleton and flags a missing hero", async ({ page }) => {
    await page.goto(`${BASE}/writing/landing-page-copy-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-product").fill("Northwind");
    await page.getByTestId("in-headline").fill("Cut first-response time in half");
    await page.getByTestId("in-audience").fill("support teams");
    await page
      .getByTestId("in-benefits")
      .fill("Route every ticket to the right person\nSee the queue before it builds\nReport on response time without spreadsheets");
    await page.getByTestId("in-proof").fill("Teams cut response time 40% in the first month.");
    await page.getByTestId("in-cta").fill("Start a two-week trial");

    await expect(page.getByTestId("res-words")).toHaveText("54");
    await expect(page.getByTestId("res-sections")).toHaveText("5");
    await expect(page.getByTestId("res-benefits")).toHaveText("3");
    await expect(page.getByTestId("res-page")).toContainText("1. Route every ticket to the right person");
    await expect(page.getByTestId("res-page")).toContainText("Next step\nStart a two-week trial");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-headline").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("hero line");
  });

  test("ad-copy-framework-builder reads the offer through PAS and names the empty slot", async ({ page }) => {
    await page.goto(`${BASE}/writing/ad-copy-framework-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-framework").selectOption("pas");
    await page.getByTestId("in-product").fill("Northwind");
    await page.getByTestId("in-audience").fill("support teams");
    await page.getByTestId("in-problem").fill("tickets pile up overnight");
    await page.getByTestId("in-agitate").fill("every hour of delay costs a renewal");
    await page.getByTestId("in-benefit").fill("start the day with an empty queue");
    await page.getByTestId("in-proof").fill("customers cut response time 40% in a month");

    await expect(page.getByTestId("res-words")).toHaveText("35");
    await expect(page.getByTestId("res-draft")).toContainText("Problem: Tickets pile up overnight.");
    await expect(page.getByTestId("res-draft")).toContainText(
      "Solution: Northwind helps support teams start the day with an empty queue.",
    );
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-agitate").fill("");
    await expect(page.getByTestId("res-checks")).toContainText('needs "agitate"');
  });

  test("social-post-caption-builder renders four captions and checks the limits", async ({ page }) => {
    await page.goto(`${BASE}/writing/social-post-caption-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-hook").fill("Your support queue is not a mystery.");
    await page.getByTestId("in-body").fill("We looked at 2,000 tickets to find where response time actually goes.");
    await page.getByTestId("in-hashtags").fill("support, customerservice, ops");
    await page.getByTestId("in-link").fill("https://northwind.example/report");

    await expect(page.getByTestId("res-count")).toHaveText("4");
    await expect(page.getByTestId("res-over")).toHaveText("0");
    await expect(page.getByTestId("res-hashtags")).toHaveText("3");
    await expect(page.getByTestId("res-captions")).toContainText("173 / 280 characters");
    await expect(page.getByTestId("res-captions")).toContainText("Instagram");
    await expect(page.getByTestId("res-checks")).toContainText("Instagram does not make caption links clickable");

    // A body longer than X allows is measured, not truncated silently.
    await page.getByTestId("in-body").fill(Array.from({ length: 60 }, (_, index) => `word${index + 1}`).join(" "));
    await expect(page.getByTestId("res-over")).toHaveText("1");
    await expect(page.getByTestId("res-checks")).toContainText("The X caption runs");
  });

  test("product-launch-copy-builder assembles the announcement and asks for a real date", async ({ page }) => {
    await page.goto(`${BASE}/writing/product-launch-copy-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-product").fill("Northwind Triage");
    await page.getByTestId("in-date").fill("14 April 2026");
    await page.getByTestId("in-audience").fill("support teams of five to fifty");
    await page.getByTestId("in-what").fill("A triage assistant that routes tickets by urgency and owner.");
    await page.getByTestId("in-why").fill("Response time is the number customers quote when they leave.");
    await page.getByTestId("in-cta").fill("Join the early-access list");

    await expect(page.getByTestId("res-words")).toHaveText("48");
    await expect(page.getByTestId("res-copy")).toContainText("Northwind Triage — launching 14 April 2026");
    await expect(page.getByTestId("res-copy")).toContainText("What is new\nA triage assistant that routes tickets by urgency and owner.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    await page.getByTestId("in-date").fill("soon");
    await expect(page.getByTestId("res-checks")).toContainText("contains no date");
  });

  test("case-study-template counts the results and asks for a figure", async ({ page }) => {
    await page.goto(`${BASE}/writing/case-study-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-client").fill("Acme Analytics");
    await page.getByTestId("in-sector").fill("B2B software");
    await page.getByTestId("in-challenge").fill("First-response time doubled in six months.");
    await page
      .getByTestId("in-approach")
      .fill("Interviewed the support agents\nRebuilt the triage rules\nTrained the team on the new queue");
    await page.getByTestId("in-results").fill("First-response time | down 40%\nTicket backlog | 620 to 90");
    await page.getByTestId("in-quote").fill("We stopped guessing which ticket mattered most. — Priya Raman, Support Lead");

    await expect(page.getByTestId("res-words")).toHaveText("53");
    await expect(page.getByTestId("res-results")).toHaveText("2");
    await expect(page.getByTestId("res-quantified")).toHaveText("2/2");
    await expect(page.getByTestId("res-study")).toContainText("Case study: Acme Analytics (B2B software)");
    await expect(page.getByTestId("res-study")).toContainText("Results\n- First-response time: down 40%");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A result with no figure is a compliment, and the check says so.
    await page.getByTestId("in-results").fill("Backlog | unchanged");
    await expect(page.getByTestId("res-quantified")).toHaveText("0/1");
    await expect(page.getByTestId("res-checks")).toContainText("Add a figure");
  });
});
