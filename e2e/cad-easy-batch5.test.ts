/**
 * cad-easy-batch5.test.ts — functional verification of the Electrical & PCB
 * Schematic and Architecture & Planning Easy tools (batch 5).
 * Real input, known-correct output asserted.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Electrical & PCB + Architecture (batch 5)", () => {
  test.setTimeout(60_000);

  test("via-current-capacity-calculator: IPC-2221 on 0.6 mm via", async ({ page }) => {
    await page.goto(`${BASE}/cad/via-current-capacity-calculator`, { waitUntil: "networkidle" });
    // d=0.6, t=25 µm: annulus = π(0.325²−0.3²) = 0.04909 mm² = 76.1 mil²
    await expect(page.getByTestId("res-area")).toContainText("0.0491 mm²");
    // I = 0.048·10^0.44·76.1^0.725 ≈ 3.056 A
    await expect(page.getByTestId("res-amp")).toContainText("3.056 A");
    // Internal layer halves the coefficient.
    await page.getByTestId("in-layer").selectOption("internal");
    await expect(page.getByTestId("res-amp")).toContainText("1.528 A");
    // ΔT 100 °C: 0.048·100^0.44·76.1^0.725 ≈ 8.42 A
    await page.getByTestId("in-layer").selectOption("external");
    await page.getByTestId("in-rise").fill("100");
    await expect(page.getByTestId("res-amp")).toContainText("8.418 A");
  });

  test("wire-gauge-reference: AWG formula spot checks", async ({ page }) => {
    await page.goto(`${BASE}/cad/wire-gauge-reference`, { waitUntil: "networkidle" });
    // AWG 18 default: d = 0.127·92^(18/39) = 1.024 mm
    await expect(page.getByTestId("res-d")).toContainText("1.024 mm");
    await expect(page.getByTestId("res-a")).toContainText("0.82 mm²");
    await expect(page.getByTestId("res-r")).toContainText("20.9");
    await expect(page.getByTestId("res-amp")).toContainText("not tabled");
    // AWG 12 → 2.0525 → 2.053 mm, 25 A NEC 75 °C.
    await page.getByTestId("in-awg").fill("12");
    await expect(page.getByTestId("res-d")).toContainText("2.053 mm");
    await expect(page.getByTestId("res-amp")).toContainText("25 A");
    // Table row 12 shows ampacity 25.
    await expect(page.locator("tbody tr").filter({ hasText: /^12/ })).toContainText("25");
  });

  test("smd-component-identifier: 3-digit, 4-digit and EIA-96 decode", async ({ page }) => {
    await page.goto(`${BASE}/cad/smd-component-identifier`, { waitUntil: "networkidle" });
    // Default 472 → 47·10² = 4.7 kΩ
    await expect(page.getByTestId("res-value")).toContainText("4.7 kΩ");
    await page.getByTestId("in-code").fill("1002");
    await expect(page.getByTestId("res-value")).toContainText("10 kΩ");
    await expect(page.getByTestId("res-scheme")).toContainText("4-digit");
    // EIA-96: 01 → 100, C → ×100 → 10 kΩ
    await page.getByTestId("in-code").fill("01C");
    await expect(page.getByTestId("res-value")).toContainText("10 kΩ");
    await expect(page.getByTestId("res-scheme")).toContainText("EIA-96");
    // 10 → 124 ×100 → 12.4 kΩ
    await page.getByTestId("in-code").fill("10C");
    await expect(page.getByTestId("res-value")).toContainText("12.4 kΩ");
    // Garbage → clear error, no wrong value.
    await page.getByTestId("in-code").fill("XYZ");
    await expect(page.getByTestId("res-value")).toContainText("—");
    await expect(page.getByTestId("decode-error")).toContainText("Not a recognized");
  });

  test("schematic-symbol-library-browser: symbols and search", async ({ page }) => {
    await page.goto(`${BASE}/cad/schematic-symbol-library-browser`, { waitUntil: "networkidle" });
    const body = page.locator("tbody");
    await expect(body.locator("tr").filter({ hasText: "Zigzag (ANSI)" })).toContainText("IEC");
    await expect(body.locator("tr").filter({ hasText: "Transistor NPN" })).toContainText("arrow out");
    await page.getByTestId("ref-search").fill("zener");
    await expect(page.locator("tbody tr")).toHaveCount(1); // only the zener row
    await expect(body.locator("tr").filter({ hasText: "Zener diode" })).toContainText("breakdown");
  });

  test("component-footprint-reference: metric chip sizes and pitches", async ({ page }) => {
    await page.goto(`${BASE}/cad/component-footprint-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "0805" })).toContainText("2.0 × 1.25");
    await expect(page.getByRole("row").filter({ hasText: "0603" })).toContainText("1.6 × 0.8");
    await expect(page.getByRole("row").filter({ hasText: "SOIC-8" })).toContainText("1.27");
    await expect(page.getByRole("row").filter({ hasText: "DIP-8" })).toContainText("2.54");
  });

  test("pcb-design-checklist: 20 items with progress", async ({ page }) => {
    await page.goto(`${BASE}/cad/pcb-design-checklist`, { waitUntil: "networkidle" });
    const list = page.getByTestId("pcb-checklist");
    await expect(list.getByRole("checkbox")).toHaveCount(20);
    const bar = list.locator("div.h-full.rounded-full.bg-primary");
    await expect(bar).toHaveAttribute("style", /width:\s*0%/);
    await list.getByRole("checkbox").nth(0).check();
    await expect(bar).toHaveAttribute("style", /width:\s*5%/);
  });

  test("building-footprint-calculator: 60×100 ft and metric mode", async ({ page }) => {
    await page.goto(`${BASE}/cad/building-footprint-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-area")).toContainText("6000.0 ft²");
    await expect(page.getByTestId("res-area")).toContainText("557.4 m²");
    await expect(page.getByTestId("res-perim")).toContainText("320.0 ft");
    await expect(page.getByTestId("res-acres")).toContainText("0.138 acres");
    // Metric: 10 × 20 m → 200 m², 60 m perimeter.
    await page.getByTestId("in-unit").selectOption("m");
    await page.getByTestId("in-width").fill("10");
    await page.getByTestId("in-depth").fill("20");
    await expect(page.getByTestId("res-perim")).toContainText("60.0 m");
    await expect(page.getByTestId("res-acres")).toContainText("0.049 acres");
  });

  test("zoning-setback-calculator: 100×150 lot with setbacks → 9900 ft²", async ({ page }) => {
    await page.goto(`${BASE}/cad/zoning-setback-calculator`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("res-bw")).toContainText("90.0 ft");
    await expect(page.getByTestId("res-bd")).toContainText("110.0 ft");
    await expect(page.getByTestId("res-area")).toContainText("9900.0 ft²");
    await expect(page.getByTestId("res-cov")).toContainText("66.0 %");
    // Front 30 → depth 100, area 9000.
    await page.getByTestId("in-front").fill("30");
    await expect(page.getByTestId("res-area")).toContainText("9000.0 ft²");
    await expect(page.getByTestId("res-cov")).toContainText("60.0 %");
  });

  test("ada-clearance-reference: standard clearances present", async ({ page }) => {
    await page.goto(`${BASE}/cad/ada-clearance-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Door clear opening" })).toContainText("32 in");
    await expect(page.getByRole("row").filter({ hasText: "Turning space" })).toContainText("60 in circle");
    await expect(page.getByRole("row").filter({ hasText: "Ramp slope" })).toContainText("1:12");
    await expect(page.getByRole("row").filter({ hasText: "Parking space (van)" })).toContainText("132 in");
  });

  test("ceiling-height-reference: IRC vs IBC minimums", async ({ page }) => {
    await page.goto(`${BASE}/cad/ceiling-height-reference`, { waitUntil: "networkidle" });
    await expect(page.getByRole("row").filter({ hasText: "Habitable rooms (residential)" })).toContainText("7 ft 0 in");
    await expect(page.getByRole("row").filter({ hasText: "Habitable rooms (residential)" })).toContainText("IRC R305.1");
    await expect(page.getByRole("row").filter({ hasText: "Commercial habitable" })).toContainText("7 ft 6 in");
    await expect(page.getByRole("row").filter({ hasText: "Under beams" })).toContainText("6 ft 4 in");
  });

  test("staircase-code-reference: IRC vs IBC geometry", async ({ page }) => {
    await page.goto(`${BASE}/cad/staircase-code-reference`, { waitUntil: "networkidle" });
    const riser = page.getByRole("row").filter({ hasText: "Maximum riser height" });
    await expect(riser).toContainText("7¾ in");
    await expect(riser).toContainText("7 in (178 mm)");
    const tread = page.getByRole("row").filter({ hasText: "Minimum tread depth" });
    await expect(tread).toContainText("10 in (254 mm)");
    await expect(tread).toContainText("11 in (279 mm)");
    await expect(page.getByRole("row").filter({ hasText: "Headroom" })).toContainText("6 ft 8 in");
  });
});
