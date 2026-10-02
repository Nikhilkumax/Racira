/**
 * writing-b15.test.ts — verification of Writing batch B15 (templates and
 * generators: the cover letter builder, the resume writer, the bio generator,
 * the author profile writer and the press release template).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the assembled letter and its word count, the
 *      resume's sections and quantified entries, the three bio lengths, the
 *      profile's works and words, and the release's dateline, quote and lead.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "cover-letter-builder", name: "Cover Letter Builder" },
  { slug: "resume-writer", name: "Resume Writer" },
  { slug: "bio-generator", name: "Bio Generator" },
  { slug: "author-profile-writer", name: "Author Profile Writer" },
  { slug: "press-release-template", name: "Press Release Template" },
];

test.describe("Writing B15 — page contract", () => {
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

test.describe("Writing B15 — functional results", () => {
  test.setTimeout(90_000);

  test("cover-letter-builder assembles the letter and flags a missing name", async ({ page }) => {
    await page.goto(`${BASE}/writing/cover-letter-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Ada Lovelace");
    await page.getByTestId("in-role").fill("support engineer");
    await page.getByTestId("in-company").fill("Acme Analytics");
    await page
      .getByTestId("in-strengths")
      .fill("I ran a two-person support desk\nI write clear bug reports\nI cut first-response time from two days to four hours");
    await page.getByTestId("in-closing").fill("I would welcome a short call next week.");

    await expect(page.getByTestId("res-words")).toHaveText("60");
    await expect(page.getByTestId("res-letter")).toContainText("Dear Acme Analytics hiring team,");
    await expect(page.getByTestId("res-letter")).toContainText(
      "What I would bring to Acme Analytics: I ran a two-person support desk; I write clear bug reports; and I cut first-response time from two days to four hours.",
    );
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // Removing the name brings the structural prompt back.
    await page.getByTestId("in-name").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("Add your name");
  });

  test("resume-writer counts sections and quantified entries", async ({ page }) => {
    await page.goto(`${BASE}/writing/resume-writer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Ada Lovelace");
    await page.getByTestId("in-title").fill("Support Engineer");
    await page.getByTestId("in-contact").fill("ada@example.com · Bristol");
    await page.getByTestId("in-summary").fill("Support engineer with six years in B2B software.");
    await page
      .getByTestId("in-experience")
      .fill(
        "Support Engineer | Acme Analytics | 2021–present | Cut first-response time 40% across 2,000 tickets\nSupport Associate | Beta Softworks | 2018–2021 | Handled a queue of 60 calls a week",
      );
    await page.getByTestId("in-education").fill("BSc Computer Science | University of Bristol | 2018");
    await page.getByTestId("in-skills").fill("SQL, Zendesk, Technical writing, Onboarding, Python");

    // Browser ICU counts the address "ada@example.com" as three tokens
    // (ada + example + com) where Node ICU counts two, so this pins the
    // browser-side value the user sees.
    await expect(page.getByTestId("res-words")).toHaveText("60");
    await expect(page.getByTestId("res-sections")).toHaveText("4");
    await expect(page.getByTestId("res-entries")).toHaveText("2");
    await expect(page.getByTestId("res-quantified")).toHaveText("2/2");
    await expect(page.getByTestId("res-resume")).toContainText("Support Engineer — Acme Analytics (2021–present)");
    await expect(page.getByTestId("res-resume")).toContainText("SQL · Zendesk · Technical writing · Onboarding · Python");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // An achievement with no number in it is a duty, and the check says so.
    await page
      .getByTestId("in-experience")
      .fill("Support Engineer | Acme Analytics | 2021–present | Answered support tickets");
    await expect(page.getByTestId("res-quantified")).toHaveText("0/1");
    await expect(page.getByTestId("res-checks")).toContainText("add a number");
  });

  test("bio-generator builds all three lengths from the same facts", async ({ page }) => {
    await page.goto(`${BASE}/writing/bio-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Ada Lovelace");
    await page.getByTestId("in-role").fill("support engineer");
    await page.getByTestId("in-focus").fill("developer tooling");
    await page.getByTestId("in-location").fill("Bristol");
    await page
      .getByTestId("in-facts")
      .fill("She has run support for a developer platform since 2021\nShe writes a monthly column on troubleshooting");

    await expect(page.getByTestId("res-words")).toHaveText("9 / 25 / 32");
    await expect(page.getByTestId("res-short")).toHaveText("Ada Lovelace is a support engineer based in Bristol.");
    await expect(page.getByTestId("res-medium")).toContainText(
      "Ada Lovelace is a support engineer based in Bristol. The work focuses on developer tooling. She has run support for a developer platform since 2021.",
    );
    await expect(page.getByTestId("res-long")).toContainText("She writes a monthly column on troubleshooting.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A first-person fact breaks the third-person rule.
    await page.getByTestId("in-facts").fill("I write about tools");
    await expect(page.getByTestId("res-checks")).toContainText("third person");
  });

  test("author-profile-writer assembles the works list and flags a missing year", async ({ page }) => {
    await page.goto(`${BASE}/writing/author-profile-writer`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Ada Lovelace");
    await page.getByTestId("in-genre").fill("literary science fiction");
    await page.getByTestId("in-works").fill("The Analyst | 2022\nSmall Machines | 2025");
    await page.getByTestId("in-themes").fill("memory and machines\nwork and worth");
    await page.getByTestId("in-influences").fill("Ursula K. Le Guin; Ted Chiang");
    await page.getByTestId("in-note").fill("She writes in Bristol.");
    await page.getByTestId("in-website").fill("adalovelace.example");

    // "adalovelace.example" is two browser-ICU tokens, so the browser count
    // is one above the Node engine test's pin.
    await expect(page.getByTestId("res-words")).toHaveText("34");
    await expect(page.getByTestId("res-works")).toHaveText("2");
    await expect(page.getByTestId("res-dated")).toHaveText("2/2");
    await expect(page.getByTestId("res-profile")).toContainText("- The Analyst (2022)");
    await expect(page.getByTestId("res-profile")).toContainText("Ada Lovelace writes literary science fiction.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A title with no year cannot be placed on a reader's shelf.
    await page.getByTestId("in-works").fill("The Analyst");
    await expect(page.getByTestId("res-dated")).toHaveText("0/1");
    await expect(page.getByTestId("res-checks")).toContainText("Add the year");
  });

  test("press-release-template assembles the lead, quote and contact", async ({ page }) => {
    await page.goto(`${BASE}/writing/press-release-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-organisation").fill("Acme Analytics");
    await page.getByTestId("in-headline").fill("Acme Analytics opens a support hub in Bristol");
    await page.getByTestId("in-city").fill("Bristol");
    await page.getByTestId("in-date").fill("3 March 2026");
    await page.getByTestId("in-what").fill("Acme Analytics has opened a support hub in Bristol");
    await page.getByTestId("in-who").fill("The hub will serve customers across the south west");
    await page.getByTestId("in-when").fill("The hub opens on 1 April");
    await page.getByTestId("in-where").fill("Recruitment begins this month");
    await page.getByTestId("in-why").fill("The region has a shortage of technical support roles");
    await page.getByTestId("in-quote").fill("Priya Raman | We want support to be local");
    await page.getByTestId("in-boilerplate").fill("Acme Analytics builds support software.");
    await page.getByTestId("in-contact").fill("press@acme.example");

    // "press@acme.example" is three browser-ICU tokens, so the browser count
    // is one above the Node engine test's pin.
    await expect(page.getByTestId("res-words")).toHaveText("74");
    await expect(page.getByTestId("res-leadwords")).toHaveText("27");
    await expect(page.getByTestId("res-release")).toContainText("Acme Analytics Opens a Support Hub in Bristol");
    await expect(page.getByTestId("res-release")).toContainText("BRISTOL, 3 March 2026 — Acme Analytics has opened a support hub in Bristol.");
    await expect(page.getByTestId("res-release")).toContainText('"We want support to be local" said Priya Raman.');
    await expect(page.getByTestId("res-release")).toContainText("Media contact: press@acme.example");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A quote with no speaker is unusable at a news desk.
    await page.getByTestId("in-quote").fill("Some words");
    await expect(page.getByTestId("res-release")).toContainText('"Some words"');
    await expect(page.getByTestId("res-checks")).toContainText("Attribute the quote");
  });
});
