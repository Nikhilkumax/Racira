/**
 * cad-medium-batch7.test.ts — functional verification of the first Medium-tier
 * batch: Measurement & Geometry (5) + CAD Utilities (2). Real input, known
 * correct output asserted (values derived by hand from the governing formulas,
 * not copied from the components).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Medium tier batch 7", () => {
  test.setTimeout(90_000);

  test("area-calculator-polygon: shoelace area, winding and perimeter", async ({ page }) => {
    await page.goto(`${BASE}/cad/area-calculator-polygon`, { waitUntil: "networkidle" });
    // Default triangle (0,0),(30,0),(0,40) → 600, CCW, perimeter 120.
    await expect(page.getByTestId("res-area")).toContainText("600.000 mm²");
    await expect(page.getByTestId("res-perim")).toContainText("120.000 mm");
    await expect(page.getByTestId("res-orient")).toContainText("CCW");
    await expect(page.getByTestId("res-verts")).toContainText("3");
    // Unit change relabels only.
    await page.getByTestId("in-unit").selectOption("in");
    await expect(page.getByTestId("res-area")).toContainText("600.000 in²");
    // Rectangle 100×50 → 5000; vertex editing + add.
    await page.getByTestId("in-unit").selectOption("mm");
    await page.getByTestId("add-vertex").click();
    await expect(page.getByTestId("res-verts")).toContainText("4");
    await page.getByTestId("in-px1").fill("100");
    await page.getByTestId("in-py1").fill("0");
    await page.getByTestId("in-px2").fill("100");
    await page.getByTestId("in-py2").fill("50");
    await page.getByTestId("in-px3").fill("0");
    await page.getByTestId("in-py3").fill("50");
    await expect(page.getByTestId("res-area")).toContainText("5000.000 mm²");
    await expect(page.getByTestId("res-perim")).toContainText("300.000 mm");
    // Remove the last vertex: triangle (0,0),(100,0),(100,50) → 2500.
    await page.getByTestId("rm-vertex").click();
    await expect(page.getByTestId("res-area")).toContainText("2500.000 mm²");
    await expect(page.getByTestId("res-verts")).toContainText("3");
  });

  test("angle-bisector-tool: three-point geometry and angle-value mode", async ({ page }) => {
    await page.goto(`${BASE}/cad/angle-bisector-tool`, { waitUntil: "networkidle" });
    // Default A(1,0), B(0,0), C(0,1) → 90° angle, 45° half, 45° bisector.
    await expect(page.getByTestId("res-angle")).toContainText("90.000°");
    await expect(page.getByTestId("res-half")).toContainText("45.000°");
    await expect(page.getByTestId("res-bis")).toContainText("45.000°");
    // C → (1,1): 45° angle, bisector at 22.5°.
    await page.getByTestId("in-x3").fill("1");
    await page.getByTestId("in-y3").fill("1");
    await expect(page.getByTestId("res-angle")).toContainText("45.000°");
    await expect(page.getByTestId("res-bis")).toContainText("22.500°");
    // Angle-value mode: 90 → bisector 45, reflex bisector 225 (opposite ray).
    await page.getByTestId("in-mode").selectOption("angle");
    await expect(page.getByTestId("res-bis")).toContainText("45.000°");
    await expect(page.getByTestId("res-reflex")).toContainText("225.000°");
    // 450° normalises to 90 → still 45.
    await page.getByTestId("in-deg").fill("450");
    await expect(page.getByTestId("res-angle")).toContainText("90.000°");
    await expect(page.getByTestId("res-bis")).toContainText("45.000°");
  });

  test("coordinate-input-tool: Cartesian ↔ polar with quadrant handling", async ({ page }) => {
    await page.goto(`${BASE}/cad/coordinate-input-tool`, { waitUntil: "networkidle" });
    // (30,40) → r 50, θ 53.13, quadrant I.
    await expect(page.getByTestId("res-r")).toContainText("50.000 mm");
    await expect(page.getByTestId("res-theta")).toContainText("53.130°");
    await expect(page.getByTestId("res-quadrant")).toContainText("I");
    // (−30,−40) → 233.13°, third quadrant.
    await page.getByTestId("in-x").fill("-30");
    await page.getByTestId("in-y").fill("-40");
    await expect(page.getByTestId("res-theta")).toContainText("233.130°");
    await expect(page.getByTestId("res-quadrant")).toContainText("III");
    await expect(page.getByTestId("res-signed")).toContainText("-126.870°");
    // Polar mode round-trip: r=50, θ=53.13 → (30, 40).
    await page.getByTestId("in-mode").selectOption("polar");
    await expect(page.getByTestId("res-x")).toContainText("30.000 mm");
    await expect(page.getByTestId("res-y")).toContainText("40.000 mm");
    // r=10, θ=180 → (−10, 0).
    await page.getByTestId("in-r").fill("10");
    await page.getByTestId("in-theta").fill("180");
    await expect(page.getByTestId("res-x")).toContainText("-10.000 mm");
    await expect(page.getByTestId("res-y")).toContainText("0.000 mm");
  });

  test("tolerance-stack-up-analyzer: worst-case vs RSS arithmetic", async ({ page }) => {
    await page.goto(`${BASE}/cad/tolerance-stack-up-analyzer`, { waitUntil: "networkidle" });
    // Defaults 50±0.3 + 10±0.1 + 25±0.2 → nominal 85, WC ±0.6, RSS ±0.374.
    await expect(page.getByTestId("res-nom")).toContainText("85.000");
    await expect(page.getByTestId("res-wc-min")).toContainText("84.400");
    await expect(page.getByTestId("res-wc-max")).toContainText("85.600");
    await expect(page.getByTestId("res-wc-spread")).toContainText("± 0.600");
    await expect(page.getByTestId("res-rss-min")).toContainText("84.626");
    await expect(page.getByTestId("res-rss-max")).toContainText("85.374");
    await expect(page.getByTestId("res-rss-spread")).toContainText("± 0.374");
    await expect(page.getByTestId("res-saving")).toContainText("37.6%");
    // Add 5±0.5: nominal 90, WC ±1.1, RSS √(0.14+0.25)=0.624.
    await page.getByTestId("add-dim").click();
    await page.getByTestId("in-nom3").fill("5");
    await page.getByTestId("in-tol3").fill("0.5");
    await expect(page.getByTestId("res-nom")).toContainText("90.000");
    await expect(page.getByTestId("res-wc-spread")).toContainText("± 1.100");
    await expect(page.getByTestId("res-rss-max")).toContainText("90.624");
    // Remove the extra row → back to 85.
    await page.getByTestId("rm-dim").click();
    await expect(page.getByTestId("res-nom")).toContainText("85.000");
  });

  test("thread-fit-calculator: M12×1.75 6H/6g limits and clearances", async ({ page }) => {
    await page.goto(`${BASE}/cad/thread-fit-calculator`, { waitUntil: "networkidle" });
    // Defaults M12 × 1.75, 6H/6g.
    await expect(page.getByTestId("res-es")).toContainText("34 µm");
    await expect(page.getByTestId("res-d-ext")).toContainText("11.966 – 11.707");
    await expect(page.getByTestId("res-d2-ext")).toContainText("10.829 – 10.681");
    await expect(page.getByTestId("res-d2-int")).toContainText("10.863 – 11.059");
    await expect(page.getByTestId("res-d1-int")).toContainText("10.106 – 10.446");
    await expect(page.getByTestId("res-clear-min")).toContainText("0.034 mm");
    await expect(page.getByTestId("res-clear-max")).toContainText("0.378 mm");
    await expect(page.getByTestId("res-fit")).toContainText("Clearance fit");
    // 6h → zero allowance.
    await page.getByTestId("in-ext-class").selectOption("6h");
    await expect(page.getByTestId("res-es")).toContainText("0 (position h / H)");
    await expect(page.getByTestId("res-d2-ext")).toContainText("10.863 – 10.715");
    // M20 × 2.5, 6g → 42 µm allowance, d2 18.334 – 18.163.
    await page.getByTestId("in-ext-class").selectOption("6g");
    await page.getByTestId("in-d").fill("20");
    await page.getByTestId("in-pitch").selectOption("2.5");
    await expect(page.getByTestId("res-es")).toContainText("42 µm");
    await expect(page.getByTestId("res-d2-ext")).toContainText("18.334 – 18.163");
  });

  test("drawing-title-block-generator: fields flow into the preview", async ({ page }) => {
    await page.goto(`${BASE}/cad/drawing-title-block-generator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("tb-company")).toContainText("ACME Engineering");
    await expect(page.getByTestId("tb-title")).toContainText("Base Plate");
    await expect(page.getByTestId("tb-number")).toContainText("DWG-001");
    await expect(page.getByTestId("tb-sheet")).toContainText("1 of 1");
    await expect(page.getByTestId("tb-scale")).toContainText("1:1");
    // Editing a field updates the block live.
    await page.getByTestId("in-title").fill("Gear Housing");
    await page.getByTestId("in-sheet").fill("2");
    await page.getByTestId("in-sheets").fill("5");
    await page.getByTestId("in-scale").selectOption("1:2");
    await expect(page.getByTestId("tb-title")).toContainText("Gear Housing");
    await expect(page.getByTestId("tb-sheet")).toContainText("2 of 5");
    await expect(page.getByTestId("tb-scale")).toContainText("1:2");
    // Copy reports the field count (clipboard may be blocked headless).
    await page.getByTestId("copy-tb").click();
    await expect(page.getByTestId("res-status")).toContainText(/Copied 9 fields|Copy blocked/);
  });

  test("parts-list-bom-builder: totals and CSV export", async ({ page }) => {
    await page.goto(`${BASE}/cad/parts-list-bom-builder`, { waitUntil: "networkidle" });
    // Default rows: 3 line items, 18 total quantity.
    await expect(page.getByTestId("res-lines")).toContainText("3");
    await expect(page.getByTestId("res-total")).toContainText("18");
    // CSV header + first row, quoted notes survive.
    await expect(page.getByTestId("res-csv")).toContainText("Item,Part,Material,Qty,Unit,Notes");
    await expect(page.getByTestId("res-csv")).toContainText("1,Bracket,Aluminium 6061,2,pcs,CNC machined");
    await expect(page.getByTestId("res-csv")).toContainText("2,M4 × 0.7 cap screw,Steel,8,pcs,");
    // Change a quantity → total updates; add a row → line count updates.
    await page.getByTestId("in-qty0").fill("5");
    await expect(page.getByTestId("res-total")).toContainText("21");
    await expect(page.getByTestId("res-csv")).toContainText("1,Bracket,Aluminium 6061,5,pcs,CNC machined");
    // A blank row is excluded from the totals until it has a part name.
    await page.getByTestId("add-row").click();
    await expect(page.getByTestId("res-lines")).toContainText("3");
    await page.getByTestId("in-part3").fill("M6 hex nut");
    await page.getByTestId("in-qty3").fill("4");
    await expect(page.getByTestId("res-lines")).toContainText("4");
    await expect(page.getByTestId("res-total")).toContainText("25");
    await page.getByTestId("in-part3").fill("");
    await expect(page.getByTestId("res-lines")).toContainText("3");
    await expect(page.getByTestId("res-total")).toContainText("21");
  });
});