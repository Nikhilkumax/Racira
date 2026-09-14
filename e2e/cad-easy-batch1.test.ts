/**
 * cad-easy-batch1.test.ts — functional verification of the CAD Utilities tools
 * (batch 1 of the Easy-tier build-out).
 *
 * Each test drives the REAL tool with real input and asserts a known-correct
 * result, not just "the page loaded". Requires dev/prod server on port 3002.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("CAD Utilities (batch 1)", () => {
  test.setTimeout(45_000);

  test("scale-factor-calculator: 50mm drawn = 2500mm real → 1:50", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-factor-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-ratio")).toContainText("1:50");
    await expect(page.getByTestId("res-factor")).toContainText("0.02");
    await expect(page.getByTestId("res-percent")).toContainText("2%");

    // 100mm drawn for the same real length → 1:25.
    await page.getByTestId("in-drawn").fill("100");
    await expect(page.getByTestId("res-ratio")).toContainText("1:25");
  });

  test("revision-history-table: adds lettered rows with date/desc/author", async ({ page }) => {
    await page.goto(`${BASE}/cad/revision-history-table`, { waitUntil: "networkidle" });
    await page.getByTestId("in-desc").fill("Preliminary issue");
    await page.getByTestId("in-by").fill("JP");
    await page.getByTestId("add-rev").click();
    await expect(page.getByTestId("rev-row-0")).toContainText("A");
    await expect(page.getByTestId("rev-row-0")).toContainText("Preliminary issue");
    await expect(page.getByTestId("rev-row-0")).toContainText("JP");

    await page.getByTestId("in-desc").fill("Issued for construction");
    await page.getByTestId("in-by").fill("AS");
    await page.getByTestId("add-rev").click();
    await expect(page.getByTestId("rev-row-1")).toContainText("B");
    await expect(page.getByTestId("rev-row-1")).toContainText("Issued for construction");
  });

  test("cad-layer-naming-convention-builder: A-WALL and M-PIPE-HW compose correctly", async ({ page }) => {
    await page.goto(`${BASE}/cad/cad-layer-naming-convention-builder`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-layer")).toContainText("A-WALL");

    await page.getByTestId("in-disc").selectOption("M");
    await page.getByTestId("in-major").fill("PIPE-HW");
    await expect(page.getByTestId("res-layer")).toContainText("M-PIPE-HW");
  });

  test("hatch-pattern-reference: lists ANSI patterns with rendered SVG samples", async ({ page }) => {
    await page.goto(`${BASE}/cad/hatch-pattern-reference`, { waitUntil: "networkidle" });
    const row = page.getByRole("row").filter({ hasText: "ANSI31" });
    await expect(row).toContainText("General purpose");
    await expect(row.locator("svg")).toHaveCount(1);
    await expect(page.getByRole("row").filter({ hasText: "CONCRETE" })).toContainText("section");
  });

  test("line-type-reference: continuous/center/phantom rows with dash samples", async ({ page }) => {
    await page.goto(`${BASE}/cad/line-type-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Continuous" })).toContainText("Visible outlines");
    await expect(page.getByRole("row").filter({ hasText: "Center" })).toContainText("Centre lines");
    await expect(page.getByRole("row").filter({ hasText: "Phantom" }).locator("svg")).toHaveCount(1);
  });

  test("drawing-number-generator: ACME-M-DRG-007 (padded sequence)", async ({ page }) => {
    await page.goto(`${BASE}/cad/drawing-number-generator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-number")).toContainText("ACME-M-DRG-007");

    await page.getByTestId("in-seq").fill("12");
    await expect(page.getByTestId("res-number")).toContainText("ACME-M-DRG-012");
  });

  test("tolerance-notation-formatter: symmetrical ± and unilateral forms with limits", async ({ page }) => {
    await page.goto(`${BASE}/cad/tolerance-notation-formatter`, { waitUntil: "networkidle" });
    // Default 25.4 ±0.05 → symmetrical.
    await expect(page.getByTestId("res-callout")).toContainText("25.40 ± 0.05");
    await expect(page.getByTestId("res-hi")).toContainText("25.45");
    await expect(page.getByTestId("res-lo")).toContainText("25.35");

    // Unilateral +0.10 / -0.05.
    await page.getByTestId("in-plus").fill("0.1");
    await page.getByTestId("in-minus").fill("0.05");
    await expect(page.getByTestId("res-callout")).toContainText("25.40 +0.10 -0.05");
    await expect(page.getByTestId("res-hi")).toContainText("25.50");
    await expect(page.getByTestId("res-lo")).toContainText("25.35");
  });

  test("engineering-change-order-template: generated preview carries the entered fields", async ({ page }) => {
    await page.goto(`${BASE}/cad/engineering-change-order-template`, { waitUntil: "networkidle" });
    await page.getByTestId("in-title").fill("Bracket thickness revision");
    await page.getByTestId("in-requester").fill("J. Rivera, Eng");
    await page.getByTestId("in-desc").fill("Increase gusset bracket from 6 mm to 8 mm plate.");
    await page.getByTestId("in-docs").fill("ACM-M-DRG-007, ACM-M-DRG-008");
    await page.getByTestId("generate-eco").click();

    await expect(page.getByTestId("out-eco-number")).toContainText("ECO-2026-001");
    await expect(page.getByTestId("out-eco-title")).toContainText("Bracket thickness revision");
    await expect(page.getByTestId("out-eco-by")).toContainText("J. Rivera, Eng");
    await expect(page.getByTestId("out-eco-desc")).toContainText("6 mm to 8 mm");
    await expect(page.getByTestId("out-eco-docs")).toContainText("ACM-M-DRG-007");
  });
});
