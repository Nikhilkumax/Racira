/**
 * writing-b16.test.ts — verification of Writing batch B16 (templates and
 * generators continued: the blog post outline builder, the newsletter template
 * builder, the email template library, the proposal template and the FAQ
 * generator).
 *
 * Two layers:
 *   1. Page contract — every slug renders with HTTP 200, exactly one h1, no
 *      uncaught error, and authored SEO that rendered as prose.
 *   2. Functional — each tool is driven with fixed input and asserted against a
 *      value its engine tests pin: the numbered outline and its counts, the
 *      issue skeleton and its purpose lines, the filled email and its words, the
 *      proposal sections, and the FAQ section with its duplicate/answer checks.
 *
 * Requires the dev/prod server on port 3002 (see playwright.config.ts).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

const BATCH: { slug: string; name: string }[] = [
  { slug: "blog-post-outline-builder", name: "Blog Post Outline Builder" },
  { slug: "newsletter-template-builder", name: "Newsletter Template Builder" },
  { slug: "email-template-library", name: "Email Template Library" },
  { slug: "proposal-template", name: "Proposal Template" },
  { slug: "faq-generator", name: "FAQ Generator" },
];

test.describe("Writing B16 — page contract", () => {
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

test.describe("Writing B16 — functional results", () => {
  test.setTimeout(90_000);

  test("blog-post-outline-builder numbers the points and counts the sections", async ({ page }) => {
    await page.goto(`${BASE}/writing/blog-post-outline-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("How to run a support desk without burning out");
    await page.getByTestId("in-audience").fill("new support leads");
    await page
      .getByTestId("in-takeaways")
      .fill("Hire for patience before speed\nRotate the on-call rota weekly\nWrite the bug report you want to receive");
    await page.getByTestId("in-cta").fill("Download the rota template");

    await expect(page.getByTestId("res-words")).toHaveText("100");
    await expect(page.getByTestId("res-sections")).toHaveText("5");
    await expect(page.getByTestId("res-points")).toHaveText("3");
    await expect(page.getByTestId("res-outline")).toContainText("1. Hire for patience before speed");
    await expect(page.getByTestId("res-outline")).toContainText("Conclusion — restate the promise and hand off to the next step.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // Without a title the outline has no promise, and the check says so.
    await page.getByTestId("in-title").fill("");
    await expect(page.getByTestId("res-checks")).toContainText("Add a working title");
  });

  test("newsletter-template-builder tracks purpose lines and the masthead", async ({ page }) => {
    await page.goto(`${BASE}/writing/newsletter-template-builder`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("The Support Desk");
    await page.getByTestId("in-issue").fill("12");
    await page
      .getByTestId("in-sections")
      .fill(
        "What changed this month | The three fixes we shipped\nOne tool worth trying | A script that rewrites canned replies\nAsk the readers | Your worst ticket, in one sentence",
      );
    await page.getByTestId("in-cta").fill("Reply with your worst ticket");
    await page.getByTestId("in-sign-off").fill("— Ada");

    await expect(page.getByTestId("res-words")).toHaveText("41");
    await expect(page.getByTestId("res-sections")).toHaveText("3");
    await expect(page.getByTestId("res-purposed")).toHaveText("3/3");
    await expect(page.getByTestId("res-newsletter")).toContainText("The Support Desk — Issue 12");
    await expect(page.getByTestId("res-newsletter")).toContainText("What changed this month\nThe three fixes we shipped");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // Dropping a purpose line leaves a bare heading, which is flagged.
    await page.getByTestId("in-sections").fill("One tool worth trying | A script that rewrites canned replies\nAsk the readers");
    await expect(page.getByTestId("res-purposed")).toHaveText("1/2");
    await expect(page.getByTestId("res-checks")).toContainText("Add a purpose line");
  });

  test("email-template-library fills every slot of the follow-up", async ({ page }) => {
    await page.goto(`${BASE}/writing/email-template-library`, { waitUntil: "networkidle" });

    await page.getByTestId("in-name").fill("Priya");
    await page.getByTestId("in-topic").fill("the launch");
    await page.getByTestId("in-date").fill("Tuesday");
    await page.getByTestId("in-note").fill("the deck is attached");
    await page.getByTestId("in-deadline").fill("Friday");
    await page.getByTestId("in-sender").fill("Ada");

    await expect(page.getByTestId("res-words")).toHaveText("37");
    await expect(page.getByTestId("res-text")).toContainText("Subject: Following up on the launch");
    await expect(page.getByTestId("res-text")).toContainText("Hi Priya,");
    await expect(page.getByTestId("res-text")).toContainText("Could you let me know by Friday?");
    await expect(page.getByTestId("res-text")).toContainText("Best,\nAda");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // Emptying a slot leaves a visible placeholder and a check.
    await page.getByTestId("in-name").fill("");
    await expect(page.getByTestId("res-text")).toContainText("Hi [name],");
    await expect(page.getByTestId("res-checks")).toContainText("[name]");
  });

  test("proposal-template assembles the sections and insists on a figure", async ({ page }) => {
    await page.goto(`${BASE}/writing/proposal-template`, { waitUntil: "networkidle" });

    await page.getByTestId("in-title").fill("Support desk audit");
    await page.getByTestId("in-client").fill("Acme Analytics");
    await page.getByTestId("in-problem").fill("First-response time doubled in six months.");
    await page.getByTestId("in-approach").fill("Interview the four agents\nShadow a week of tickets\nShip a triage script");
    await page.getByTestId("in-deliverables").fill("A ticket-flow report\nA triage script\nA two-hour training session");
    await page.getByTestId("in-timeline").fill("Three weeks, starting 6 April");
    await page.getByTestId("in-price").fill("$4,800 fixed");

    await expect(page.getByTestId("res-words")).toHaveText("52");
    await expect(page.getByTestId("res-deliverables")).toHaveText("3");
    await expect(page.getByTestId("res-proposal")).toContainText("Proposal: Support desk audit\nPrepared for: Acme Analytics");
    await expect(page.getByTestId("res-proposal")).toContainText("1. Interview the four agents");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // "Competitive" is not a price.
    await page.getByTestId("in-price").fill("Competitive");
    await expect(page.getByTestId("res-checks")).toContainText("figure");
  });

  test("faq-generator formats the section and flags duplicates and gaps", async ({ page }) => {
    await page.goto(`${BASE}/writing/faq-generator`, { waitUntil: "networkidle" });

    await page.getByTestId("in-topic").fill("refunds");
    await page
      .getByTestId("in-items")
      .fill(
        "How long does a refund take? | Up to ten working days.\nCan I get a refund after 30 days? | Only if the item is faulty.\nWhat do I need to send? | The order number and a photo of the item.",
      );

    await expect(page.getByTestId("res-words")).toHaveText("51");
    await expect(page.getByTestId("res-questions")).toHaveText("3");
    await expect(page.getByTestId("res-answered")).toHaveText("3/3");
    await expect(page.getByTestId("res-section")).toContainText("Frequently asked questions about refunds");
    await expect(page.getByTestId("res-section")).toContainText("Q: How long does a refund take?\nA: Up to ten working days.");
    await expect(page.getByTestId("res-checks")).toHaveCount(0);

    // A duplicate question and a missing answer are both caught.
    await page
      .getByTestId("in-items")
      .fill(
        "How long does a refund take? |\nWhat do I need to send? | The order number and a photo of the item.\nHow long does a refund take? | Up to ten working days.",
      );
    await expect(page.getByTestId("res-answered")).toHaveText("2/3");
    await expect(page.getByTestId("res-section")).toContainText("TODO");
    await expect(page.getByTestId("res-checks")).toContainText("appears twice");
    await expect(page.getByTestId("res-checks")).toContainText("Write an answer");
  });
});
