/**
 * cad-easy-batch3.test.ts — functional verification of the GD&T & Standards and
 * Piping & HVAC tools (batch 3). Real input, known-correct output asserted.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("GD&T & Standards + Piping & HVAC (batch 3)", () => {
  test.setTimeout(60_000);

  test("gdandt-symbol-reference-standards: rules shown per symbol", async ({ page }) => {
    await page.goto(`${BASE}/cad/gdandt-symbol-reference-standards`, { waitUntil: "networkidle" });
    // Rule text unique to the standards edition: position zone + MMC bonus.
    await expect(page.getByText(/MMC modifiers give bonus tolerance/)).toBeVisible();
    await expect(page.getByText(/Form control — no datum required/).first()).toBeVisible();
    await expect(page.getByText(/Cylindricity/, { exact: false }).first()).toBeVisible();
    // Symbols with a long-form entry link out to the /cad/gdt library
    // (pilot Position + all four batches — the full 14-symbol library).
    const learn = page.getByRole("link", { name: /Learn Symbol/ });
    await expect(learn).toHaveCount(14);
    await expect(page.locator(`a[href="/cad/gdt/position"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/cylindricity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/profile-surface"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/angularity"]`)).toContainText("Learn Symbol");
    await expect(page.locator(`a[href="/cad/gdt/parallelism"]`)).toContainText("Learn Symbol");
  });

  test("cylindricity-reference: content sections render", async ({ page }) => {
    await page.goto(`${BASE}/cad/cylindricity-reference`, { waitUntil: "networkidle" });
    // Heading role only: SEO prose below the tool also contains "the control".
    await expect(page.getByRole("heading", { name: "The control", exact: true })).toBeVisible();
    await expect(page.getByText(/two coaxial cylinders/).first()).toBeVisible();
    await expect(page.getByText(/[Cc]ircularity/).first()).toBeVisible(); // comparison mention
  });

  test("parallelism-and-perpendicularity-guide: covers both controls", async ({ page }) => {
    await page.goto(`${BASE}/cad/parallelism-and-perpendicularity-guide`, { waitUntil: "networkidle" });
    await expect(page.getByText("Parallelism", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Perpendicularity", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/0\.02–0\.05 mm typical/)).toBeVisible();
  });

  test("surface-roughness-ra-reference: process and application tables render", async ({ page }) => {
    await page.goto(`${BASE}/cad/surface-roughness-ra-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "0.025–0.1 µm" })).toContainText("Lapping");
    await expect(page.getByRole("row").filter({ hasText: "O-ring gland" })).toContainText("Ra 0.4");
  });

  test("drawing-standards-comparator-ansi-vs-iso: projection row differs correctly", async ({ page }) => {
    await page.goto(`${BASE}/cad/drawing-standards-comparator-ansi-vs-iso`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Projection" })).toContainText("Third-angle");
    await expect(page.getByRole("row").filter({ hasText: "Projection" })).toContainText("First-angle");
    await expect(page.getByRole("row").filter({ hasText: "GD&T standard" })).toContainText("ASME Y14.5-2018");
  });

  test("fluid-flow-rate-calculator: 50mm pipe @ 2 m/s → 14.137 m³/h", async ({ page }) => {
    await page.goto(`${BASE}/cad/fluid-flow-rate-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-m3h")).toContainText("14.137");
    await expect(page.getByTestId("res-lmin")).toContainText("235.619");
    // Area = π·(0.025)² = 0.001963 m²
    await expect(page.getByTestId("res-area")).toContainText("0.001963");
    await expect(page.getByTestId("res-q")).toContainText("0.003927");
  });

  test("pipe-material-reference: material rows and limits", async ({ page }) => {
    await page.goto(`${BASE}/cad/pipe-material-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Copper" })).toContainText("Potable water");
    await expect(page.getByRole("row").filter({ hasText: "PVC (uPVC)" })).toContainText("60 °C");
    await expect(page.getByRole("row").filter({ hasText: "Stainless steel" })).toContainText("316L");
  });

  test("valve-type-reference: families and functions", async ({ page }) => {
    await page.goto(`${BASE}/cad/valve-type-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Gate valve" })).toContainText("isolation");
    await expect(page.getByRole("row").filter({ hasText: "Check valve" })).toContainText("reverse flow");
    await expect(page.getByRole("row").filter({ hasText: "Relief / safety" })).toContainText("set pressure");
  });

  test("hvac-equipment-selector-guide: server room recommends CRAC/CRAH", async ({ page }) => {
    await page.goto(`${BASE}/cad/hvac-equipment-selector-guide`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-equipment")).toContainText("Packaged rooftop"); // default
    await page.getByTestId("in-app").selectOption({ label: "Server room / data center" });
    await expect(page.getByTestId("res-equipment")).toContainText("CRAC");
    await expect(page.getByTestId("res-note")).toContainText("ASHRAE");
  });

  test("refrigerant-properties-reference: key figures", async ({ page }) => {
    await page.goto(`${BASE}/cad/refrigerant-properties-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "R-410A" })).toContainText("2088");
    await expect(page.getByRole("row").filter({ hasText: "R-290 (propane)" })).toContainText("flammable");
    await expect(page.getByRole("row").filter({ hasText: "R-744" })).toContainText("31.1");
  });

  test("air-change-rate-calculator: 100 CFM in 10×12×8 → 6.25 ACH; reverse sizing", async ({ page }) => {
    await page.goto(`${BASE}/cad/air-change-rate-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-volume")).toContainText("960.000");
    await expect(page.getByTestId("res-ach")).toContainText("6.25 ACH");
    // Target 6 ACH → 96 CFM.
    await expect(page.getByTestId("res-need")).toContainText("96 CFM");

    // Metric mode: 100 m³/h in 5×5×2.5 = 62.5 m³ → 1.6 ACH.
    await page.getByTestId("in-sys").selectOption("si");
    await page.getByTestId("in-flow").fill("100");
    await page.getByTestId("in-l").fill("5");
    await page.getByTestId("in-w").fill("5");
    await page.getByTestId("in-h").fill("2.5");
    await expect(page.getByTestId("res-ach")).toContainText("1.60 ACH");
  });
});
