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
    await page.getByRole("button", { name: /Toggle X : 1/i }).click();
    // 200:1 is an enlargement: 100 mm paper = 0.5 mm real = 0.0005 m.
    await expect(page.getByTestId("effective-scale")).toContainText("200:1");
    await expect(page.getByTestId("effective-scale")).toContainText("1 mm paper = 0.005 mm real");
    await expect(page.getByTestId("res-real")).toContainText("0.0005 m");
    await expect(page.locator('svg[aria-label="Scale bar at 200:1"]')).toBeVisible();
    await page.getByRole("button", { name: /Show 1 : X/i }).click();
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

  test("Manual steps reveals the step-count input; Automatic hides it and recomputes", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });
    // Automatic: no step-count input; step count derived (5 for 1:200 exp).
    await expect(page.getByTestId("in-stepCount")).toHaveCount(0);
    await expect(page.getByTestId("res-steps")).toContainText("5");

    await page.getByTestId("in-stepMode").selectOption("manual");
    await expect(page.getByTestId("in-stepCount")).toHaveCount(1);
    await page.getByTestId("in-stepCount").fill("8");
    await expect(page.getByTestId("res-steps")).toContainText("8");
    await page.getByTestId("in-stepCount").fill("3");
    await expect(page.getByTestId("res-steps")).toContainText("3");

    await page.getByTestId("in-stepMode").selectOption("automatic");
    await expect(page.getByTestId("in-stepCount")).toHaveCount(0);
    await expect(page.getByTestId("res-steps")).toContainText("5"); // recomputed

    // Proportional division auto = 10 steps at 20 segments.
    await page.getByTestId("in-divStyle").selectOption("proportional");
    await expect(page.getByTestId("res-steps")).toContainText("10");
  });

  test("Reset restores every field to its documented default", async ({ page }) => {
    await page.goto(`${BASE}/cad/scale-bar-tool`, { waitUntil: "networkidle" });

    // ── Change EVERYTHING ────────────────────────────────────────────────
    await page.getByTestId("in-x").fill("75");
    await page.getByRole("button", { name: /Toggle X : 1/i }).click(); // flipX on
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
    await page.getByTestId("in-stepMode").selectOption("manual");
    await page.getByTestId("in-stepCount").fill("8");
    await page.getByTestId("in-divStyle").selectOption("proportional");
    await page.getByTestId("in-barStyle").selectOption("line");
    await page.getByTestId("in-hex").fill("#ff0000");

    // Sanity-check that we actually left the defaults.
    await expect(page.getByTestId("in-unit")).toHaveValue("ft");
    await expect(page.getByTestId("in-width")).toHaveValue("250");
    await expect(page.getByTestId("in-stepMode")).toHaveValue("manual");

    // ── Click Reset ──────────────────────────────────────────────────────
    await page.getByTestId("reset").click();

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
    // Steps: mode back to automatic, manual count hidden but restored.
    await expect(page.getByTestId("in-stepMode")).toHaveValue("automatic");
    await expect(page.getByTestId("in-stepCount")).toHaveCount(0);
    await page.getByTestId("in-stepMode").selectOption("manual");
    await expect(page.getByTestId("in-stepCount")).toHaveValue("5");
    await page.getByTestId("in-stepMode").selectOption("automatic");
    // Division + bar style.
    await expect(page.getByTestId("in-divStyle")).toHaveValue("exponential");
    await expect(page.getByTestId("in-barStyle")).toHaveValue("double-row");
    // Color (picker + hex text).
    await expect(page.getByTestId("in-color")).toHaveValue("#334155");
    await expect(page.getByTestId("in-hex")).toHaveValue("#334155");
    // Outputs reverted to the documented default bar.
    await expect(page.getByTestId("res-seg")).toContainText("5 mm");
    await expect(page.getByTestId("res-real")).toContainText("20 m");
    await expect(page.getByTestId("effective-scale")).toContainText("1:200");
    await expect(page.locator('svg[aria-label="Scale bar at 1:200"]')).toBeVisible();
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
});