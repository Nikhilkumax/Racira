/**
 * cad-easy-batch2.test.ts — functional verification of the Measurement &
 * Geometry tools (batch 2 of the Easy-tier build-out). Real input, known-correct
 * output asserted.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Measurement & Geometry (batch 2)", () => {
  test.setTimeout(45_000);

  test("distance-calculator-2d: (0,0)→(300,400) is 500 at 53.130°", async ({ page }) => {
    await page.goto(`${BASE}/cad/distance-calculator-2d`, { waitUntil: "networkidle" });
    await page.getByTestId("in-x2").fill("300");
    await page.getByTestId("in-y2").fill("400");
    await expect(page.getByTestId("res-dist")).toContainText("500.000");
    await expect(page.getByTestId("res-dx")).toContainText("300.000");
    await expect(page.getByTestId("res-dy")).toContainText("400.000");
    await expect(page.getByTestId("res-angle")).toContainText("53.130°");
  });

  test("perimeter-calculator: rect 100×50 → 300; circle r25 → 157.080; triangle → 120", async ({ page }) => {
    await page.goto(`${BASE}/cad/perimeter-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-perim")).toContainText("300.000");

    await page.getByTestId("in-mode").selectOption("circle");
    await expect(page.getByTestId("res-perim")).toContainText("157.080");

    // Triangle default vertices (0,0),(30,0),(0,40) → 120.
    await page.getByTestId("in-mode").selectOption("poly");
    await expect(page.getByTestId("res-perim")).toContainText("120.000");
  });

  test("arc-length-calculator: r50 @60° → 52.360 arc, 50.000 chord", async ({ page }) => {
    await page.goto(`${BASE}/cad/arc-length-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-arc")).toContainText("52.360");
    await expect(page.getByTestId("res-chord")).toContainText("50.000");
    await expect(page.getByTestId("res-sag")).toContainText("6.699");
    await expect(page.getByTestId("res-sector")).toContainText("1308.997");
  });

  test("cad-unit-converter: 1 in = 25.4 mm; 1 m = 3.281 ft; 100 mm = 3.937 in", async ({ page }) => {
    await page.goto(`${BASE}/cad/cad-unit-converter`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-value")).toContainText("25.4 mm");

    await page.getByTestId("in-from").selectOption("m");
    await page.getByTestId("in-to").selectOption("ft");
    await expect(page.getByTestId("res-value")).toContainText("3.2808 ft");

    await page.getByTestId("in-value").fill("100");
    await page.getByTestId("in-from").selectOption("mm");
    await page.getByTestId("in-to").selectOption("in");
    await expect(page.getByTestId("res-value")).toContainText("3.937 in");
  });

  test("hole-and-slot-dimensioner: blind hole and slot callouts with geometry", async ({ page }) => {
    await page.goto(`${BASE}/cad/hole-and-slot-dimensioner`, { waitUntil: "networkidle" });
    // Default: blind Ø10 × 20 deep, quantity 1.
    await expect(page.getByTestId("res-callout")).toContainText("1× Ø10.0 × 20.0 DEEP");

    // Quantity 2.
    await page.getByTestId("in-count").fill("2");
    await expect(page.getByTestId("res-callout")).toContainText("2× Ø10.0 × 20.0 DEEP");

    // Through hole.
    await page.getByTestId("in-blind").uncheck();
    await expect(page.getByTestId("res-callout")).toContainText("2× Ø10.0 THRU");

    // Through-hole geometry: Ø10 section area = π·25 = 78.540 mm².
    await expect(page.getByTestId("res-area")).toContainText("78.540");

    // Slot 10 wide × 30 long: end radius R5.0, straight 20.0, area 278.54.
    await page.getByTestId("in-kind").selectOption("slot");
    await expect(page.getByTestId("res-callout")).toContainText("2× 10.0 × 30.0 SLOT");
    await expect(page.getByTestId("res-radius")).toContainText("R5.0");
    await expect(page.getByTestId("res-straight")).toContainText("20.0");
    await expect(page.getByTestId("res-area")).toContainText("278.54");
  });

  test("gdandt-symbol-reference: symbols grouped by characteristic with glyphs", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdandt-symbol-reference`, { waitUntil: "networkidle" });
    // Heading role only: SEO prose below the tool also mentions "Form tolerances".
    await expect(page.getByRole("heading", { name: "Form tolerances", exact: true })).toBeVisible();
    await expect(page.getByText("Flatness", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Position", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Circular runout", { exact: true }).first()).toBeVisible();
    expect(await page.locator("svg").count()).toBeGreaterThan(14); // glyphs render
  });

  test("gdandt-symbol-reference: symbols with long-form pages link to /cad/gdt", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdandt-symbol-reference`, { waitUntil: "networkidle" });
    // Pilot (Position) + all four batches — the full 14-symbol library has
    // long-form pages; the long-form content itself lives under /cad/gdt.
    const learn = page.getByRole("link", { name: /Learn Symbol/ });
    await expect(learn).toHaveCount(14);
    await expect(page.locator(`a[href="/cad/gdt/position"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/straightness"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/flatness"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/circularity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/cylindricity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/profile-line"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/profile-surface"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/angularity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/perpendicularity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/parallelism"]`)).toContainText("Learn Symbol");
    // The long-form headline no longer renders inline on the browse tool.
    await expect(page.getByRole("heading", { name: "True Position — Position Tolerance", exact: true })).toHaveCount(0);
  });

  test("gdandt-symbol-reference: no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/cad/gdandt-symbol-reference`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("true-position-calculator: dx .1 dy .2 → Ø 0.447 PASS; 0.3/0.4 → Ø 1.000 FAIL", async ({ page }) => {
    await page.goto(`${BASE}/cad/true-position-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-tp")).toContainText("Ø 0.447");
    await expect(page.getByTestId("res-status")).toContainText("PASS");

    await page.getByTestId("in-dx").fill("0.3");
    await page.getByTestId("in-dy").fill("0.4");
    await expect(page.getByTestId("res-tp")).toContainText("Ø 1.000");
    await expect(page.getByTestId("res-status")).toContainText("FAIL");
  });
});
