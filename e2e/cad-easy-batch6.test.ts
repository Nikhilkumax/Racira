/**
 * cad-easy-batch6.test.ts — functional verification of the final Easy-tier
 * batch: 2D Drafting (3) + CNC & Fabrication (8). Real input, known-correct
 * output asserted (values derived by hand, not copied from the components).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("2D Drafting + CNC & Fabrication (batch 6)", () => {
  test.setTimeout(60_000);

  test("line-weight-manager: ISO pen snapping under both policies", async ({ page }) => {
    await page.goto(`${BASE}/cad/line-weight-manager`, { waitUntil: "networkidle" });
    // Default: 2-width policy, thick 0.7 → thin snapped to 0.35.
    await expect(page.getByTestId("res-thick")).toContainText("0.7 mm");
    await expect(page.getByTestId("res-thin")).toContainText("0.35 mm");
    await expect(page.getByTestId("res-medium")).toContainText("not used");
    // 3-width policy: medium = 0.7/√2 ≈ 0.495 → nearest series pen 0.5.
    await page.getByTestId("in-policy").selectOption("three");
    await expect(page.getByTestId("res-medium")).toContainText("0.5 mm");
    // Thick 0.5: thin = 0.25, medium = 0.354 → 0.35.
    await page.getByTestId("in-thick").selectOption("0.5");
    await expect(page.getByTestId("res-thick")).toContainText("0.5 mm");
    await expect(page.getByTestId("res-thin")).toContainText("0.25 mm");
    await expect(page.getByTestId("res-medium")).toContainText("0.35 mm");
    // Hidden line maps to the medium pen under the √2 policy.
    await expect(page.locator("tbody tr").filter({ hasText: "Hidden line" })).toContainText("0.35 mm");
  });

  test("scale-bar-tool: 1:200 bar with 1 m segments draws 5 mm each", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    // Defaults: 1:200, metres, 1 per segment, 20 segments → 5 mm / 100 mm / 20 m.
    await expect(page.getByTestId("res-seg")).toContainText("5 mm");
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    // 1:100 → 10 mm per segment.
    await page.getByTestId("in-x").fill("100");
    await expect(page.getByTestId("res-seg")).toContainText("10 mm");
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    // Imperial: 1:50 with 5 ft segments → 5 ft = 1524 mm → 30.48 mm on paper.
    await page.getByTestId("in-x").fill("50");
    await page.getByTestId("in-unit").selectOption("ft");
    await page.getByTestId("in-seg").fill("5");
    await expect(page.getByTestId("res-seg")).toContainText("30.48 mm");
    // Full bar = paper × scale = 100 mm × 50 = 5 m = 16.4042 ft (NOT 25 ft:
    // 5 ft × 30.48 mm/segment = 152.4 mm on paper, so only 3.28 of the 5 ft
    // segments fit the 100 mm bar; the earlier "25 ft" expectation implied
    // a 152.4 mm bar width and contradicted the res-seg assertion above).
    await expect(page.getByTestId("res-real")).toContainText("16.4042 ft");
    // SVG preview is present and labelled with the scale.
    await expect(page.locator("svg[aria-label*='1:50']")).toBeVisible();
  });

  test("cad-grid-planner: A4 with 10 mm grid, snap 4 → 30×22 majors, 2.5 mm minor", async ({ page }) => {
    await page.goto(`${BASE}/cad/cad-grid-planner`, { waitUntil: "networkidle" });
    // 297×210 @10 → cols 30, rows 22, points 660, cells 29×21.
    await expect(page.getByTestId("res-cols")).toContainText("30");
    await expect(page.getByTestId("res-rows")).toContainText("22");
    await expect(page.getByTestId("res-points")).toContainText("660");
    await expect(page.getByTestId("res-cells")).toContainText("29 × 21");
    await expect(page.getByTestId("res-minor")).toContainText("2.5 mm");
    await expect(page.getByTestId("res-minor-lines")).toContainText("119 × 85");
    // 100×50 space @10 → cols 11, rows 6, points 66, cells 10×5.
    await page.getByTestId("in-width").fill("100");
    await page.getByTestId("in-height").fill("50");
    await expect(page.getByTestId("res-cols")).toContainText("11");
    await expect(page.getByTestId("res-rows")).toContainText("6");
    await expect(page.getByTestId("res-points")).toContainText("66");
    await expect(page.getByTestId("res-cells")).toContainText("10 × 5");
  });

  test("material-cutting-reference: search + spot values", async ({ page }) => {
    await page.goto(`${BASE}/cad/material-cutting-reference`, { waitUntil: "networkidle" });
    await expect(page.locator("tbody tr").filter({ hasText: "Stainless steel (304)" })).toContainText("0.03–0.08");
    await expect(page.locator("tbody tr").filter({ hasText: "Titanium (Ti-6Al-4V)" })).toContainText("Never dwell");
    await page.getByTestId("ref-search").fill("brass");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("tbody tr").filter({ hasText: "Brass (360)" })).toContainText("grab");
    await page.getByTestId("ref-search").fill("aluminium");
    await expect(page.locator("tbody tr")).toHaveCount(2); // 6061 + casting A356
  });

  test("tooling-library-browser: tool rows and search", async ({ page }) => {
    await page.goto(`${BASE}/cad/tooling-library-browser`, { waitUntil: "networkidle" });
    await expect(page.locator("tbody tr").filter({ hasText: "Ball nose end mill" })).toContainText("3D surfacing");
    await expect(page.locator("tbody tr").filter({ hasText: "Reamer" })).toContainText("H7");
    await page.getByTestId("ref-search").fill("conveyor");
    await expect(page.locator("tbody tr").first()).toContainText("No matches"); // no conveyor tooling here
    await page.getByTestId("ref-search").fill("rough");
    await expect(page.locator("tbody tr").filter({ hasText: "Roughing (corncob) end mill" })).toContainText("30–50%");
  });

  test("g-code-reference-viewer: code rows and search", async ({ page }) => {
    await page.goto(`${BASE}/cad/g-code-reference-viewer`, { waitUntil: "networkidle" });
    await expect(page.locator("tbody tr").filter({ hasText: "G02 / G03" })).toContainText("I/J");
    await expect(page.locator("tbody tr").filter({ hasText: "M06" })).toContainText("Tool change");
    await page.getByTestId("ref-search").fill("G83");
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("tbody tr").filter({ hasText: "G83" })).toContainText("peck");
    await page.getByTestId("ref-search").fill("spindle-through-coolant");
    await expect(page.locator("tbody tr").first()).toContainText("No matches");
  });

  test("machining-operation-selector: sequences change with feature + tolerance", async ({ page }) => {
    await page.goto(`${BASE}/cad/machining-operation-selector`, { waitUntil: "networkidle" });
    const steps = page.getByTestId("steps");
    // Default: pocket, aluminium, general → rough + finish walls.
    await expect(page.getByTestId("res-op")).toContainText("Pocket milling");
    await expect(steps).toContainText("Rough pocket");
    await expect(steps).toContainText("Finish walls");
    // Face + rough tolerance → a single roughing step, no finish pass.
    await page.getByTestId("in-feature").selectOption("face");
    await page.getByTestId("in-tol").selectOption("rough");
    await expect(steps.locator("li")).toHaveCount(1);
    await expect(steps).toContainText("Rough face");
    await expect(page.getByTestId("res-finish")).toContainText("No");
    // Through-hole + tight → spot, drill, ream.
    await page.getByTestId("in-feature").selectOption("through-hole");
    await page.getByTestId("in-tol").selectOption("tight");
    await expect(page.getByTestId("res-op")).toContainText("Hole drilling (through)");
    await expect(steps).toContainText("Spot");
    await expect(steps).toContainText("Ream / interpolate");
    // Stainless steel tooling note applies.
    await page.getByTestId("in-material").selectOption("stainless");
    await expect(page.getByTestId("res-toolmat")).toContainText("climb mill");
  });

  test("chip-load-calculator: 600 mm/min @ 8000 rpm 2-flute → 0.0375 mm/tooth", async ({ page }) => {
    await page.goto(`${BASE}/cad/chip-load-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-fz")).toContainText("0.0375 mm/tooth");
    await expect(page.getByTestId("res-range")).toContainText("0.04 – 0.08 mm/tooth");
    await expect(page.getByTestId("res-check")).toContainText("Below range");
    await expect(page.getByTestId("res-mrr")).toContainText("10800 mm³/min");
    // 800 mm/min → fz 0.05, inside the Ø6 aluminium band.
    await page.getByTestId("in-feed").fill("800");
    await expect(page.getByTestId("res-fz")).toContainText("0.05 mm/tooth");
    await expect(page.getByTestId("res-check")).toContainText("Within typical range");
    // Steel band at Ø6 is 0.03–0.06; 0.05 still in range.
    await page.getByTestId("in-material").selectOption("steel");
    await expect(page.getByTestId("res-range")).toContainText("0.03 – 0.06");
    await expect(page.getByTestId("res-check")).toContainText("Within typical range");
  });

  test("cnc-material-thickness-guide: per-process ceilings", async ({ page }) => {
    await page.goto(`${BASE}/cad/cnc-material-thickness-guide`, { waitUntil: "networkidle" });
    // Default fibre: mild steel 25 mm, aluminium 12 mm.
    await expect(page.locator("tbody tr").filter({ hasText: "Mild steel" })).toContainText("25 mm");
    await expect(page.locator("tbody tr").filter({ hasText: "Aluminium" })).toContainText("12 mm");
    // Waterjet: steel 200 mm + the non-metal row.
    await page.getByTestId("in-process").selectOption("waterjet");
    await expect(page.locator("tbody tr").filter({ hasText: "Mild steel" })).toContainText("200 mm");
    await expect(page.locator("tbody tr").filter({ hasText: "Stone / glass / tile" })).toContainText("100 mm");
    // CO₂: acrylic 30 mm; aluminium limited to 3 mm.
    await page.getByTestId("in-process").selectOption("co2");
    await expect(page.locator("tbody tr").filter({ hasText: "Acrylic" })).toContainText("30 mm");
    await expect(page.locator("tbody tr").filter({ hasText: "Aluminium" })).toContainText("3 mm");
    // Plasma kerf is millimetres wide.
    await page.getByTestId("in-process").selectOption("plasma");
    await expect(page.locator("tbody tr").filter({ hasText: "Mild steel" })).toContainText("50 mm");
  });

  test("laser-cutter-power-reference: CO₂ vs fibre settings and material limits", async ({ page }) => {
    await page.goto(`${BASE}/cad/laser-cutter-power-reference`, { waitUntil: "networkidle" });
    // Default CO₂ mild steel 3 mm → 1.5 kW, 5 m/min, kerf 0.15.
    await expect(page.getByTestId("res-power")).toContainText("1.5 kW");
    await expect(page.getByTestId("res-speed")).toContainText("5 m/min");
    await expect(page.getByTestId("res-kerf")).toContainText("0.15 mm");
    await expect(page.getByTestId("res-gas")).toContainText("N₂");
    // CO₂ acrylic: 0.12 kW, air assist.
    await page.getByTestId("in-material").selectOption("Acrylic");
    await expect(page.getByTestId("res-power")).toContainText("0.12 kW");
    await expect(page.getByTestId("res-gas")).toContainText("Air / none");
    // Back to mild steel, switch to fibre: 3 mm now cuts at 7 m/min.
    await page.getByTestId("in-material").selectOption("Mild steel");
    await page.getByTestId("in-laser").selectOption("fiber");
    await expect(page.getByTestId("res-speed")).toContainText("7 m/min");
    // Fibre aluminium 3 mm → 2 kW.
    await page.getByTestId("in-material").selectOption("Aluminium");
    await expect(page.getByTestId("res-power")).toContainText("2 kW");
    // Copper/brass is fibre-only: copper 3 mm → kerf 0.18.
    await page.getByTestId("in-material").selectOption("Copper / brass");
    await expect(page.getByTestId("res-kerf")).toContainText("0.18 mm");
    // Back on CO₂ there is no copper row — the selector must reset to a cuttable material.
    await page.getByTestId("in-laser").selectOption("co2");
    await expect(page.getByTestId("res-power")).toContainText("1.5 kW");
  });

  test("waterjet-cutting-reference: speed model spot checks", async ({ page }) => {
    await page.goto(`${BASE}/cad/waterjet-cutting-reference`, { waitUntil: "networkidle" });
    // Mild steel 10 mm @ 4100 bar → 120 mm/min.
    await expect(page.getByTestId("res-speed")).toContainText("120 mm/min");
    await expect(page.getByTestId("res-abrasive")).toContainText("340 g/min");
    // 5 mm → ×2^0.75 ≈ 1.682 → 202 mm/min.
    await page.getByTestId("in-thick").fill("5");
    await expect(page.getByTestId("res-speed")).toContainText("202 mm/min");
    // Aluminium reference is 210 mm/min at 10 mm.
    await page.getByTestId("in-thick").fill("10");
    await page.getByTestId("in-material").selectOption("Aluminium");
    await expect(page.getByTestId("res-speed")).toContainText("210 mm/min");
    // Premium quality halves the traverse speed → 105.
    await page.getByTestId("in-quality").selectOption("premium");
    await expect(page.getByTestId("res-speed")).toContainText("105 mm/min");
    // Back to standard cut with 240 g/min: 210 × 0.78 → 163.8 → 164 mm/min.
    await page.getByTestId("in-quality").selectOption("standard");
    await page.getByTestId("in-abrasive").selectOption("240 g/min");
    await expect(page.getByTestId("res-speed")).toContainText("164 mm/min");
    // Fast cut at 340 g/min: 210 × 1.4 = 294.
    await page.getByTestId("in-abrasive").selectOption("340 g/min");
    await page.getByTestId("in-quality").selectOption("fast");
    await expect(page.getByTestId("res-speed")).toContainText("294 mm/min");
  });
});
