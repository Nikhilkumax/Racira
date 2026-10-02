/**
 * writing-b22.test.ts — verification of Writing batch B22 (scientific abstract
 * builder, literature review organizer, academic paper section planner, grant
 * proposal outline and technical report template).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the abstract word count and band check, the
 *      review stance groups and gap checks, the five section budgets, the
 *      grant framework switch and its under-limit mandate, and the report's
 *      filled ratio with its missing required section.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "scientific-abstract-builder", name: "Scientific Abstract Builder" },
  { slug: "literature-review-organizer", name: "Literature Review Organizer" },
  { slug: "academic-paper-section-planner", name: "Academic Paper Section Planner" },
  { slug: "grant-proposal-outline", name: "Grant Proposal Outline" },
  { slug: "technical-report-template", name: "Technical Report Template" },
];

test.describe("Writing B22 — page contract", () => {
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

test.describe("Writing B22 — functional results", () => {
  test.setTimeout(90_000);

  test("scientific-abstract-builder assembles the roles and checks the band", async ({ page }) => {
    await page.goto(`${BASE}/writing/scientific-abstract-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-context").fill("Remote work has grown quickly since 2020.");
    await page.getByTestId("in-gap").fill("How remote arrangements change informal knowledge sharing remains unclear.");
    await page
      .getByTestId("in-approach")
      .fill("We surveyed 412 employees across 9 firms and compared fully remote and hybrid teams.");
    await page
      .getByTestId("in-results")
      .fill("Fully remote teams reported 31 percent fewer informal exchanges per week than hybrid teams.");
    await page
      .getByTestId("in-implication")
      .fill(
        "Remote work appears to reduce informal sharing, which suggests onboarding and mentoring need deliberate structure.",
      );

    await expect(page.getByTestId("res-words")).toHaveText("59");
    await expect(page.getByTestId("res-filled")).toHaveText("5/5");
    await expect(page.getByTestId("res-checks-count")).toHaveText("1");
    await expect(page.getByTestId("res-abstract")).toContainText(
      "Context: Remote work has grown quickly since 2020.",
    );
    await expect(page.getByTestId("res-abstract")).toContainText(
      "Key results: Fully remote teams reported 31 percent",
    );
    await expect(page.getByTestId("res-checks")).toContainText(
      "59 words is outside the usual 200-300 band for a scientific abstract",
    );

    // Unlabelled drops the role names without changing the word count.
    await page.getByTestId("in-labelled").uncheck();
    await expect(page.getByTestId("res-abstract")).not.toContainText("Context:");
    await expect(page.getByTestId("res-words")).toHaveText("59");
  });

  test("literature-review-organizer groups by stance and names the gaps", async ({ page }) => {
    await page.goto(`${BASE}/writing/literature-review-organizer`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        [
          "Smith (2021) | remote work cuts informal contact by a third | supports",
          "Jones (2019) | no measurable effect on knowledge sharing | challenges",
          "Chen (2022) | hybrid arrangements extend the question to mentoring | extends",
        ].join("\n"),
      );

    await expect(page.getByTestId("res-sources")).toHaveText("3");
    await expect(page.getByTestId("res-agree")).toHaveText("1");
    await expect(page.getByTestId("res-disagree")).toHaveText("1");
    await expect(page.getByTestId("res-extend")).toHaveText("1");
    await expect(page.getByTestId("res-scaffold")).toContainText("Agrees — The evidence consistently shows");
    await expect(page.getByTestId("res-scaffold")).toContainText(
      "Smith (2021): remote work cuts informal contact by a third",
    );
    await expect(page.getByTestId("res-prompts").locator("li")).toHaveCount(4);

    // A list with no stances and no dates is what the checks exist for.
    await page
      .getByTestId("in-text")
      .fill(
        [
          "Smith | remote work cuts contact",
          "Jones | hybrid teams keep contact",
          "Chen | mentoring suffers remotely",
        ].join("\n"),
      );

    await expect(page.getByTestId("res-checks")).toContainText("3 sources have no year: Smith, Jones, Chen.");
    await expect(page.getByTestId("res-checks")).toContainText("1 finding is under four words");
    await expect(page.getByTestId("res-checks")).toContainText("No source disagrees with any other");
    await expect(page.getByTestId("res-checks")).toContainText("No source has a stated stance");
  });

  test("academic-paper-section-planner splits the budget and flags a short paper", async ({ page }) => {
    await page.goto(`${BASE}/writing/academic-paper-section-planner`, { waitUntil: "networkidle" });

    await page.getByTestId("in-question").fill("Does remote work change informal knowledge sharing?");
    await page.getByTestId("in-method").fill("Survey of 412 employees across 9 firms.");
    await page
      .getByTestId("in-contribution")
      .fill("The first estimate of informal exchange frequency by working arrangement.");

    await expect(page.getByTestId("res-total")).toHaveText("6000");
    await expect(page.getByTestId("res-introduction")).toHaveText("900");
    await expect(page.getByTestId("res-methods")).toHaveText("1200");
    await expect(page.getByTestId("res-results")).toHaveText("1800");
    await expect(page.getByTestId("res-discussion")).toHaveText("1800");
    await expect(page.getByTestId("res-conclusion")).toHaveText("300");
    await expect(page.getByTestId("res-outline")).toContainText("Methods — about 1200 words");
    await expect(page.getByTestId("res-question")).toHaveText("stated");

    // A budget that cannot carry a repeatable study is called out.
    await page.getByTestId("in-total").fill("1500");
    await expect(page.getByTestId("res-methods")).toHaveText("300");
    await expect(page.getByTestId("res-checks")).toContainText(
      "1500 words is short for a research article; sections may be squeezed.",
    );
  });

  test("grant-proposal-outline assembles a framework and checks the mandate", async ({ page }) => {
    await page.goto(`${BASE}/writing/grant-proposal-outline`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-significance")
      .fill("Rural clinics lose 40 percent of referrals to travel distance, and 1.2 million patients are affected.");
    await page
      .getByTestId("in-innovation")
      .fill("A shared scheduling protocol has not been tested outside urban networks.");
    await page
      .getByTestId("in-approach")
      .fill("We will trial the protocol in 12 clinics over 18 months against matched controls.");
    await page
      .getByTestId("in-evaluation")
      .fill("Referral completion will be measured quarterly and compared with the matched group.");
    await page
      .getByTestId("in-budget")
      .fill("Two coordinators at 0.5 FTE, software licences and travel for the site visits.");

    await expect(page.getByTestId("res-words")).toHaveText("66");
    await expect(page.getByTestId("res-filled")).toHaveText("5/5");
    await expect(page.getByTestId("res-framework")).toHaveText("Significance");
    await expect(page.getByTestId("res-checks-count")).toHaveText("1");
    await expect(page.getByTestId("res-outline")).toContainText(
      "Significance, Innovation, Approach — 66 of 2500 words",
    );
    await expect(page.getByTestId("res-checks")).toContainText(
      "66 words is well under the 2500-word limit",
    );

    // Switching framework swaps the sections wholesale; the budget field is
    // shared by id across frameworks, so its text carries over.
    await page.getByTestId("in-framework").selectOption("generic");
    await expect(page.getByTestId("res-filled")).toHaveText("1/6");
    await expect(page.getByTestId("res-framework")).toHaveText("Generic proposal outline");
    await expect(page.getByTestId("res-checks-count")).toHaveText("6");
  });

  test("technical-report-template assembles the report and notices a missing section", async ({ page }) => {
    await page.goto(`${BASE}/writing/technical-report-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("Review of the onboarding pipeline");
    await page.getByTestId("in-audience").fill("the operations board");
    await page
      .getByTestId("in-summary")
      .fill("Onboarding takes 11 days against a target of 5. The delay is concentrated in account provisioning.");
    await page
      .getByTestId("in-scope")
      .fill(
        "This report covers the account provisioning stage for the operations board; payroll onboarding was not examined.",
      );
    await page
      .getByTestId("in-findings")
      .fill("Median time to provision was 6 working days, measured across 240 accounts from the access log.");
    await page
      .getByTestId("in-risks")
      .fill("The provisioning data covers one quarter and may not reflect the new vendor process.");
    await page
      .getByTestId("in-recommendations")
      .fill("Move provisioning to the automated workflow by Q3, owner Priya.");

    await expect(page.getByTestId("res-words")).toHaveText("72");
    await expect(page.getByTestId("res-filled")).toHaveText("5/7");
    await expect(page.getByTestId("res-missing-count")).toHaveText("0");
    await expect(page.getByTestId("res-checks-count")).toHaveText("0");
    await expect(page.getByTestId("res-report")).toContainText("1. Summary");

    // Emptying a required section brings the report back to one visible gap.
    await page.getByTestId("in-recommendations").fill("");
    await expect(page.getByTestId("res-missing-count")).toHaveText("1");
    await expect(page.getByTestId("res-checks-count")).toHaveText("1");
    await expect(page.getByTestId("res-checks")).toContainText("Recommendations is required and empty.");
  });
});
