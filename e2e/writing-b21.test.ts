/**
 * writing-b21.test.ts — verification of Writing batch B21 (headline rewriter,
 * paragraph compressor, email to formal letter converter, bullet to prose
 * converter and abstract generator).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the five headline angles and the checker
 *      flags, the compression reduction and dropped sentence, the letter with
 *      its substitutions, the joined paragraph, and the abstract word count
 *      with its structural checks.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "headline-rewriter", name: "Headline Rewriter" },
  { slug: "paragraph-compressor", name: "Paragraph Compressor" },
  { slug: "email-to-formal-letter-converter", name: "Email to Formal Letter Converter" },
  { slug: "bullet-to-prose-converter", name: "Bullet to Prose Converter" },
  { slug: "abstract-generator", name: "Abstract Generator" },
];

test.describe("Writing B21 — page contract", () => {
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

test.describe("Writing B21 — functional results", () => {
  test.setTimeout(90_000);

  test("headline-rewriter composes the five angles and flags clickbait", async ({ page }) => {
    await page.goto(`${BASE}/writing/headline-rewriter`, { waitUntil: "networkidle" });

    await page.getByTestId("in-subject").fill("headline writing");
    await page.getByTestId("in-action").fill("write a better headline");

    await expect(page.getByTestId("res-variants")).toHaveText("5");
    await expect(page.getByTestId("res-headlines")).toContainText("How to write a better headline");
    await expect(page.getByTestId("res-headlines")).toContainText("Headline writing: 5 mistakes to avoid");
    await expect(page.getByTestId("res-headlines")).toContainText(
      "What does good headline writing look like?",
    );

    // The checker reviews a headline without rewriting it.
    await page
      .getByTestId("in-headline")
      .fill("10 SHOCKING Secrets About Writing Headlines That You Won't Believe!");
    await expect(page.getByTestId("res-flags")).toContainText("67 characters");
    await expect(page.getByTestId("res-flags")).toContainText("Shouted word: SHOCKING.");
  });

  test("paragraph-compressor cuts filler and drops a repeated sentence", async ({ page }) => {
    await page.goto(`${BASE}/writing/paragraph-compressor`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        "It is worth noting that advance planning is absolutely essential for the launch. It is worth noting that advance planning is absolutely essential for the launch. In order to utilise the new system we must make a decision, and the team will provide assistance to everyone at this point in time. The basic fundamentals of the plan are that the end result should be a brief summary of the future plans for the roadmap, which is the plan for the future work that the team intends to do in the coming period.",
      );

    await expect(page.getByTestId("res-reduction")).toHaveText("37%");
    await expect(page.getByTestId("res-before")).toHaveText("92");
    await expect(page.getByTestId("res-after")).toHaveText("58");
    await expect(page.getByTestId("res-compressed")).toContainText(
      "Planning is essential for the launch. To use the new system we must decide",
    );
    await expect(page.getByTestId("res-dropped")).toContainText("Dropped as 100% identical to");
    await expect(page.getByTestId("res-checks")).toContainText("1 sentence dropped as a repeat");
  });

  test("email-to-formal-letter-converter rewrites the message and lists the changes", async ({ page }) => {
    await page.goto(`${BASE}/writing/email-to-formal-letter-converter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill(
        "Hi Sam,\n\nI just wanted to get back to you about the budget. It's a lot of work but we can't start until Friday!! Thanks for the update \u{1F600}\n\nThanks,\nAlex",
      );
    await page.getByTestId("in-sender").fill("Alex Doe");

    await expect(page.getByTestId("res-words")).toHaveText("26");
    await expect(page.getByTestId("res-changes-count")).toHaveText("9");
    await expect(page.getByTestId("res-letter")).toContainText("Dear Sam,");
    await expect(page.getByTestId("res-letter")).toContainText("I am writing to get back to you about the budget.");
    await expect(page.getByTestId("res-letter")).toContainText("Yours sincerely,");
    await expect(page.getByTestId("res-changes")).toContainText("I am writing to");
  });

  test("bullet-to-prose-converter joins the list with fixed connectors", async ({ page }) => {
    await page.goto(`${BASE}/writing/bullet-to-prose-converter`, { waitUntil: "networkidle" });

    await page
      .getByTestId("in-text")
      .fill("- Draft the outline\n- Write the first section\n- Send the draft to the editor\n");
    await page.getByTestId("in-connectors").check();

    await expect(page.getByTestId("res-bullets")).toHaveText("3");
    await expect(page.getByTestId("res-sentences")).toHaveText("3");
    await expect(page.getByTestId("res-prose")).toHaveText(
      "Draft the outline. Next write the first section. Then send the draft to the editor.",
    );

    // The single-sentence shape joins short bullets instead.
    await page.getByTestId("in-text").fill("- Short one\n- Another short point\n");
    await page.getByTestId("in-shape").selectOption("single");
    await expect(page.getByTestId("res-sentences")).toHaveText("1");
    await expect(page.getByTestId("res-prose")).toHaveText("Short one and Another short point.");
    await expect(page.getByTestId("res-checks")).toContainText("looks like a heading");
  });

  test("abstract-generator assembles the parts and checks the shape", async ({ page }) => {
    await page.goto(`${BASE}/writing/abstract-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-background").fill("Remote work has grown quickly since 2020.");
    await page
      .getByTestId("in-objective")
      .fill("We examined whether remote work changes how teams share informal knowledge.");
    await page
      .getByTestId("in-methods")
      .fill("We surveyed 412 employees across 9 firms and compared teams with fully remote and hybrid arrangements.");
    await page
      .getByTestId("in-results")
      .fill("Fully remote teams reported 31 percent fewer informal exchanges per week than hybrid teams.");
    await page
      .getByTestId("in-conclusions")
      .fill(
        "Remote work appears to reduce informal knowledge sharing substantially, which has practical consequences for onboarding, mentoring and the maintenance of shared context across a distributed organisation.",
      );

    await expect(page.getByTestId("res-words")).toHaveText("74");
    await expect(page.getByTestId("res-filled")).toHaveText("5/5");
    await expect(page.getByTestId("res-checks-count")).toHaveText("2");
    await expect(page.getByTestId("res-abstract")).toContainText(
      "Background: Remote work has grown quickly since 2020.",
    );
    await expect(page.getByTestId("res-abstract")).toContainText("Results: Fully remote teams reported 31 percent");
    await expect(page.getByTestId("res-checks")).toContainText("Conclusions (26 words) is longer than Results (14)");

    // Unstructured drops the labels without changing the word count.
    await page.getByTestId("in-structured").uncheck();
    await expect(page.getByTestId("res-abstract")).not.toContainText("Background:");
    await expect(page.getByTestId("res-words")).toHaveText("74");
  });
});
