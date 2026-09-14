/**
 * scale-bar-tool.logic.test.ts — UNIT tests for the Scale Bar Tool's pure
 * math (no page, no DOM). Runs through the Playwright runner (the repo's only
 * TS-capable harness) against the real logic module, so the formulas tested
 * here are the exact ones the component renders.
 */
import { test } from "@playwright/test";
import assert from "node:assert/strict";
import {
  DEFAULT_PARAMS,
  buildScaleLabel,
  computeBar,
  computeScale,
  fmtRatio,
  paperToReal,
  realToPaperMm,
  type BarParams,
} from "../src/domains/cad/components/tools/easy/scale-bar-tool.logic";
import { METERS_PER_UNIT } from "../src/domains/cad/components/tools/shared/length-units";

const params = (over: Partial<BarParams>): BarParams => ({ ...DEFAULT_PARAMS, ...over });

test.describe("Scale Bar Tool logic", () => {
  test("matrix: realLength = (width_mm × scaleX) / unitConversionFactor, with round-trip", () => {
    // Hand-derived expectations; unitConversionFactor = METERS_PER_UNIT × 1000.
    const cases: [scaleX: number, widthMm: number, unit: string, expectedReal: number][] = [
      [200, 100, "m", 20],                        // the documented 1:200 repro
      [200, 100, "ft", 20000 / 304.8],            // 20 m in feet
      [48, 100, "m", 4.8],                        // ¼″ = 1′-0″
      [120, 250, "mm", 30000],                    // stays millimetres
      [50, 100, "ft", 5000 / 304.8],              // 5 m in feet
      [100, 80, "cm", 800],                       // 8 m → cm
      [1, 100, "m", 0.1],                         // 1:1
      [500, 60, "in", 30000 / 25.4],
    ];
    for (const [scaleX, widthMm, unit, expected] of cases) {
      const bar = computeBar(params({ x: String(scaleX), width: String(widthMm), unit }));
      assert(bar, `bar computable for 1:${scaleX} ${widthMm}mm ${unit}`);
      const unitFactor = METERS_PER_UNIT[unit] * 1000; // mm per one `unit`
      assert.ok(
        Math.abs(bar.totalRealValue - (widthMm * scaleX) / unitFactor) < 1e-9,
        `1:${scaleX} ${widthMm}mm ${unit}: expected ${expected}, got ${bar.totalRealValue}`,
      );
      assert.ok(
        Math.abs(bar.totalRealValue - expected) < 1e-9,
        `1:${scaleX} ${widthMm}mm ${unit}: expected ${expected}, got ${bar.totalRealValue}`,
      );
      // Round-trip: the paper width recomputed from the real length returns
      // the original width.
      const paperBack = realToPaperMm(bar.totalRealValue, unit, bar.scale);
      assert.ok(
        Math.abs(paperBack - widthMm) < 1e-6,
        `round-trip 1:${scaleX} ${widthMm}mm ${unit}: got paper ${paperBack}`,
      );
    }
  });

  test("paper ⇄ real conversion is an exact inverse across units and scales", () => {
    const units = ["m", "ft", "cm", "in", "mm", "km", "yd", "mi"];
    const scales = [0.5, 1, 2, 12, 50, 200, 5000];
    const widths = [10, 100, 250];
    let n = 0;
    for (const unit of units) {
      for (const scale of scales) {
        for (const width of widths) {
          const real = paperToReal(width, unit, scale);
          const paperBack = realToPaperMm(real, unit, scale);
          const realBack = paperToReal(paperBack, unit, scale);
          assert.ok(Math.abs(paperBack - width) < 1e-9, `paper round-trip ${unit} ${scale} ${width}`);
          assert.ok(Math.abs(realBack - real) < 1e-9, `real round-trip ${unit} ${scale} ${width}`);
          n++;
        }
      }
    }
    assert.equal(n, 8 * 7 * 3);
  });

  test("effective scale label always reflects the live scaleX, across modes and back", () => {
    const label = (p: BarParams) => buildScaleLabel(computeScale(p), p);
    assert.equal(label(params({ mode: "one-to-x", x: "200" })), "1:200");
    assert.equal(label(params({ mode: "one-to-x", x: "100" })), "1:100");
    // X:1 toggles print the reciprocal correctly (was "0:1" / "1:0").
    assert.equal(label(params({ mode: "one-to-x", x: "100", flipX: true })), "100:1");
    assert.equal(label(params({ mode: "one-to-x", x: "200", flipX: true })), "200:1");
    assert.equal(
      label(params({ mode: "inch-to-foot", inchPaper: "0.25", footReal: "1", inchReal: "0" })),
      "0.25″=1′-0″",
    );
    assert.equal(label(params({ mode: "scale-factor", factorVal: "1.2" })), "1.2×");
    // And back — the value is live, never a stale default.
    assert.equal(label(params({ mode: "one-to-x", x: "100" })), "1:100");
  });

  test("computeScale directions are consistent (paper × scale = real)", () => {
    assert.equal(computeScale(params({ x: "200" })), 200);
    assert.equal(computeScale(params({ x: "200", flipX: true })), 1 / 200);
    assert.equal(
      computeScale(params({ mode: "inch-to-foot", inchPaper: "0.25", footReal: "1" })),
      48,
    );
    assert.equal(computeScale(params({ mode: "scale-factor", factorVal: "5" })), 5);
    // Invalid input never produces a scale.
    assert.equal(computeScale(params({ x: "0" })), null);
    assert.equal(computeScale(params({ x: "abc" })), null);
  });

  test("ratio line keeps enough precision that enlarged scales don't round to 0", () => {
    assert.equal(fmtRatio(200), "200");
    assert.equal(fmtRatio(48), "48");
    assert.equal(fmtRatio(1.2), "1.2");
    assert.equal(fmtRatio(1 / 200), "0.005"); // was rounded to 0.01 at 2 dp
  });

  test("defaults compute the documented 1:200 bar (5 mm segs, 20 m, 5 steps)", () => {
    const bar = computeBar(DEFAULT_PARAMS);
    assert(bar);
    assert.equal(bar.scale, 200);
    assert.ok(Math.abs(bar.segPaperMm - 5) < 1e-9);
    assert.equal(bar.totalPaperMm, 100);
    assert.equal(bar.numSteps, 5);
    assert.ok(Math.abs(bar.totalRealValue - 20) < 1e-9);
    assert.deepEqual(
      bar.labels.map((l) => l.text),
      ["0", "1.25", "2.5", "5", "10", "20"],
    );
    // Steps tile the bar exactly.
    assert.ok(Math.abs(bar.steps.reduce((a, b) => a + b, 0) - bar.totalPaperMm) < 1e-9);
  });
});