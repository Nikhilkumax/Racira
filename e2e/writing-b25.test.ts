/**
 * writing-b25.test.ts — verification of Writing batch B25 (sales page
 * copywriting tool, testimonial formatter, brand voice guide builder, microcopy
 * library and privacy policy template).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the nine sales blocks with their counts and
 *      missing-problem check, the wall and carousel selections, the guide's
 *      attribute counts and banned-sample check, the twelve microcopy slots in
 *      the friendly register and the formal jargon check, and the privacy
 *      notice's section count with its missing-purpose check.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "sales-page-copywriting-tool", name: "Sales Page Copywriting Tool" },
  { slug: "testimonial-formatter", name: "Testimonial Formatter" },
  { slug: "brand-voice-guide-builder", name: "Brand Voice Guide Builder" },
  { slug: "microcopy-library", name: "Microcopy Library" },
  { slug: "privacy-policy-template", name: "Privacy Policy Template" },
];

test.describe("Writing B25 — page contract", () => {
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

test.describe("Writing B25 — functional results", () => {
  test.setTimeout(90_000);

  test("sales-page-copywriting-tool assembles the nine blocks and checks the problem", async ({ page }) => {
    await page.goto(`${BASE}/writing/sales-page-copywriting-tool`, { waitUntil: "networkidle" });

    await page.getByTestId("in-product").fill("Meridian Kettle");
    await page.getByTestId("in-audience").fill("tea drinkers who weigh their leaves");
    await page
      .getByTestId("in-promise")
      .fill("Brew green tea at the temperature it was grown for, every morning, without a thermometer.");
    await page.getByTestId("in-problem").fill("Most kettles boil to one temperature, so delicate tea scalds and turns bitter.");
    await page
      .getByTestId("in-mechanism")
      .fill("Six presets hold the water at the temperature each tea needs and keep it there for the second pot.");
    await page
      .getByTestId("in-benefits")
      .fill("Green tea stops tasting bitter\nFour cups without a refill\nNo thermometer, no guessing");
    await page
      .getByTestId("in-proof")
      .fill("4.7 average from 210 reviews\n1,200 kettles shipped since 2024\nTwo-year guarantee");
    await page
      .getByTestId("in-objections")
      .fill(
        [
          "Is it hard to clean? | The body is stainless steel and the lid lifts off.",
          "Does it hold heat? | Keep-warm holds for 30 minutes.",
          "Is it worth the price? | It replaces a thermometer and a second pot.",
        ].join("\n"),
      );
    await page.getByTestId("in-offer").fill("89 with free returns for 30 days and a two-year guarantee.");
    await page.getByTestId("in-guarantee").fill("If the temperature drifts, we replace the kettle within two years.");
    await page.getByTestId("in-cta").fill("Choose your finish and add to basket.");

    await expect(page.getByTestId("res-benefits")).toHaveText("3");
    await expect(page.getByTestId("res-objections")).toHaveText("3");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-page")).toContainText("- Is it hard to clean? — The body is stainless steel");
    await expect(page.getByTestId("res-page")).toContainText("The close");

    // The problem block is the one that decides the reading, and its absence is named.
    await page.getByTestId("in-problem").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("No problem stated");
  });

  test("testimonial-formatter builds the wall, the carousel and the pull quote", async ({ page }) => {
    await page.goto(`${BASE}/writing/testimonial-formatter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        [
          "The kettle holds 70 degrees for a whole pot of green tea | Maya Chen | tea buyer",
          "Great service and highly recommend this to anyone who loves tea | Sam Ortiz |",
          "I measured the temperature with a probe thermometer and it was within one degree across four sessions, which is why I stopped using my old kettle for green tea entirely | Priya Raman | cafe owner",
          "The kettle holds 70 degrees and my second pot tastes as good as the first | Alex Doe | writer",
        ].join("\n"),
      );

    await expect(page.getByTestId("res-total")).toHaveText("4");
    await expect(page.getByTestId("res-attributed")).toHaveText("4");
    await expect(page.getByTestId("res-slide-ready")).toHaveText("3");
    await expect(page.getByTestId("res-checks-count")).toHaveText("2");
    await expect(page.getByTestId("res-formatted")).toContainText("— Maya Chen, tea buyer");
    await expect(page.getByTestId("res-formatted")).toContainText("— Priya Raman, cafe owner");
    await expect(page.getByTestId("res-slides")).toContainText('"The kettle holds 70 degrees for a whole pot of green tea" — Maya Chen');
    await expect(page.getByTestId("res-pull")).toContainText("I measured the temperature");
    await expect(page.getByTestId("res-checks")).toContainText("could describe any business");
  });

  test("brand-voice-guide-builder documents the guide and tests the sample", async ({ page }) => {
    await page.goto(`${BASE}/writing/brand-voice-guide-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-brand").fill("Meridian");
    await page
      .getByTestId("in-audience")
      .fill("people who care how their tea tastes but not about gadgets");
    await page
      .getByTestId("in-attributes")
      .fill(
        [
          "Precise | we give the temperature, never the adjective",
          "Plain | short sentences, kitchen words, no specification sheets",
          "Warm | the reader is a host, not a user",
        ].join("\n"),
      );
    await page.getByTestId("in-doSay").fill("at 70 degrees\nready when you are\nsecond pot");
    await page.getByTestId("in-dontSay").fill("utilisation\nartisanal\nsynergy");
    await page.getByTestId("in-sample").fill("Green tea wants 70 degrees. Set the dial, pour, and the second pot tastes like the first.");

    await expect(page.getByTestId("res-attributes")).toHaveText("3");
    await expect(page.getByTestId("res-say")).toHaveText("3");
    await expect(page.getByTestId("res-dontsay")).toHaveText("3");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-guide")).toContainText("- Precise: we give the temperature, never the adjective");

    // The sample is checked against the guide it demonstrates.
    await page
      .getByTestId("in-sample")
      .fill("Our artisanal approach leverages decades of experience in order to deliver a seamless tea experience.");
    await expect(page.getByTestId("res-checks")).toContainText("banned phrasing (artisanal)");
  });

  test("microcopy-library drafts the twelve slots and flags jargon", async ({ page }) => {
    await page.goto(`${BASE}/writing/microcopy-library`, { waitUntil: "networkidle" });

    await page.getByTestId("in-product").fill("Meridian");
    await page.getByTestId("in-object").fill("report");
    await page.getByTestId("in-action").fill("create a report");
    await page.getByTestId("in-tone").selectOption("friendly");

    await expect(page.getByTestId("res-slots")).toHaveText("12");
    await expect(page.getByTestId("res-tone")).toHaveText("Friendly");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-library")).toContainText("Create a report");
    await expect(page.getByTestId("res-library")).toContainText("We couldn't create a report.");
    await expect(page.getByTestId("res-library")).toContainText("Report created — nice work.");

    // Jargon in the writer's own action wording is caught by the checks.
    await page.getByTestId("in-action").fill("utilize the system!");
    await page.getByTestId("in-tone").selectOption("formal");
    await expect(page.getByTestId("res-checks")).toContainText("Jargon detected (utilize)");
    await expect(page.getByTestId("res-checks")).toContainText("An exclamation mark appears in the copy");
  });

  test("privacy-policy-template assembles the notice and names a missing purpose", async ({ page }) => {
    await page.goto(`${BASE}/writing/privacy-policy-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-service").fill("Ledgerly");
    await page.getByTestId("in-operator").fill("Ledgerly Ltd");
    await page.getByTestId("in-contact").fill("privacy@ledgerly.example");
    await page.getByTestId("in-jurisdiction").fill("England");
    await page.getByTestId("in-effectiveDate").fill("1 November 2026");
    await page.getByTestId("in-categories").fill("Account details\nUsage data");
    await page.getByTestId("in-purposes").fill("Provide the service\nPrevent fraud");
    await page.getByTestId("in-retention").fill("24 months");
    await page.getByTestId("in-thirdParties").fill("Hosting provider\nPayment processor");
    await page.getByTestId("in-cookies").check();
    await page.getByTestId("in-transfers").check();
    await page.getByTestId("in-marketing").check();
    await page.getByTestId("in-children").check();
    await page.getByTestId("in-automated").check();
    await page.getByTestId("in-childrenAge").fill("13");

    await expect(page.getByTestId("res-sections")).toHaveText("13");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-document")).toContainText("We keep personal data for 24 months");
    await expect(page.getByTestId("res-document")).toContainText("unsubscribe link");
    await expect(page.getByTestId("res-document")).toContainText("human review");

    // Collection without a purpose is the finding the checks lead with.
    await page.getByTestId("in-purposes").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("No purposes stated");
  });
});
