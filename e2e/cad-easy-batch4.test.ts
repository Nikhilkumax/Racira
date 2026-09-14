/**
 * cad-easy-batch4.test.ts — functional verification of the Mechanical
 * Engineering CAD and Structural & Civil CAD Easy tools (batch 4).
 * Real input, known-correct output asserted.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Mechanical + Structural & Civil (batch 4)", () => {
  test.setTimeout(60_000);

  test("spring-rate-calculator: k = G·d⁴/(8·D³·n) with real numbers", async ({ page }) => {
    await page.goto(`${BASE}/cad/spring-rate-calculator`, { waitUntil: "networkidle" });
    // Defaults: G=80000 (music wire), d=2, D=20, n=5 → k = 80000·16/(8·8000·5) = 4 N/mm
    await expect(page.getByTestId("res-k")).toContainText("4.000 N/mm");
    // Deflection at F=20 N → 5 mm
    await expect(page.getByTestId("res-defl")).toContainText("5.00 mm");
    await expect(page.getByTestId("res-index")).toContainText("10.00");

    // Change wire to d=3: k = 80000·81/320000 = 20.25 N/mm
    await page.getByTestId("in-d").fill("3");
    await expect(page.getByTestId("res-k")).toContainText("20.250 N/mm");
    await expect(page.getByTestId("res-index")).toContainText("6.67");
  });

  test("stress-concentration-factor-reference: Kt magnitudes and search", async ({ page }) => {
    await page.goto(`${BASE}/cad/stress-concentration-factor-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Hole in plate under tension" }).first()).toContainText("≈ 2.5");
    await expect(page.getByRole("row").filter({ hasText: "Thread root" })).toContainText("2.1–3.0");
    // .first(): SEO prose below the tool may also explain the Kf relation.
    await expect(page.getByText(/Kf = 1 \+ q\(Kt − 1\)/).first()).toBeVisible();
    // Search narrows the table.
    await page.getByTestId("ref-search").fill("keyway");
    await expect(page.getByRole("row").filter({ hasText: "Keyway" })).toHaveCount(1);
  });

  test("material-selection-guide-mechanical: representative properties", async ({ page }) => {
    await page.goto(`${BASE}/cad/material-selection-guide-mechanical`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Aluminium 6061-T6" })).toContainText("276");
    await expect(page.getByRole("row").filter({ hasText: "Titanium 6Al-4V" })).toContainText("880");
    await expect(page.getByRole("row").filter({ hasText: "Steel A36" })).toContainText("7.85");
  });

  test("fastener-reference-library: ISO pitches, property classes, SAE grades", async ({ page }) => {
    await page.goto(`${BASE}/cad/fastener-reference-library`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "M10" })).toContainText("1.5");
    await expect(page.getByRole("row").filter({ hasText: "8.8" }).first()).toContainText("800");
    await expect(page.getByRole("row").filter({ hasText: "Grade 8" })).toContainText("150 ksi");
    await expect(page.getByRole("row").filter({ hasText: "10.9" })).toContainText("1040");
  });

  test("shaft-design-reference: sizing formulas and keyway guidance", async ({ page }) => {
    await page.goto(`${BASE}/cad/shaft-design-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Torsion only" })).toContainText("16·T");
    await expect(page.getByRole("row").filter({ hasText: "Bending + torsion" })).toContainText("ASME");
    // .first(): SEO prose below the tool may also quote the keyway Kt value.
    await expect(page.getByText(/Kt ≈ 1\.6 \(profile key\)/).first()).toBeVisible();
  });

  test("foundation-type-reference: load-carrying families", async ({ page }) => {
    await page.goto(`${BASE}/cad/foundation-type-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Spread footing" })).toContainText("bearing");
    await expect(page.getByRole("row").filter({ hasText: "Raft / mat" })).toContainText("differential settlement");
    await expect(page.getByRole("row").filter({ hasText: "Bored pile" })).toContainText("low vibration");
  });

  test("ramp-slope-calculator: exact 1:12 meets ADA; steeper fails", async ({ page }) => {
    await page.goto(`${BASE}/cad/ramp-slope-calculator`, { waitUntil: "networkidle" });
    // Defaults 300 mm rise over 3600 mm run = exactly 1:12 → 8.33%, 4.76°
    await expect(page.getByTestId("res-pct")).toContainText("8.33 %");
    await expect(page.getByTestId("res-ratio")).toContainText("1 : 12.00");
    await expect(page.getByTestId("res-angle")).toContainText("4.76°");
    await expect(page.getByTestId("res-ada")).toContainText("Meets 1:12 ✓");
    await expect(page.getByTestId("res-landing")).toContainText("Not required");

    // 400 over 3600 = 1:9 → exceeds 1:12.
    await page.getByTestId("in-rise").fill("400");
    await expect(page.getByTestId("res-pct")).toContainText("11.11 %");
    await expect(page.getByTestId("res-ada")).toContainText("Exceeds 1:12 ✗");

    // 800 mm rise, 4800 run → intermediate landing required (> 762 mm rise).
    await page.getByTestId("in-rise").fill("800");
    await page.getByTestId("in-run").fill("4800");
    await expect(page.getByTestId("res-landing")).toContainText("Required");
  });

  test("wind-load-reference-tool: qz = 0.00256·V² spot checks", async ({ page }) => {
    await page.goto(`${BASE}/cad/wind-load-reference-tool`, { waitUntil: "networkidle" });
    // Default V=115 → 0.00256·13225 = 33.856 → 33.9 psf
    await expect(page.getByTestId("res-q")).toContainText("33.9 psf");
    await page.getByTestId("in-speed").fill("150");
    await expect(page.getByTestId("res-q")).toContainText("57.6 psf");
    // Quick-reference table row: 100 mph → 25.6 psf
    await expect(page.getByRole("row").filter({ hasText: /^100/ })).toContainText("25.6");
  });

  test("seismic-zone-reference: SDC and risk category content", async ({ page }) => {
    await page.goto(`${BASE}/cad/seismic-zone-reference`, { waitUntil: "networkidle" });
    const bodyRows = page.locator("tbody tr");
    await expect(bodyRows.filter({ hasText: "West Coast" })).toContainText("California");
    await expect(bodyRows.filter({ hasText: "hospitals" })).toContainText("IV");
    await expect(bodyRows.filter({ hasText: "default category" })).toContainText("II");
  });

  test("building-code-checklist: 20 items, progress tracks checks", async ({ page }) => {
    await page.goto(`${BASE}/cad/building-code-checklist`, { waitUntil: "networkidle" });
    const list = page.getByTestId("code-checklist");
    await expect(list.getByRole("checkbox")).toHaveCount(20);
    // Progress bar starts empty (inline width 0%).
    const bar = list.locator("div.h-full.rounded-full.bg-primary");
    await expect(bar).toHaveAttribute("style", /width:\s*0%/);
    // Check 2 items → 2/20 = 10%.
    await list.getByRole("checkbox").nth(0).check();
    await list.getByRole("checkbox").nth(1).check();
    await expect(bar).toHaveAttribute("style", /width:\s*10%/);
  });
});
