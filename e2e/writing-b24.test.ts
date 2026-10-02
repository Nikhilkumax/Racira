/**
 * writing-b24.test.ts — verification of Writing batch B24 (about page builder,
 * RFP response builder, job description writer, product description writer and
 * terms of service template).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the six assembled sections with their
 *      we-to-you counts, the compliance matrix with its gap and duplicate, the
 *      posting's counts and coded-language check, the benefit pairs and the
 *      audience check, and the agreement's section count with its payments and
 *      refunds pairing.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "about-page-builder", name: "About Page Builder" },
  { slug: "rfp-response-builder", name: "RFP Response Builder" },
  { slug: "job-description-writer", name: "Job Description Writer" },
  { slug: "product-description-writer", name: "Product Description Writer" },
  { slug: "terms-of-service-template", name: "Terms of Service Template" },
];

test.describe("Writing B24 — page contract", () => {
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

test.describe("Writing B24 — functional results", () => {
  test.setTimeout(90_000);

  test("about-page-builder assembles the six sections and counts the pronouns", async ({ page }) => {
    await page.goto(`${BASE}/writing/about-page-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Northfield Repairs");
    await page.getByTestId("in-offer").fill("We fix household appliances the same week you book.");
    await page.getByTestId("in-audience").fill("Homeowners whose washing machine has stopped mid-cycle.");
    await page
      .getByTestId("in-differentiator")
      .fill("One technician sees the job through, and the quote is fixed before work starts.");
    await page
      .getByTestId("in-proof")
      .fill("1,400 repairs completed since 2019\n4.9 average rating across 380 reviews\n90 percent fixed on the first visit");
    await page.getByTestId("in-story").fill("The workshop opened in 2019 after the only repair shop in the district closed.");
    await page.getByTestId("in-cta").fill("Book a slot at northfield.example/book");

    await expect(page.getByTestId("res-we")).toHaveText("2");
    await expect(page.getByTestId("res-you")).toHaveText("2");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-page")).toContainText("Northfield Repairs: We fix household appliances");
    await expect(page.getByTestId("res-page")).toContainText("- 1,400 repairs completed since 2019");

    // Filler displaces the differentiator, and the check says so.
    await page.getByTestId("in-offer").fill("We are a passionate and dedicated team of world-class innovators.");
    await expect(page.getByTestId("res-checks")).toContainText("Filler words detected (passionate, dedicated, world-class)");
  });

  test("rfp-response-builder numbers the matrix and names the gap", async ({ page }) => {
    await page.goto(`${BASE}/writing/rfp-response-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-rfp").fill("Council digital services tender 2026");
    await page.getByTestId("in-deadline").fill("2030-03-01");
    await page
      .getByTestId("in-requirements")
      .fill(
        [
          "Accessibility audit | Approach, section 2",
          "Data migration | Past performance, section 4",
          "Training for 40 staff |",
          "Accessibility audit | Approach, section 2",
        ].join("\n"),
      );
    await page
      .getByTestId("in-understanding")
      .fill("The council needs its services to pass an accessibility audit before the new financial year.");
    await page.getByTestId("in-approach").fill("We audit, fix and retest in four weeks, with a named lead for each service.");
    await page.getByTestId("in-team").fill("Two auditors with public-sector engagements and one migration engineer.");
    await page.getByTestId("in-past").fill("Twelve council migrations since 2021, all delivered inside the audit window.");
    await page.getByTestId("in-pricing").fill("Fixed price of 48,000 for the full scope, quoted against this matrix.");

    await expect(page.getByTestId("res-total")).toHaveText("4");
    await expect(page.getByTestId("res-answered")).toHaveText("3");
    await expect(page.getByTestId("res-gaps")).toHaveText("1");
    await expect(page.getByTestId("res-checks-count")).toHaveText("2");
    await expect(page.getByTestId("res-matrix")).toContainText("R3. Training for 40 staff — GAP: no answer written");
    await expect(page.getByTestId("res-checks")).toContainText("Duplicate requirement wording (accessibility audit)");

    // A deadline in the past is reported plainly.
    await page.getByTestId("in-deadline").fill("2020-01-01");
    await expect(page.getByTestId("res-checks")).toContainText("The deadline (2020-01-01) has passed.");
  });

  test("job-description-writer counts the lists and flags coded language", async ({ page }) => {
    await page.goto(`${BASE}/writing/job-description-writer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("Junior data analyst");
    await page.getByTestId("in-company").fill("Northfield Council");
    await page
      .getByTestId("in-purpose")
      .fill("This role exists to turn service data into the monthly decisions the leadership team makes.");
    await page
      .getByTestId("in-responsibilities")
      .fill(
        [
          "Build the monthly service dashboard",
          "Clean and document the incoming data",
          "Answer ad hoc questions from service leads",
        ].join("\n"),
      );
    await page
      .getByTestId("in-requirements")
      .fill(
        ["Two years working with data", "Strong spreadsheet skills", "Experience preparing written summaries"].join("\n"),
      );
    await page.getByTestId("in-niceToHave").fill("Experience with local government data");
    await page.getByTestId("in-salary").fill("32,000 to 36,000");
    await page.getByTestId("in-location").fill("Hybrid: two days a week in Northfield");
    await page.getByTestId("in-apply").fill("Send a CV and a one page note to jobs@northfield.example by 30 October.");

    await expect(page.getByTestId("res-responsibilities")).toHaveText("3");
    await expect(page.getByTestId("res-requirements")).toHaveText("3");
    await expect(page.getByTestId("res-nice")).toHaveText("1");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-jd")).toContainText("Junior data analyst at Northfield Council");
    await expect(page.getByTestId("res-jd")).toContainText("Pay: 32,000 to 36,000");

    // Coded language is named by word.
    await page.getByTestId("in-title").fill("Growth rockstar");
    await expect(page.getByTestId("res-checks")).toContainText("Coded language detected (rockstar)");
  });

  test("product-description-writer pairs the benefits and needs an audience", async ({ page }) => {
    await page.goto(`${BASE}/writing/product-description-writer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("The Meridian Kettle");
    await page.getByTestId("in-category").fill("a variable-temperature kettle");
    await page.getByTestId("in-audience").fill("tea drinkers who weigh their leaves");
    await page
      .getByTestId("in-features")
      .fill(
        [
          "Six temperature presets | brew green tea at 70 degrees without a thermometer",
          "1.2 litre body | enough for four cups without a refill",
          "Keep-warm hold | the water is ready when the second pot is",
        ].join("\n"),
      );
    await page.getByTestId("in-specs").fill("Stainless steel, 1.2 L, 1,800 W");
    await page.getByTestId("in-proof").fill("4.7 average from 210 reviews, two-year guarantee");
    await page.getByTestId("in-offer").fill("89 with free returns for 30 days");
    await page.getByTestId("in-cta").fill("Choose your finish and add to basket.");

    await expect(page.getByTestId("res-benefits")).toHaveText("3");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-description")).toContainText(
      "The Meridian Kettle is a variable-temperature kettle for tea drinkers who weigh their leaves.",
    );
    await expect(page.getByTestId("res-description")).toContainText(
      "- Six temperature presets — brew green tea at 70 degrees without a thermometer",
    );
    await expect(page.getByTestId("res-description")).toContainText("- 4.7 average from 210 reviews");

    // Without an audience and a proof line, the description is asked for both.
    await page.getByTestId("in-audience").fill("");
    await page.getByTestId("in-proof").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("No audience named");
    await expect(page.getByTestId("res-checks")).toContainText("No proof line");
  });

  test("terms-of-service-template assembles the switches and pairs payments with refunds", async ({ page }) => {
    await page.goto(`${BASE}/writing/terms-of-service-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-service").fill("Ledgerly");
    await page.getByTestId("in-operator").fill("Ledgerly Ltd");
    await page.getByTestId("in-jurisdiction").fill("England and Wales");
    await page.getByTestId("in-effectiveDate").fill("1 November 2026");
    await page.getByTestId("in-contact").fill("legal@ledgerly.example");
    await page.getByTestId("in-privacyUrl").fill("ledgerly.example/privacy");
    await page.getByTestId("in-userContent").check();
    await page.getByTestId("in-payments").check();
    await page.getByTestId("in-refunds").check();
    await page.getByTestId("in-arbitration").check();

    await expect(page.getByTestId("res-sections")).toHaveText("14");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-document")).toContainText("binding arbitration on an individual basis");
    await expect(page.getByTestId("res-document")).toContainText("ledgerly.example/privacy");

    // Turning refunds off leaves the renewal clause unpaired, and the check says so.
    await page.getByTestId("in-refunds").uncheck();
    await expect(page.getByTestId("res-checks")).toContainText(
      "Payments are described without a refund or cancellation clause",
    );
  });
});
