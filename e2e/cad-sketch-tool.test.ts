/**
 * cad-sketch-tool.test.ts — Functional verification of the CAD live tool.
 *
 * Tests the REAL behavior of /cad/2d-cad-sketch-tool with trusted mouse input:
 *  - page renders the canvas + readout (not a blank/404 page)
 *  - drawing a 200px line commits 1 object and paints dark pixels on the canvas
 *  - rectangle drag with OFF-GRID coordinates snaps to the grid (100mm × 50mm)
 *  - circle radius/diameter readout is correct (30mm / 60mm)
 *  - polyline commits on Enter
 *  - Export PNG produces a data:image/png download
 *  - Undo and Clear all behave
 *
 * Requires dev server on port 3002 (playwright.config webServer handles it).
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("2D CAD Sketch Tool (live)", () => {
  test.setTimeout(60_000);

  test("page loads with canvas, readout, and tool toolbar", async ({ page }) => {
    const response = await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, {
      waitUntil: "networkidle",
      timeout: 20_000,
    });
    expect(response?.status()).toBe(200);

    // No error overlay
    await expect(page.locator("[data-nextjs-dialog-left-right]")).toHaveCount(0);

    // Tool heading
    await expect(page.locator("h1").first()).toContainText("2D CAD Sketch Tool");

    // Canvas present and sized
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    const box = (await canvas.boundingBox())!;
    expect(box.width).toBeGreaterThan(300);
    expect(box.height).toBeGreaterThan(300);

    // Toolbar buttons
    for (const label of ["Line", "Rectangle", "Circle", "Polyline", "Export PNG", "Clear all", "Undo"]) {
      await expect(page.getByRole("button", { name: new RegExp(label, "i") }).first()).toBeVisible();
    }

    // Live readout + object counter
    await expect(page.locator(".font-mono").first()).toContainText("0 object");
  });

  test("drawing a line commits an object and paints real pixels", async ({ page }) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    // Line tool is the default. Drag (200,200) → (400,200).
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(150);

    // Object counter increments
    await expect(page.locator(".font-mono").first()).toContainText("1 object");

    // Canvas pixels: the line at (300,200) must be dark (#475569), not blank white.
    const pixel = await page.evaluate(() => {
      const c = document.querySelector("canvas")!;
      const dpr = window.devicePixelRatio || 1;
      const ctx = c.getContext("2d")!;
      const rect = c.getBoundingClientRect();
      // canvas CSS coords → backing pixels
      const x = Math.round((300 / rect.width) * c.width);
      const y = Math.round((200 / rect.height) * c.height);
      const d = ctx.getImageData(x, y, 1, 1).data;
      return [d[0], d[1], d[2]];
    });
    expect(pixel[0]).toBeLessThan(120); // dark stroke, not white background
    expect(pixel[1]).toBeLessThan(120);
    expect(pixel[2]).toBeLessThan(140);
  });

  test("snapping: off-grid rectangle drag snaps to 100mm × 50mm", async ({ page }) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    await page.getByRole("button", { name: /rectangle/i }).click();
    await page.waitForTimeout(100);

    // Off-grid drag (103,297) → (305,399); snap should land on (100,300) → (300,400).
    await page.mouse.move(box.x + 103, box.y + 297);
    await page.mouse.down();
    await page.mouse.move(box.x + 305, box.y + 399, { steps: 8 });
    await page.waitForTimeout(100);

    // Draft readout shows the snapped width/height: 200px = 100mm, 100px = 50mm.
    await expect(page.locator(".font-mono").first()).toContainText("W: 100.0 mm");
    await expect(page.locator(".font-mono").first()).toContainText("H: 50.0 mm");

    await page.mouse.up();
    await page.waitForTimeout(100);
    await expect(page.locator(".font-mono").first()).toContainText("1 object");
  });

  test("circle readout is accurate (R: 30.0 mm Ø: 60.0 mm)", async ({ page }) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    await page.getByRole("button", { name: /^circle$/i }).click();
    await page.waitForTimeout(100);

    // Center (400,400), radius 60px → 30mm.
    await page.mouse.move(box.x + 400, box.y + 400);
    await page.mouse.down();
    await page.mouse.move(box.x + 460, box.y + 400, { steps: 8 });
    await page.waitForTimeout(100);

    await expect(page.locator(".font-mono").first()).toContainText("R: 30.0 mm");
    await expect(page.locator(".font-mono").first()).toContainText("Ø: 60.0 mm");

    await page.mouse.up();
    await page.waitForTimeout(100);
    await expect(page.locator(".font-mono").first()).toContainText("1 object");
  });

  test("polyline commits on Enter; undo and clear all work; PNG export emits a download", async ({ page }) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    await page.getByRole("button", { name: /polyline/i }).click();
    await page.waitForTimeout(100);

    // Three clicks → draft pending, not committed yet.
    for (const [dx, dy] of [[500, 100], [560, 160], [620, 100]]) {
      await page.mouse.click(box.x + dx, box.y + dy);
      await page.waitForTimeout(80);
    }
    await expect(page.locator(".font-mono").first()).toContainText("0 object");

    // Enter commits the polyline.
    await page.keyboard.press("Enter");
    await page.waitForTimeout(100);
    await expect(page.locator(".font-mono").first()).toContainText("1 object");

    // Undo → back to 0.
    await page.getByRole("button", { name: /undo/i }).click();
    await page.waitForTimeout(100);
    await expect(page.locator(".font-mono").first()).toContainText("0 object");

    // Export PNG: intercept the anchor click and confirm a PNG data URI.
    const exportResult = await page.evaluate<{ download: string; prefix: string } | null>(() => {
      let captured: { download: string; prefix: string } | null = null;
      const orig = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        captured = { download: this.download, prefix: this.href.slice(0, 22) };
      };
      return new Promise<{ download: string; prefix: string } | null>((resolve) => {
        const btns = [...document.querySelectorAll("button")];
        const btn = btns.find((b) => b.textContent?.includes("Export PNG"));
        btn?.click();
        setTimeout(() => {
          HTMLAnchorElement.prototype.click = orig;
          resolve(captured);
        }, 150);
      });
    });
    expect(exportResult?.download).toBe("racira-cad-sketch.png");
    expect(exportResult?.prefix).toBe("data:image/png;base64,");

    // Clear all → 0 objects.
    await page.getByRole("button", { name: /clear all/i }).click();
    await page.waitForTimeout(100);
    await expect(page.locator(".font-mono").first()).toContainText("0 object");
  });
});

test.describe("Select tool: hit-test, move, delete, undo", () => {
  test.setTimeout(60_000);

  // Grid/snap are turned OFF for these tests so pixel checks read pure
  // background (white) instead of grid lines / the snap dot.
  const disableGridSnap = async (page: import("@playwright/test").Page) => {
    const boxes = page.getByRole("checkbox");
    await boxes.nth(0).uncheck();
    await boxes.nth(1).uncheck();
    await page.waitForTimeout(120);
  };

  const goto = async (page: import("@playwright/test").Page) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    await disableGridSnap(page);
  };

  const statusBar = (page: import("@playwright/test").Page) => page.locator("div.font-mono");
  const readout = (page: import("@playwright/test").Page) => statusBar(page).locator("span").first();
  const counter = (page: import("@playwright/test").Page) => statusBar(page).locator("span").nth(1);

  /** Move the pointer to an empty corner so hover highlights clear before pixel reads. */
  const park = async (page: import("@playwright/test").Page, box: { x: number; y: number }) => {
    await page.mouse.move(box.x + 40, box.y + 40);
    await page.waitForTimeout(100);
  };

  const pixelAt = async (page: import("@playwright/test").Page, x: number, y: number) =>
    page.evaluate(
      ([px, py]) => {
        const c = document.querySelector("canvas")!;
        const rect = c.getBoundingClientRect();
        const d = c.getContext("2d")!.getImageData(
          Math.round((px / rect.width) * c.width),
          Math.round((py / rect.height) * c.height),
          1,
          1
        ).data;
        return [d[0], d[1], d[2]] as [number, number, number];
      },
      [x, y] as const
    );

  const isDark = (rgb: [number, number, number]) => rgb[0] < 120 && rgb[1] < 120 && rgb[2] < 140;

  test("line: hit on the stroke selects, tolerance boundary + miss do not", async ({ page }) => {
    await goto(page);
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    // Draw a horizontal line (200,200) → (400,200).
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);
    await expect(counter(page)).toContainText("1 object");

    await page.getByRole("button", { name: /select/i }).click();
    await page.waitForTimeout(100);

    // Hit: click the stroke midpoint → selected.
    await page.mouse.click(box.x + 300, box.y + 200);
    await page.waitForTimeout(100);
    await expect(readout(page)).toContainText("Selected line — 100.0 mm");

    // Tolerance boundary: 5px off the stroke still registers.
    await page.mouse.click(box.x + 300, box.y + 205);
    await page.waitForTimeout(100);
    await expect(readout(page)).toContainText("Selected line");

    // Miss: 13px off the stroke → deselected.
    await page.mouse.click(box.x + 300, box.y + 213);
    await page.waitForTimeout(100);
    await expect(readout(page)).not.toContainText("Selected line");
    await expect(counter(page)).toContainText("1 object");
  });

  test("rect: interior + edge-tolerance clicks select, 12px-outside miss does not", async ({ page }) => {
    await goto(page);
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    await page.getByRole("button", { name: /rectangle/i }).click();
    await page.waitForTimeout(100);
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    await page.getByRole("button", { name: /select/i }).click();
    await page.waitForTimeout(100);

    // Interior click selects; readout reports the true size.
    await page.mouse.click(box.x + 200, box.y + 150);
    await page.waitForTimeout(100);
    await expect(readout(page)).toContainText("Selected rect — 100.0 mm × 50.0 mm");

    // Edge tolerance: 6px outside the right edge still registers.
    await page.mouse.click(box.x + 306, box.y + 150);
    await page.waitForTimeout(100);
    await expect(readout(page)).toContainText("Selected rect");

    // Miss: 12px outside the right edge → deselected.
    await page.mouse.click(box.x + 312, box.y + 150);
    await page.waitForTimeout(100);
    await expect(readout(page)).not.toContainText("Selected rect");
  });

  test("circle: rim click selects, center and 16px-off-rim do not", async ({ page }) => {
    await goto(page);
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    await page.getByRole("button", { name: /^circle$/i }).click();
    await page.waitForTimeout(100);
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 460, box.y + 300, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    await page.getByRole("button", { name: /select/i }).click();
    await page.waitForTimeout(100);

    // Rim hit.
    await page.mouse.click(box.x + 460, box.y + 300);
    await page.waitForTimeout(100);
    await expect(readout(page)).toContainText("Selected circle — Ø 60.0 mm");

    // Center is NOT on the rim → no selection (interior does not select circles).
    await page.mouse.click(box.x + 400, box.y + 300);
    await page.waitForTimeout(100);
    await expect(readout(page)).not.toContainText("Selected circle");

    // 16px inside the rim → no selection.
    await page.mouse.click(box.x + 444, box.y + 300);
    await page.waitForTimeout(100);
    await expect(readout(page)).not.toContainText("Selected circle");
  });

  test("move: dragging a selected line translates it exactly (pixel-verified)", async ({ page }) => {
    await goto(page);
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    // Line (200,200) → (400,200).
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    await page.getByRole("button", { name: /select/i }).click();
    await page.waitForTimeout(100);
    await page.mouse.click(box.x + 300, box.y + 200); // grab the midpoint
    await page.waitForTimeout(100);

    // Drag (300,200) → (360,240): delta (60,40).
    await page.mouse.move(box.x + 300, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 360, box.y + 240, { steps: 8 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(100);

    await expect(readout(page)).toContainText("Selected line — 100.0 mm"); // length unchanged

    // Deselect (click empty space) so the line renders in its normal stroke
    // color instead of the selection blue, then park the pointer.
    await page.mouse.click(box.x + 600, box.y + 400);
    await page.waitForTimeout(100);
    await park(page, box);
    // New midpoint (360,240) is painted; old midpoint (300,200) is cleared.
    expect(isDark(await pixelAt(page, 360, 240))).toBe(true);
    expect(isDark(await pixelAt(page, 300, 200))).toBe(false);
  });

  test("delete: removes the shape's pixels; undo restores the full pre-action state", async ({ page }) => {
    await goto(page);
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    // A: line, B: rect, C: circle.
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(80);

    await page.getByRole("button", { name: /rectangle/i }).click();
    await page.waitForTimeout(80);
    await page.mouse.move(box.x + 100, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 400, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(80);

    await page.getByRole("button", { name: /^circle$/i }).click();
    await page.waitForTimeout(80);
    await page.mouse.move(box.x + 500, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 560, box.y + 300, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);
    await expect(counter(page)).toContainText("3 objects");

    await page.getByRole("button", { name: /select/i }).click();
    await page.waitForTimeout(100);

    // Grab C by its rim at (560,300), drag to (620,320) → center moves (500,300)→(560,320).
    await page.mouse.click(box.x + 560, box.y + 300);
    await page.waitForTimeout(100);
    await page.mouse.move(box.x + 560, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 620, box.y + 320, { steps: 8 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Deselect (empty spot) so the moved circle renders in its normal stroke
    // color rather than the selection blue.
    await page.mouse.click(box.x + 600, box.y + 200);
    await page.waitForTimeout(100);
    await park(page, box);
    // Moved circle: bottom rim now (560,380); old bottom rim (500,360) cleared.
    expect(isDark(await pixelAt(page, 560, 380))).toBe(true);
    expect(isDark(await pixelAt(page, 500, 360))).toBe(false);

    // Undo restores C to its original position.
    await page.getByRole("button", { name: /undo/i }).click();
    await page.waitForTimeout(100);
    await park(page, box);
    expect(isDark(await pixelAt(page, 500, 360))).toBe(true);
    await expect(counter(page)).toContainText("3 objects");

    // Delete C → 2 objects, its pixels gone.
    await page.mouse.click(box.x + 560, box.y + 300); // re-select on the rim
    await page.waitForTimeout(100);
    await page.getByRole("button", { name: /delete/i }).click();
    await page.waitForTimeout(100);
    await expect(counter(page)).toContainText("2 objects");
    await park(page, box);
    expect(isDark(await pixelAt(page, 500, 360))).toBe(false);

    // Undo the delete → C is back, 3 objects.
    await page.getByRole("button", { name: /undo/i }).click();
    await page.waitForTimeout(100);
    await expect(counter(page)).toContainText("3 objects");
    await park(page, box);
    expect(isDark(await pixelAt(page, 500, 360))).toBe(true);
  });
});

test.describe("DXF / SVG export round-trip", () => {
  test.setTimeout(60_000);

  test("drawing line + rect + circle exports DXF entities and SVG paths matching the drawn mm geometry", async ({ page }) => {
    await page.goto(`${BASE}/cad/2d-cad-sketch-tool`, { waitUntil: "networkidle" });
    const canvas = page.locator("canvas");
    const box = (await canvas.boundingBox())!;

    // Export buttons start disabled with an empty drawing.
    await expect(page.getByRole("button", { name: /export dxf/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /export svg/i })).toBeDisabled();

    // Line (200,200) → (400,200).
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Rectangle (100,100) → (300,200).
    await page.getByRole("button", { name: /rectangle/i }).click();
    await page.waitForTimeout(80);
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 200, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    // Circle center (400,300), radius 60px → 30mm.
    await page.getByRole("button", { name: /^circle$/i }).click();
    await page.waitForTimeout(80);
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.down();
    await page.mouse.move(box.x + 460, box.y + 300, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(100);

    await expect(page.locator("div.font-mono span").nth(1)).toContainText("3 objects");
    await expect(page.getByRole("button", { name: /export dxf/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /export svg/i })).toBeEnabled();

    // Screen px → mm: 1 grid cell = 20px = 10mm, so mm = px × 0.5.
    // DXF is Y-up: screen y maps to (canvasH − y) × 0.5.
    const hMm = (await page.evaluate(() => document.querySelector("canvas")!.getBoundingClientRect().height)) / 2;

    // ── DXF round-trip ──────────────────────────────────────────────
    const dxf = await exportAndReadText(page, "Export DXF");
    expect(dxf.download).toBe("racira-cad-sketch.dxf");
    expect(dxf.text).toContain("$INSUNITS"); // mm units embedded in the header
    const dxfEntities = parseDxfEntities(dxf.text);
    const dxfLines = dxfEntities.filter((e) => e.type === "LINE");
    const dxfCircles = dxfEntities.filter((e) => e.type === "CIRCLE");
    expect(dxfLines).toHaveLength(5); // 1 drawn line + 4 rectangle edges
    expect(dxfCircles).toHaveLength(1);

    // Drawn line: screen (100,100)-(200,100)mm → Y-up (100, hMm-100)-(200, hMm-100).
    expect(
      dxfLines.some(
        (l) =>
          near(l.x ?? -1, 100) && near(l.y ?? -1, hMm - 100) &&
          near(l.x2 ?? -1, 200) && near(l.y2 ?? -1, hMm - 100)
      )
    ).toBe(true);

    // Rectangle: 4 lines whose endpoints form x ∈ {50,150}, y ∈ {hMm-100, hMm-50}.
    const rectLines = dxfLines.filter((l) => {
      const xs = [l.x ?? -1, l.x2 ?? -1];
      const ys = [l.y ?? -1, l.y2 ?? -1];
      return (
        xs.every((x) => near(x, 50) || near(x, 150)) &&
        ys.every((y) => near(y, hMm - 100) || near(y, hMm - 50))
      );
    });
    expect(rectLines).toHaveLength(4);
    // Y-flip check: the screen top edge (y=50mm) must be the LARGER DXF y
    // (hMm-50 > hMm-100) — a non-flipped export would put it at 50.
    const rectYs = rectLines.flatMap((l) => [l.y ?? -1, l.y2 ?? -1]);
    expect(rectYs.every((y) => y <= hMm - 50 + 0.01)).toBe(true);
    expect(rectYs.some((y) => near(y, hMm - 50))).toBe(true);

    // Circle: screen center (200,150)mm r=30 → Y-up (200, hMm-150) r 30.
    expect(near(dxfCircles[0].x ?? -1, 200)).toBe(true);
    expect(near(dxfCircles[0].y ?? -1, hMm - 150)).toBe(true);
    expect(near(dxfCircles[0].r ?? -1, 30)).toBe(true);

    // ── SVG round-trip ──────────────────────────────────────────────
    const svg = await exportAndReadText(page, "Export SVG");
    expect(svg.download).toBe("racira-cad-sketch.svg");
    expect(svg.text.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.text).toMatch(/width="\d+mm"/);
    expect(svg.text).toMatch(/stroke-width="0\.25mm"/);

    // SVG stays in screen convention (Y-down): path data carries positive
    // screen mm, so the line is (100,100)-(200,100) and the circle sits at
    // (200,150) r 30 — matching what was drawn, not mirrored.
    const d = svgPathData(svg.text);
    expect(d).toContain("M 100 100 200 100"); // drawn line
    expect(d).toContain("M 50 50 L 150 50 L 150 100 L 50 100 L 50 50 Z"); // rect, closed
    expect(d).toContain("M 200 150 m -30 0"); // circle start == center (200,150)
    expect(d).toContain("a 30 30 0 0 1 60 0"); // radius 30 → 60-wide arc sweep
  });
});

// ── Export helpers (top level, pure) ────────────────────────────────

/** Click an export button, intercept the anchor, and read the blob text. */
async function exportAndReadText(
  page: import("@playwright/test").Page,
  buttonLabel: string
): Promise<{ download: string; text: string }> {
  return page.evaluate(async (label: string) => {
    const state: { captured: { download: string; href: string } | null } = { captured: null };
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      state.captured = { download: this.download, href: this.href };
    };
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes(label));
    btn?.click();
    await new Promise((r) => setTimeout(r, 250));
    HTMLAnchorElement.prototype.click = orig;
    const href = state.captured?.href ?? "";
    const download = state.captured?.download ?? "";
    if (!href) return { download: "", text: "" };
    const res = await fetch(href);
    return { download, text: await res.text() };
  }, buttonLabel);
}

/** Parse DXF group-code pairs after the ENTITIES section into LINE/CIRCLE records. */
function parseDxfEntities(dxf: string): DxfEntity[] {
  const lines = dxf.split(/\r?\n/).map((s) => s.trim());
  const entities: DxfEntity[] = [];
  let i = 0;
  for (; i < lines.length - 1; i++) {
    if (lines[i] === "2" && lines[i + 1] === "ENTITIES") {
      i += 2;
      break;
    }
  }
  while (i < lines.length - 1) {
    const code = lines[i];
    const value = lines[i + 1];
    if (code === "0" && value === "ENDSEC") break;
    if (code === "0" && (value === "LINE" || value === "CIRCLE")) {
      const ent: DxfEntity = { type: value };
      i += 2;
      while (i < lines.length - 1) {
        const c = lines[i];
        if (c === "0") break;
        const v = lines[i + 1];
        if (c === "10") ent.x = parseFloat(v);
        else if (c === "20") ent.y = parseFloat(v);
        else if (c === "11") ent.x2 = parseFloat(v);
        else if (c === "21") ent.y2 = parseFloat(v);
        else if (c === "40") ent.r = parseFloat(v);
        i += 2;
      }
      entities.push(ent);
    } else {
      i += 2;
    }
  }
  return entities;
}

/** Extract the first <path d="..."> attribute from an SVG string. */
function svgPathData(svg: string): string {
  const m = svg.match(/<path d="([^"]*)"/);
  return m ? m[1] : "";
}

type DxfEntity = {
  type: string;
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  r?: number;
};

const near = (a: number, b: number) => Math.abs(a - b) < 0.01;