/**
 * scale-bar-tool.test.ts — UI-level verification of the Scale Bar Tool:
 * effective-scale correctness in every mode, the X:1 toggle, Manual step
 * mode, the preview, and the Reset button restoring every field.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Scale Bar Tool", () => {
  test.setTimeout(60_000);

  test("defaults: 1:200/100 mm shows 20 m real and a truthful effective scale", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-seg")).toContainText("5 mm");
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.getByTestId("effective-scale")).toContainText("1 mm paper = 200 mm real");
    await expect(page.locator('svg[aria-label="Scale bar at 1:200"]')).toBeVisible();
  });

  test("X:1 toggle shows the reciprocal scale truthfully (200:1, not 0:1)", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("flip-ratio").click();
    // 200:1 is an enlargement: the 100 mm bar now represents 0.5 mm of reality.
    await expect(page.getByTestId("effective-scale")).toContainText("200:1");
    await expect(page.getByTestId("effective-scale")).toContainText("1 mm paper = 0.005 mm real");
    // The default 1 m segment cannot fit a bar that spans 0.0005 m, so the tool
    // says so instead of printing a segment 2000× the bar it sits on.
    await expect(page.getByTestId("result-invalid")).toBeVisible();
    await expect(page.getByTestId("res-real")).toHaveCount(0);
    await expect(page.getByTestId("seg-range-hint")).toContainText("0.0005 m");
    // Shrink the segment to what the bar can hold → the enlargement comes back.
    await page.getByTestId("in-seg").fill("0.0005");
    await expect(page.getByTestId("res-real")).toContainText("0.0005 m");
    await expect(page.locator('svg[aria-label="Scale bar at 200:1"]')).toBeVisible();
    await page.getByTestId("flip-ratio").click();
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
  });

  test("effective scale is live across scale modes and back", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("in-x").fill("100");
    await expect(page.getByTestId("effective-scale")).toContainText("1:100");
    await expect(page.getByTestId("effective-scale")).toContainText("1 mm paper = 100 mm real");
    await page.getByRole("radio", { name: /Inches-to-the-foot/i }).check();
    await expect(page.getByTestId("effective-scale")).toContainText("0.25″=1′-0″");
    await expect(page.getByTestId("effective-scale")).toContainText("1 mm paper = 48 mm real");
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await expect(page.getByTestId("effective-scale")).toContainText("1.2×");
    await page.getByTestId("in-factor").fill("5");
    await expect(page.getByTestId("effective-scale")).toContainText("5×");
    await page.getByRole("radio", { name: /One-to-X/i }).check();
    await expect(page.getByTestId("effective-scale")).toContainText("1:100");
  });

  test("notation chips: all three live-convert the current scale, from any mode", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Default 1:200 — every radio shows the current scale in ITS notation.
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:200");
    await expect(page.getByTestId("chip-inch-to-foot")).toHaveText("≈ 0.06″=1′-0″");
    await expect(page.getByTestId("chip-scale-factor")).toHaveText("≈ 200×");

    // Editing in one mode updates ALL chips simultaneously.
    await page.getByTestId("in-x").fill("100");
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:100");
    await expect(page.getByTestId("chip-inch-to-foot")).toHaveText("≈ 0.12″=1′-0″");
    await expect(page.getByTestId("chip-scale-factor")).toHaveText("≈ 100×");

    // The chips are conversions of the SCALE, not echoes of the inputs:
    // switch to inches-to-the-foot and they stay consistent.
    await page.getByRole("radio", { name: /Inches-to-the-foot/i }).check();
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:48");
    await expect(page.getByTestId("chip-inch-to-foot")).toHaveText("≈ 0.25″=1′-0″");
    await expect(page.getByTestId("chip-scale-factor")).toHaveText("≈ 48×");

    // Scale-factor mode, 5×.
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await page.getByTestId("in-factor").fill("5");
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:5");
    await expect(page.getByTestId("chip-inch-to-foot")).toHaveText("≈ 2.4″=1′-0″");
    await expect(page.getByTestId("chip-scale-factor")).toHaveText("≈ 5×");

    // X:1 flip: the enlarged ratio renders as 200:1, never "1:0.005".
    await page.getByRole("radio", { name: /One-to-X/i }).check();
    await page.getByTestId("in-x").fill("200");
    await page.getByTestId("flip-ratio").click();
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("200:1");
  });

  test("geometry sliders and their number inputs stay in sync both ways", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Drag (set) the width slider → the paired number input follows.
    await page.getByTestId("slider-width").fill("250");
    await expect(page.getByTestId("in-width")).toHaveValue("250");
    await expect(page.getByTestId("res-total")).toContainText("250 mm");

    // Type into the number input → the slider position follows.
    await page.getByTestId("in-width").fill("60");
    await expect(page.getByTestId("slider-width")).toHaveValue("60");

    // Height + line width pairs sync too.
    await page.getByTestId("slider-height").fill("24");
    await expect(page.getByTestId("in-height")).toHaveValue("24");
    await page.getByTestId("in-lineWidth").fill("2");
    await expect(page.getByTestId("slider-lineWidth")).toHaveValue("2");

    // Out-of-slider-range numbers stay typed in the box; the slider pins to
    // its bound rather than lying about the value.
    await page.getByTestId("in-width").fill("999");
    await expect(page.getByTestId("in-width")).toHaveValue("999");
    await expect(page.getByTestId("slider-width")).toHaveValue("400");
    await expect(page.getByTestId("res-total")).toContainText("999 mm");
  });

  test("bar style radios re-render the bar preview", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    const svg = page.locator("svg[aria-label^='Scale bar at 1:200']");

    // Double row (default): 5 steps × 2 rows = 10 rects.
    await expect(svg.locator("rect")).toHaveCount(10);

    await page.getByRole("radio", { name: "Single row" }).check();
    await expect(svg.locator("rect")).toHaveCount(5);

    await page.getByRole("radio", { name: "Line", exact: true }).check();
    await expect(svg.locator("rect")).toHaveCount(0);
    // Ruled line + numSteps+1 ticks.
    await expect(svg.locator("line")).toHaveCount(7);

    await page.getByRole("radio", { name: "Double row" }).check();
    await expect(svg.locator("rect")).toHaveCount(10);
  });

  test("Automatic shows the live read-only step count; Manual opens the seeded per-segment editor", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Automatic: the count field is VISIBLE (matches the reference) and shows
    // the live computed count (5 for 1:200 exponential), but is read-only.
    await expect(page.getByTestId("in-stepCount")).toBeVisible();
    await expect(page.getByTestId("in-stepCount")).toBeDisabled();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("5");
    await expect(page.getByTestId("res-steps")).toContainText("5");

    // Steps + division are inline radio groups, not dropdowns.
    await expect(page.getByTestId("radio-stepMode-automatic")).toBeChecked();
    await expect(page.getByTestId("radio-divStyle-exponential")).toBeChecked();
    await expect(page.locator('select[data-testid="in-stepMode"], select[data-testid="in-divStyle"]')).toHaveCount(0);

    // The automatic value is LIVE: proportional division recomputes it to 10.
    await page.getByTestId("radio-divStyle-proportional").check();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("10");
    await expect(page.getByTestId("res-steps")).toContainText("10");
    await page.getByTestId("radio-divStyle-exponential").check();

    // No per-segment editor while Automatic owns the steps.
    await expect(page.getByTestId("steps-manual")).toHaveCount(0);

    // Manual: the editor replaces the automatic sub-box, pre-seeded from the
    // bar the user was just looking at (1:200 · 100 mm · exponential → the
    // interior boundaries 1.25 / 2.5 / 5 / 10 / 20).
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.getByTestId("steps-subbox")).toHaveCount(0);
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(5);
    for (const [i, v] of ["1.25", "2.5", "5", "10", "20"].entries()) {
      await expect(page.getByTestId(`in-stepValue-${i}`)).toHaveValue(v);
    }
    // Because the seed IS the automatic bar, nothing about the result moves.
    await expect(page.getByTestId("res-steps")).toContainText("5");
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    // In Manual the width follows the last boundary, so the slider is locked.
    await expect(page.getByTestId("in-width")).toBeDisabled();
    await expect(page.getByTestId("slider-width")).toBeDisabled();
    await expect(page.getByTestId("width-manual-note")).toContainText("100 mm on paper");

    // Back to Automatic: the live read-only count is back and follows the
    // division style again.
    await page.getByTestId("radio-stepMode-automatic").check();
    await expect(page.getByTestId("in-stepCount")).toBeDisabled();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("5");
    await page.getByTestId("radio-divStyle-proportional").check();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("10");
    await page.getByTestId("radio-divStyle-exponential").check();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("5");

    // …while Manual still shows the rows the user already had (no data loss).
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(5);
    await page.getByTestId("in-stepValue-0").fill("2");
    await page.getByTestId("radio-stepMode-automatic").check();
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.getByTestId("in-stepValue-0")).toHaveValue("2");
  });

  test("Manual editor: Add step / Delete / Sort steps all re-derive the bar", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("radio-stepMode-manual").check();

    // Add step appends a row. An empty row does NOT move the bar (an
    // unfinished box must not silently become a 0 boundary)…
    await page.getByTestId("step-add").click();
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(6);
    await expect(page.getByTestId("in-stepValue-5")).toHaveValue("");
    await expect(page.getByTestId("res-steps")).toContainText("5");
    await expect(page.getByTestId("res-real")).toContainText("20 m");

    // …but once it has a value the bar grows to cover it (40 m at 1:200 = 200 mm).
    await page.getByTestId("in-stepValue-5").fill("40");
    await expect(page.getByTestId("res-steps")).toContainText("6");
    await expect(page.getByTestId("res-total")).toContainText("200 mm");
    await expect(page.getByTestId("res-real")).toContainText("40 m");

    // Delete removes exactly that row and re-derives the bar.
    await page.getByTestId("step-delete-5").click();
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(5);
    await expect(page.getByTestId("res-real")).toContainText("20 m");

    // Sort steps orders the rows ascending by value.
    await page.getByTestId("in-stepValue-0").fill("15");
    await page.getByTestId("step-sort").click();
    for (const [i, v] of ["2.5", "5", "10", "15", "20"].entries()) {
      await expect(page.getByTestId(`in-stepValue-${i}`)).toHaveValue(v);
    }

    // The range hint is tied to the current scale + unit (400 mm paper max
    // at 1:200 = 80 m), not to a hardcoded number.
    await expect(page.getByTestId("step-range-hint")).toContainText("between 0 and 80 m");

    // Out-of-range values are flagged without breaking the bar.
    await page.getByTestId("in-stepValue-4").fill("900");
    await expect(page.getByTestId("step-invalid-4")).toBeVisible();
    await page.getByTestId("in-stepValue-4").fill("20");
    await expect(page.getByTestId("step-invalid-4")).toHaveCount(0);
  });

  test("Manual editor: the 'Add numbers' ladder fills 0.1w…w and labels only the largest tick", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("radio-stepMode-manual").check();

    // The button names the numbers it will add, derived from the bar's own max
    // (20 m → the 1…10 ladder), exactly like the reference's helper.
    const ladder = page.getByTestId("step-add-tens");
    await expect(ladder).toContainText("Add numbers 1, 2, 3, .. till 10");
    await ladder.click();

    // Existing rows the ladder covers (≤ 10) are replaced by it; the row above
    // the ladder (20) survives.
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(11);
    await expect(page.getByTestId("in-stepValue-0")).toHaveValue("20");
    await expect(page.getByTestId("in-stepValue-1")).toHaveValue("1");
    await expect(page.getByTestId("in-stepValue-10")).toHaveValue("10");

    // Only the largest ladder tick is labelled; the fine ticks are not.
    await expect(page.getByTestId("step-label-10")).toBeChecked();
    await expect(page.getByTestId("step-label-1")).not.toBeChecked();

    // Sorting puts the ladder in order and the bar keeps covering 20 m.
    await page.getByTestId("step-sort").click();
    await expect(page.getByTestId("in-stepValue-0")).toHaveValue("1");
    await expect(page.getByTestId("in-stepValue-10")).toHaveValue("20");
    await expect(page.getByTestId("res-real")).toContainText("20 m");

    // Unlabelled ticks render fewer text labels on the bar preview: the 10
    // interior boundaries that lack a label lose their text, leaving 0 / 10 / 20.
    const svg = page.locator("svg[aria-label='Scale bar at 1:200']");
    await expect(svg.locator("text")).toHaveCount(3);
  });

  test("Manual editor: the Label checkbox shows/hides that tick's text on the bar", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await page.getByTestId("radio-stepMode-manual").check();
    const svg = page.locator("svg[aria-label='Scale bar at 1:200']");

    // Seeded from the automatic bar, so every boundary is labelled (6 ticks).
    await expect(svg.locator("text")).toHaveCount(6);
    await expect(svg.locator("text", { hasText: /^1\.25$/ })).toBeVisible();

    await page.getByTestId("step-label-0").uncheck();
    await expect(svg.locator("text")).toHaveCount(5);
    await expect(svg.locator("text", { hasText: /^1\.25$/ })).toHaveCount(0);
    // The bar geometry itself is untouched — only its text.
    await expect(svg.locator("rect")).toHaveCount(10);

    await page.getByTestId("step-label-0").check();
    await expect(svg.locator("text")).toHaveCount(6);
  });

  test("Real-length unit: 40 units in 4 labelled groups, and conversions round-trip", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    const select = page.getByTestId("in-unit");

    // Four optgroups, in the reference's order, with the reference's labels.
    await expect(select.locator("optgroup")).toHaveCount(4);
    expect(await select.locator("optgroup").evaluateAll((gs) => gs.map((g) => g.getAttribute("label")))).toEqual([
      "Metric", "Imperial / Survey / Nautical", "Scientific / Astronomical", "Typography / Digital",
    ]);
    // 40 options, no duplicates (the old list repeated nautical mile).
    await expect(select.locator("option")).toHaveCount(40);
    const values = await select.locator("option").evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value));
    expect(new Set(values).size).toBe(40);
    // Option text is "name (symbol)", and the nautical mile keeps its own label.
    await expect(select.locator('option[value="m"]')).toHaveText("meter (m)");
    await expect(select.locator('option[value="NM"]')).toHaveText("nautical mile (NM or nmi)");
    await expect(select.locator('option[value="hpgl"]')).toHaveText("HP-GL (hpgl)");
    await expect(select.locator('option[value="Å"]')).toHaveText("ångström (Å)");
    await expect(select.locator("option", { hasText: "nautical mile" })).toHaveCount(1);

    // Round-trip through the dropdown: 100 mm at 1:200 is 20 m, 65.6168 ft,
    // and 20 m again — the unit only changes the readout, never the geometry.
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await select.selectOption("ft");
    await expect(page.getByTestId("res-real")).toContainText("65.6168 ft");
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    await select.selectOption("mm");
    await expect(page.getByTestId("res-real")).toContainText("20000 mm");
    await select.selectOption("m");
    await expect(page.getByTestId("res-real")).toContainText("20 m");

    // Every one of the 40 units is selectable and yields a finite, NON-ZERO
    // readout — four fixed decimals used to print the extreme units (light-year,
    // petameter, …) as a bare "0", i.e. the bar appeared to have no length.
    // The segment is shrunk first: at 1:200 a 100 mm bar is only 2e-23 Ym long
    // (and 2e-15 ly), so a "1" segment is correctly rejected as longer than the
    // whole bar in those units (item 1) and the readout this test is about would
    // be withheld. 1e-24 fits every one of the 40 units.
    await page.getByTestId("in-seg").fill("1e-24");
    for (const v of values) {
      await select.selectOption(v);
      const txt = (await page.getByTestId("res-real").innerText()).trim();
      const num = parseFloat(txt);
      expect(Number.isFinite(num) && num !== 0, `${v} → "${txt}"`).toBe(true);
    }
    await select.selectOption("ly");
    await expect(page.getByTestId("res-real")).toContainText("e-15");
    await select.selectOption("m");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
  });

  test("Reset restores every field to its documented default", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // ── Change EVERYTHING ────────────────────────────────────────────────
    await page.getByTestId("in-x").fill("75");
    await page.getByTestId("flip-ratio").click(); // flipX on
    await page.getByRole("radio", { name: /Inches-to-the-foot/i }).check();
    await page.getByTestId("in-inchPaper").fill("0.5");
    await page.getByTestId("in-footReal").fill("2");
    await page.getByTestId("in-inchReal").fill("6");
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await page.getByTestId("in-factor").fill("7");
    await page.getByTestId("in-unit").selectOption("ft");
    await page.getByTestId("in-seg").fill("3");
    await page.getByTestId("in-width").fill("250");
    await page.getByTestId("in-height").fill("20");
    await page.getByTestId("in-lineWidth").fill("1.2");
    // Division style lives in the Automatic sub-box (it only affects the
    // automatic split), so set it before handing the steps over to Manual.
    await page.getByTestId("radio-divStyle-proportional").check();
    await page.getByTestId("radio-stepMode-manual").check();
    await page.getByTestId("step-add").click();
    await page.getByTestId("in-stepValue-0").fill("99");
    await page.getByRole("radio", { name: "Line", exact: true }).check();
    await page.getByTestId("in-hex").fill("#ff0000");

    // Sanity-check that we actually left the defaults. In Manual mode the
    // Width field is locked to the width derived from the last step boundary,
    // so it no longer shows the 250 mm that was typed while in Automatic.
    await expect(page.getByTestId("in-unit")).toHaveValue("ft");
    await expect(page.getByTestId("radio-stepMode-manual")).toBeChecked();
    await expect(page.getByTestId("in-width")).toBeDisabled();
    await expect(page.getByTestId("in-width")).not.toHaveValue("250");
    await expect(page.getByTestId("in-hex")).toHaveValue("#ff0000");

    // ── Click Reset (the tool's only one, in the Result panel) ────────────
    await page.getByTestId("reset-results").click();

    // Scale mode + value + flip.
    await expect(page.getByRole("radio", { name: /One-to-X/i })).toBeChecked();
    await expect(page.getByTestId("in-x")).toHaveValue("200");
    await expect(page.getByText("Scale 1 : X")).toBeVisible();
    // Real-length unit + segment value.
    await expect(page.getByTestId("in-unit")).toHaveValue("m");
    await expect(page.getByTestId("in-seg")).toHaveValue("1");
    // Bar geometry.
    await expect(page.getByTestId("in-width")).toHaveValue("100");
    await expect(page.getByTestId("in-height")).toHaveValue("12");
    await expect(page.getByTestId("in-lineWidth")).toHaveValue("0.5");
    // Steps: mode back to automatic (count visible, read-only, computed), and
    // the manual rows cleared — reopening the editor re-seeds from the reset
    // bar rather than resurrecting the pre-reset rows.
    await expect(page.getByTestId("radio-stepMode-automatic")).toBeChecked();
    await expect(page.getByTestId("in-stepCount")).toBeDisabled();
    await expect(page.getByTestId("in-stepCount")).toHaveValue("5");
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(5);
    await expect(page.getByTestId("in-stepValue-0")).toHaveValue("1.25");
    await expect(page.getByTestId("in-stepValue-4")).toHaveValue("20");
    await page.getByTestId("radio-stepMode-automatic").check();
    // Division + bar style.
    await expect(page.getByTestId("radio-divStyle-exponential")).toBeChecked();
    await expect(page.getByRole("radio", { name: "Double row" })).toBeChecked();
    // Color (picker + hex text).
    await expect(page.getByTestId("in-color")).toHaveValue("#334155");
    await expect(page.getByTestId("in-hex")).toHaveValue("#334155");
    // Outputs reverted to the documented default bar.
    await expect(page.getByTestId("res-seg")).toContainText("5 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.locator('svg[aria-label="Scale bar at 1:200"]')).toBeVisible();
  });

  test("result-panel Reset restores every field too (both reset buttons share one handler)", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Scatter state across both panels.
    await page.getByTestId("in-x").fill("50");
    await page.getByTestId("in-width").fill("300");
    await page.getByTestId("in-height").fill("30");
    await page.getByTestId("in-lineWidth").fill("3");
    await page.getByRole("radio", { name: "Single row" }).check();
    await page.getByTestId("in-hex").fill("#00ff00");
    await page.getByTestId("in-unit").selectOption("cm");

    // The result-panel button (next to the export row) does the same full reset.
    await page.getByTestId("reset-results").click();

    await expect(page.getByTestId("in-x")).toHaveValue("200");
    await expect(page.getByTestId("in-width")).toHaveValue("100");
    await expect(page.getByTestId("slider-width")).toHaveValue("100");
    await expect(page.getByTestId("in-height")).toHaveValue("12");
    await expect(page.getByTestId("slider-height")).toHaveValue("12");
    await expect(page.getByTestId("in-lineWidth")).toHaveValue("0.5");
    await expect(page.getByTestId("slider-lineWidth")).toHaveValue("0.5");
    await expect(page.getByRole("radio", { name: "Double row" })).toBeChecked();
    await expect(page.getByTestId("in-hex")).toHaveValue("#334155");
    await expect(page.getByTestId("in-unit")).toHaveValue("m");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await expect(page.locator('svg[aria-label="Scale bar at 1:200"]')).toBeVisible();
  });

  test("single-column layout: label-left/control-right rows in one card, results in a panel below", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // One column: the layout wrapper is a flex column whose two children (the
    // input card and the highlighted result panel) are stacked, same width.
    // This is what replaced the old two-panel `lg:grid-cols-2` split.
    const layout = page.getByTestId("tool-layout");
    expect(await layout.evaluate((el) => getComputedStyle(el).flexDirection)).toBe("column");
    const kids = layout.locator(":scope > *");
    await expect(kids).toHaveCount(2);
    const inputCard = await kids.nth(0).boundingBox();
    const resultPanel = await kids.nth(1).boundingBox();
    expect(resultPanel!.y).toBeGreaterThanOrEqual(inputCard!.y + inputCard!.height);
    expect(Math.abs(resultPanel!.width - inputCard!.width)).toBeLessThanOrEqual(1);

    // Every field uses the shared row pattern (label left, control right).
    for (const t of ["row-unit", "row-seg", "row-width", "row-height", "row-lineWidth", "row-stepMode", "row-barStyle", "row-color"]) {
      await expect(page.getByTestId(t)).toHaveCount(1);
    }

    // Desktop: the label sits to the LEFT of the control, on the same line.
    const row = page.getByTestId("row-width");
    const label = await row.locator("span").first().boundingBox();
    const control = await page.getByTestId("in-width").boundingBox();
    expect(label!.x + label!.width).toBeLessThanOrEqual(control!.x + 1);
    const labelCenterY = label!.y + label!.height / 2;
    expect(labelCenterY).toBeGreaterThanOrEqual(control!.y);
    expect(labelCenterY).toBeLessThanOrEqual(control!.y + control!.height);

    // Mobile: the same row stacks label-over-control (no overflow, no squeeze).
    await page.setViewportSize({ width: 375, height: 800 });
    const mLabel = await row.locator("span").first().boundingBox();
    const mControl = await page.getByTestId("in-width").boundingBox();
    expect(mLabel!.y + mLabel!.height).toBeLessThanOrEqual(mControl!.y + 1);
    expect(mControl!.x + mControl!.width).toBeLessThanOrEqual(375);
  });

  test("density pass: Width/Height/Line width stacked full-width, inline effective scale, tightened rows", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Width, Height and Line width are three SEPARATE full-width rows stacked
    // in that order (the reference's layout), not a two-column pair.
    const rowW = await page.getByTestId("row-width").boundingBox();
    const rowH = await page.getByTestId("row-height").boundingBox();
    const rowL = await page.getByTestId("row-lineWidth").boundingBox();
    expect(rowH!.y).toBeGreaterThanOrEqual(rowW!.y + rowW!.height - 1);
    expect(rowL!.y).toBeGreaterThanOrEqual(rowH!.y + rowH!.height - 1);

    // Each row's number box is the same full width (no half-width cells), and
    // each slider sits below its own number box.
    const width = await page.getByTestId("in-width").boundingBox();
    const height = await page.getByTestId("in-height").boundingBox();
    const lineWidth = await page.getByTestId("in-lineWidth").boundingBox();
    expect(Math.abs(width!.width - lineWidth!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(height!.width - lineWidth!.width)).toBeLessThanOrEqual(1);
    expect(height!.y).toBeGreaterThan(width!.y + width!.height - 1);
    expect(lineWidth!.y).toBeGreaterThan(height!.y + height!.height - 1);
    const widthSlider = await page.getByTestId("slider-width").boundingBox();
    expect(widthSlider!.y).toBeGreaterThanOrEqual(width!.y + width!.height - 1);

    // Effective scale is a plain inline line, not a shaded/padded box.
    const eff = page.getByTestId("effective-scale");
    await expect(eff).toContainText("1:200");
    await expect(eff).toContainText("1 mm paper = 200 mm real");
    const effStyle = await eff.evaluate((el) => {
      const c = getComputedStyle(el);
      return { tag: el.tagName, bg: c.backgroundColor, padding: c.padding, border: c.borderTopWidth };
    });
    expect(effStyle.tag).toBe("P");
    expect(effStyle.bg).toBe("rgba(0, 0, 0, 0)");
    expect(effStyle.padding).toBe("0px");
    expect(effStyle.border).toBe("0px");

    // Density guards — the tightened values, so the spacing can't silently
    // creep back: row padding 6px (was 8px), scale-radio gap 4px (was 8px).
    expect(await page.getByTestId("row-unit").evaluate((el) => getComputedStyle(el).paddingTop)).toBe("6px");
    expect(await page.getByTestId("scale-mode-list").evaluate((el) => getComputedStyle(el).gap)).toBe("4px");

    // Whole tool span (input card + result panel) stays inside ~1.8 viewports.
    const span = await page.getByTestId("tool-layout").evaluate((el) => el.getBoundingClientRect().height);
    expect(span).toBeLessThanOrEqual(1400);

    // Mobile: the three geometry rows stay stacked, full width, no overflow.
    await page.setViewportSize({ width: 375, height: 800 });
    const mWidth = await page.getByTestId("in-width").boundingBox();
    const mHeight = await page.getByTestId("in-height").boundingBox();
    const mLine = await page.getByTestId("in-lineWidth").boundingBox();
    expect(mHeight!.y).toBeGreaterThan(mWidth!.y + mWidth!.height);
    expect(mLine!.y).toBeGreaterThan(mHeight!.y + mHeight!.height);
    for (const b of [mWidth!, mHeight!, mLine!]) expect(b.x + b.width).toBeLessThanOrEqual(375);
  });

  test("flipping a ratio re-normalizes every notation chip and the effective scale", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Flipping re-normalizes every notation chip and the effective scale — the
    // same behaviour the reference's badge-attached toggle had. (Placement of
    // the control itself is covered by "ratio flip is one affordance…".)
    const toggle = page.getByTestId("flip-ratio");
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:200");
    await toggle.click();
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("200:1");
    await expect(page.getByTestId("chip-inch-to-foot")).toHaveText("≈ 2400″=1′-0″");
    await expect(page.getByTestId("effective-scale")).toContainText("200:1");
    await expect(page.getByText("Scale X : 1")).toBeVisible();
    await toggle.click();
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.getByText("Scale 1 : X")).toBeVisible();
  });

  test("preview is legible with numeric tick labels plus the plain-language summary", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("bar-summary")).toContainText(
      "The width of the scale bar is 100 mm, representing 20 m in real life.",
    );
    // The on-screen zoom makes the bar large enough to read (was 104×18 px).
    const svg = page.locator('svg[aria-label="Scale bar at 1:200"]');
    await expect(svg).toHaveAttribute("width", "416");
    await expect(svg.locator("text")).toHaveCount(6); // 0…20 over 5 steps
    for (const t of ["0", "1.25", "2.5", "5", "10", "20"]) {
      await expect(svg.locator("text", { hasText: new RegExp(`^${t}$`) })).toBeVisible();
    }
    await expect(svg.locator("rect")).toHaveCount(10); // 5 steps × 2 rows
    // Download group label present.
    await expect(page.getByText("Download as")).toBeVisible();
  });

  // ── Item 1: a segment longer than the bar is never presented as a result ────
  test("one segment longer than the bar is rejected — never shown larger than the full bar", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Exact repro: scale factor 1.2 → a 100 mm bar spans only 0.12 m real, so a
    // "one segment = 1 m" input cannot fit even once. Before the fix the tool
    // printed "One segment on paper: 833.333 mm" against "Full bar on paper:
    // 100 mm" with a step count that implied the segments fit.
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await page.getByTestId("in-factor").fill("1.2");
    await page.getByTestId("in-width").fill("100");
    await page.getByTestId("in-seg").fill("1");

    // Inline validation, in the same "value can be between" pattern Manual uses.
    await expect(page.getByTestId("seg-invalid")).toBeVisible();
    await expect(page.getByTestId("seg-range-hint")).toContainText("0.12 m");
    // The self-contradictory number set is gone: no segment readout, no step
    // count that pretends the segments fit, no preview of a bar that can't exist.
    await expect(page.getByTestId("result-invalid")).toBeVisible();
    await expect(page.getByTestId("res-seg")).toHaveCount(0);
    await expect(page.getByTestId("res-steps")).toHaveCount(0);
    await expect(page.getByTestId("bar-preview")).toHaveCount(0);
    // …and the input panel's read-only count is blank rather than "2".
    await expect(page.getByTestId("in-stepCount")).toHaveValue("");

    // Fix the segment → the error clears and one 0.12 m segment spans the whole bar.
    await page.getByTestId("in-seg").fill("0.12");
    await expect(page.getByTestId("result-invalid")).toHaveCount(0);
    await expect(page.getByTestId("seg-invalid")).toHaveCount(0);
    const seg = parseFloat(await page.getByTestId("res-seg").innerText());
    const total = parseFloat(await page.getByTestId("res-total").innerText());
    expect(seg).toBeLessThanOrEqual(total + 1e-9);
    expect(seg).toBeCloseTo(100, 6);
    await expect(page.getByTestId("res-real")).toContainText("0.12 m");
    await expect(page.locator("svg[aria-label^='Scale bar at 1.2']")).toBeVisible();
  });

  test("sweep: the segment-on-paper readout never exceeds the full-bar readout", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // The invariant the item-1 bug violated, over scales × widths × segment sizes.
    const combos: [x: string, width: string][] = [
      ["1", "10"],
      ["50", "400"],
      ["200", "100"],
      ["5000", "250"],
    ];
    for (const [x, width] of combos) {
      await page.getByTestId("in-x").fill(x);
      await page.getByTestId("in-width").fill(width);
      for (const seg of ["0.001", "1", "10", "1000"]) {
        await page.getByTestId("in-seg").fill(seg);
        const r = await page.evaluate(() => {
          const text = (t: string) => document.querySelector(`[data-testid="${t}"]`)?.textContent?.trim() ?? null;
          return {
            seg: text("res-seg"),
            total: text("res-total"),
            invalid: !!document.querySelector('[data-testid="result-invalid"]'),
          };
        });
        if (r.seg !== null && r.total !== null) {
          expect(r.invalid, `1:${x} ${width}mm seg=${seg} must not be both shown and invalid`).toBe(false);
          expect(parseFloat(r.seg), `1:${x} ${width}mm seg=${seg}: ${r.seg} vs ${r.total}`)
            .toBeLessThanOrEqual(parseFloat(r.total) + 1e-9);
        } else {
          // No numbers shown ⟹ the panel must say why, never silently blank.
          expect(r.invalid, `1:${x} ${width}mm seg=${seg} is hidden but not flagged`).toBe(true);
        }
      }
    }
  });

  // ── Item 2: the Automatic → Manual hand-off, at every scale ─────────────────
  test("Automatic to Manual hand-off agrees with the current scale (count, seed, range)", async ({ page }) => {
    // Each config starts from a FRESH tool, i.e. at the moment of the first
    // Automatic → Manual switch (the state the audit is about).
    const configs = [
      { label: "large 1:X — 1:200", setup: "one-to-x" as const },
      { label: "small factor — 1.2×", setup: "scale-factor" as const },
      { label: "inches-to-foot — ¼″=1′-0″", setup: "inch-to-foot" as const },
    ];

    for (const c of configs) {
      await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
      if (c.setup === "one-to-x") {
        await page.getByTestId("in-x").fill("200");
      } else if (c.setup === "scale-factor") {
        await page.getByRole("radio", { name: /Scale factor/i }).check();
        await page.getByTestId("in-factor").fill("1.2");
        await page.getByTestId("in-seg").fill("0.1");
      } else {
        await page.getByRole("radio", { name: /Inches-to-the-foot/i }).check();
        await page.getByTestId("in-inchPaper").fill("0.25");
        await page.getByTestId("in-footReal").fill("1");
        await page.getByTestId("in-inchReal").fill("0");
      }
      await page.getByTestId("in-width").fill("100");
      await page.getByTestId("in-unit").selectOption("m");

      const steps = Number(await page.getByTestId("in-stepCount").inputValue());
      const realAuto = parseFloat(await page.getByTestId("res-real").innerText());

      // Switch to Manual: the seed must describe the bar on screen right now.
      await page.getByTestId("radio-stepMode-manual").check();
      await expect(page.locator('[data-testid^="step-row-"]'), c.label).toHaveCount(steps);
      await expect(page.getByTestId("res-steps"), c.label).toContainText(String(steps));
      expect(parseFloat(await page.getByTestId("res-real").innerText()), c.label)
        .toBeCloseTo(realAuto, 4);
      const lastSeed = parseFloat(await page.getByTestId(`in-stepValue-${steps - 1}`).inputValue());
      expect(lastSeed, `${c.label}: largest seed is the automatic span`).toBeCloseTo(realAuto, 4);
      const hint = await page.getByTestId("step-range-hint").innerText();
      const rangeMax = parseFloat(/0 and ([^\s]+)/.exec(hint)?.[1] ?? "NaN");
      expect(rangeMax, `${c.label}: seeded ${lastSeed} must fit range "${hint}"`)
        .toBeGreaterThanOrEqual(lastSeed);
      // …and no seeded row is flagged against that same range.
      await expect(page.getByTestId(/step-invalid-\d+/).first(), c.label).toHaveCount(0);
    }
  });

  // ── Item 2b: rows are preserved on re-entry, but re-validated live ──────────
  test("re-entering Manual keeps the user's rows and re-checks them against the live range", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // Seed from the 1:200 bar, edit one row, go back to Automatic.
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.locator('[data-testid^="step-row-"]')).toHaveCount(5);
    await page.getByTestId("in-stepValue-0").fill("2");
    await page.getByTestId("radio-stepMode-automatic").check();

    // Change the scale underneath it: the rows are the user's data, so they are
    // NOT silently re-seeded — but the stated range and the per-row flags are
    // recomputed for the scale now in force (0.48 m at 1.2×, not 80 m at 1:200).
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await page.getByTestId("in-factor").fill("1.2");
    await page.getByTestId("radio-stepMode-manual").check();
    await expect(page.getByTestId("in-stepValue-0"), "user's edit survives").toHaveValue("2");
    await expect(page.getByTestId("step-range-hint")).toContainText("0.48 m");
    await expect(page.getByTestId("step-invalid-0")).toBeVisible();
  });

  // ── Item 3: exactly one Reset control, and it is a full reset ───────────────
  test("only one Reset control remains, and it resets the whole form", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("reset-results")).toHaveCount(1);
    await expect(page.getByTestId("reset")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /reset fields/i })).toHaveCount(1);

    await page.getByTestId("in-x").fill("50");
    await page.getByTestId("in-width").fill("300");
    await page.getByRole("radio", { name: "Single row" }).check();
    await page.getByTestId("reset-results").click();
    await expect(page.getByTestId("in-x")).toHaveValue("200");
    await expect(page.getByTestId("in-width")).toHaveValue("100");
    await expect(page.getByRole("radio", { name: "Double row" })).toBeChecked();
  });

  // ── Item 5/6: labelling consistency ────────────────────────────────────────
  test("Scale factor carries no stray bare × and Manual rows name their unit", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // The stray "×" next to the SCALE FACTOR label was a static unit tag from
    // Num, not a control. It is gone, and no bare "×" affordance replaces it.
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await expect(page.getByTestId("in-factor")).toHaveCount(1);
    expect(await page.locator("span", { hasText: /^×$/ }).count()).toBe(0);
    expect(await page.getByRole("button", { name: /^×$/ }).count()).toBe(0);

    // Manual rows show a lowercase, spelled-out unit tag ("meter (m)"), never a
    // bare uppercase "M".
    await page.getByRole("radio", { name: /One-to-X/i }).check();
    await page.getByTestId("radio-stepMode-manual").check();
    const unitTag = await page.getByTestId("step-row-0").locator("span").first().innerText();
    expect(unitTag).toContain("meter (m)");
    await expect(page.getByTestId("step-row-0").locator("span", { hasText: /^M$/ })).toHaveCount(0);
  });

  // ── Item 4: one flip affordance for every ratio mode ────────────────────────
  test("ratio flip is one affordance, placed the same way in both ratio modes", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // One-to-X: the flip sits at the trailing edge of the value input it inverts.
    await page.getByRole("radio", { name: /One-to-X/i }).check();
    await page.getByTestId("in-x").fill("200");
    const flipX = page.getByTestId("flip-ratio");
    await expect(flipX).toHaveCount(1);
    await expect(flipX).toContainText("Flip ratio");
    let box = await flipX.boundingBox();
    let field = await page.getByTestId("in-x").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(field!.x + field!.width - 1);
    expect(Math.abs(box!.y + box!.height / 2 - (field!.y + field!.height / 2))).toBeLessThanOrEqual(6);
    await flipX.click();
    await expect(page.getByText("Scale X : 1")).toBeVisible();
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("200:1");
    await flipX.click();
    await expect(page.getByTestId("chip-one-to-x")).toHaveText("1:200");

    // Scale factor: the SAME control, in the SAME position, inverting the factor.
    await page.getByRole("radio", { name: /Scale factor/i }).check();
    await page.getByTestId("in-factor").fill("2");
    const flipF = page.getByTestId("flip-ratio");
    await expect(flipF).toHaveCount(1);
    await expect(flipF).toContainText("Flip ratio");
    box = await flipF.boundingBox();
    field = await page.getByTestId("in-factor").boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(field!.x + field!.width - 1);
    expect(Math.abs(box!.y + box!.height / 2 - (field!.y + field!.height / 2))).toBeLessThanOrEqual(6);
    await flipF.click();
    await expect(page.getByTestId("in-factor")).toHaveValue("0.5");

    // Inches-to-the-foot has no inversion, so it exposes no flip control at all.
    await page.getByRole("radio", { name: /Inches-to-the-foot/i }).check();
    await expect(page.getByTestId("flip-ratio")).toHaveCount(0);
  });

  test("regression: 1:200 with a 100 mm bar is still 20 m in real life", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-total")).toContainText("100 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.locator('svg[aria-label="Scale bar at 1:200"]')).toBeVisible();
  });
});