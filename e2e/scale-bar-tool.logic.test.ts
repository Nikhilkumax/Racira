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
  SLIDER_RANGES,
  buildScaleLabel,
  computeBar,
  computeScale,
  fmtLength,
  fmtRatio,
  manualRangeMax,
  paperToReal,
  parseManualSteps,
  realToPaperMm,
  scaleNotations,
  seedManualSteps,
  tenStepSeries,
  type BarParams,
} from "../src/domains/cad/components/tools/easy/scale-bar-tool.logic";
import {
  ALL_UNITS,
  METERS_PER_UNIT,
  UNIT_GROUPS,
  convertLength,
  isKnownUnit,
  unitOptionLabel,
} from "../src/domains/cad/components/tools/shared/length-units";

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

  test("scaleNotations: all three notations stay mutually consistent at any scale", () => {
    // 1:200 → enlarged notation flips to X:1; ¼″=1′-0″ is scale 48.
    assert.deepEqual(scaleNotations(200), { oneToX: "1:200", inchToFoot: "≈ 0.06″=1′-0″", factor: "≈ 200×" });
    assert.deepEqual(scaleNotations(48), { oneToX: "1:48", inchToFoot: "≈ 0.25″=1′-0″", factor: "≈ 48×" });
    // Enlarged drawing: one-to-X renders the reciprocal (200:1), not "1:0.005".
    assert.deepEqual(scaleNotations(1 / 200), { oneToX: "200:1", inchToFoot: "≈ 2400″=1′-0″", factor: "≈ 0.005×" });
    // Identity: scale 1 is 1:1, 12″=1′-0″, 1×.
    assert.deepEqual(scaleNotations(1), { oneToX: "1:1", inchToFoot: "≈ 12″=1′-0″", factor: "≈ 1×" });
    // Degenerate inputs never render numbers.
    assert.deepEqual(scaleNotations(null).oneToX, "—");
    assert.deepEqual(scaleNotations(NaN).factor, "—");
  });

  // ── Manual step editor ────────────────────────────────────────────────────
  test("manual boundaries define the bar exactly (paper mm × scale = real mm)", () => {
    const bar = computeBar(params({
      stepMode: "manual",
      stepRows: [
        { value: "5", label: true },
        { value: "10", label: true },
        { value: "2.5", label: false }, // a fine-subdivision tick, unlabelled
      ],
    }));
    assert(bar);
    // Rows are sorted ascending, the origin is implicit, nothing is invented.
    assert.deepEqual(bar.boundariesReal, [0, 2.5, 5, 10]);
    // At 1:200 the LAST boundary owns the bar: 10 m → 50 mm of paper.
    assert.ok(Math.abs(bar.totalPaperMm - 50) < 1e-9);
    assert.equal(bar.numSteps, 3);
    assert.deepEqual(bar.steps.map((s) => +s.toFixed(6)), [12.5, 12.5, 25]);
    assert.ok(Math.abs(bar.steps.reduce((a, b) => a + b, 0) - bar.totalPaperMm) < 1e-9);
    assert.ok(Math.abs(bar.totalRealValue - 10) < 1e-9);
    // Only labelled boundaries get text; the unlabelled 2.5 tick is silent.
    assert.deepEqual(bar.labels.map((l) => l.text), ["0", "5", "10"]);
  });

  test("manual rows: blanks, junk, negatives and duplicates never reach the bar", () => {
    const messy = computeBar(params({
      stepMode: "manual",
      stepRows: [
        { value: "", label: true },
        { value: "abc", label: true },
        { value: "0", label: true },
        { value: "-3", label: true },
        { value: "10", label: true },
        { value: "10", label: true },
      ],
    }));
    assert(messy);
    assert.deepEqual(messy.boundariesReal, [0, 10]);
    assert.equal(messy.numSteps, 1);
    assert.deepEqual(parseManualSteps([{ value: "7", label: false }, { value: "3", label: true }]), [
      { v: 3, label: true },
      { v: 7, label: false },
    ]);
    // A manual list with no usable row falls back to the automatic split, so
    // deleting every row can never blank out the tool.
    const fallback = computeBar(params({ stepMode: "manual", stepRows: [] }));
    assert(fallback);
    assert.equal(fallback.totalPaperMm, 100);
    assert.equal(fallback.numSteps, 5);
  });

  test("seedManualSteps reopens Manual on the bar the user was already looking at", () => {
    const auto = computeBar(DEFAULT_PARAMS);
    assert(auto);
    const rows = seedManualSteps(auto);
    assert.deepEqual(rows.map((r) => r.value), ["1.25", "2.5", "5", "10", "20"]);
    assert.ok(rows.every((r) => r.label));

    // Feeding the seed back reproduces the automatic bar exactly — geometry,
    // real length, step count AND the tick labels.
    const manual = computeBar(params({ stepMode: "manual", stepRows: rows }));
    assert(manual);
    assert.ok(Math.abs(manual.totalPaperMm - auto.totalPaperMm) < 1e-6);
    assert.ok(Math.abs(manual.totalRealValue - auto.totalRealValue) < 1e-9);
    assert.equal(manual.numSteps, auto.numSteps);
    assert.deepEqual(manual.labels.map((l) => l.text), auto.labels.map((l) => l.text));

    // Holds at other scales too (the seed is live, not the build-time default).
    for (const x of ["50", "100", "500", "1000"]) {
      const a = computeBar(params({ x }));
      assert(a);
      const m = computeBar(params({ x, stepMode: "manual", stepRows: seedManualSteps(a) }));
      assert(m);
      assert.ok(Math.abs(m.totalPaperMm - a.totalPaperMm) < 1e-4, `x=${x}: ${m.totalPaperMm} vs ${a.totalPaperMm}`);
      assert.equal(m.numSteps, a.numSteps, `x=${x} step count`);
    }
    assert.deepEqual(seedManualSteps(null), []);
  });

  test("manual helpers: quick-fill ladder and the documented value range", () => {
    // 0.1w … w for the nearest power of ten below the bar's max real value.
    assert.deepEqual(tenStepSeries(20), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(tenStepSeries(40), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(tenStepSeries(200), [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    assert.deepEqual(tenStepSeries(1), [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
    assert.deepEqual(tenStepSeries(0), []);
    assert.deepEqual(tenStepSeries(NaN), []);
    // The documented upper bound is the Width slider's max paper width in real
    // units — derived, so it can never disagree with the slider.
    assert.equal(SLIDER_RANGES.width.max, 400);
    assert.equal(manualRangeMax("m", 200), 80);
    assert.equal(manualRangeMax("m", 100), 40);
    assert.equal(manualRangeMax("m", null), null);
  });

  // ── Item 1: the segment must fit inside the bar it is drawn on ────────────
  test("item 1: a segment longer than the bar's own span is flagged, never scaled silently", () => {
    // Exact repro: scale factor 1.2, Width 100 mm, "One segment equals" 1 m.
    // Root cause: `segVal` was validated only for being positive — nothing
    // bounded it by the bar's real span (Width × scale = 0.12 m here), so the
    // paper readout could exceed the whole bar (833.333 mm inside 100 mm) while
    // the step count floored at 2 as though the segments fitted.
    const p = params({ mode: "scale-factor", factorVal: "1.2", width: "100", unit: "m", segVal: "1" });
    const bar = computeBar(p);
    assert(bar);
    assert.ok(Math.abs(bar.totalRealValue - 0.12) < 1e-12, `span ${bar.totalRealValue}`);
    assert.ok(Math.abs(bar.segPaperMm - 833.3333333333) < 1e-6, `seg paper ${bar.segPaperMm}`);
    assert.equal(bar.totalPaperMm, 100);
    assert.ok(bar.segPaperMm > bar.totalPaperMm, "the bug: 833 mm segment inside a 100 mm bar");
    assert.ok(bar.totalSegments < 1, "not even one segment fits");
    assert.equal(bar.numSteps, 2, "the invented step count the task reported");
    assert.equal(bar.segFits, false, "segFits is the machine-readable flag for this state");

    // A segment that fits — up to and including exactly the whole span — is fine.
    for (const segVal of ["0.001", "0.06", "0.12"]) {
      const ok = computeBar(params({ ...p, segVal }));
      assert(ok, segVal);
      assert.equal(ok.segFits, true, segVal);
      assert.ok(ok.segPaperMm <= ok.totalPaperMm + 1e-9, segVal);
      assert.ok(ok.totalSegments >= 1 - 1e-9, segVal);
    }
    const justOver = computeBar(params({ ...p, segVal: "0.1200001" }));
    assert(justOver);
    assert.equal(justOver.segFits, false, "a hair over the span is still infeasible");

    // The 200:1 enlargement is the same defect: a 1 m segment on a bar that
    // spans 0.5 mm real.
    const flip = computeBar(params({ mode: "one-to-x", x: "200", flipX: true, width: "100", unit: "m" }));
    assert(flip);
    assert.equal(flip.segFits, false);
    assert.ok(flip.segPaperMm > flip.totalPaperMm);

    // Holds for every mode and unit: segPaper ≤ totalPaper whenever segFits.
    const modes: BarParams[] = [
      params({ mode: "one-to-x", x: "200" }),
      params({ mode: "one-to-x", x: "100", flipX: true }),
      params({ mode: "inch-to-foot", inchPaper: "0.25", footReal: "1" }),
      params({ mode: "scale-factor", factorVal: "5" }),
    ];
    for (const p2 of modes) {
      for (const unit of ["m", "mm", "ft", "in", "km", "ly"]) {
        for (const segVal of ["1e-6", "1", "1000"]) {
          const b = computeBar({ ...p2, unit, segVal });
          assert(b);
          if (b.segFits) {
            assert.ok(
              b.segPaperMm <= b.totalPaperMm + 1e-9,
              `${p2.mode} ${unit} ${segVal}: ${b.segPaperMm} > ${b.totalPaperMm}`,
            );
          } else {
            assert.ok(b.segPaperMm > b.totalPaperMm - 1e-9, `${p2.mode} ${unit} ${segVal}`);
          }
        }
      }
    }
  });

  // ── Item 2: Automatic → Manual hand-off is live at the moment of switching ──
  test("item 2: the Manual seed and its stated range always track the CURRENT scale", () => {
    const configs: BarParams[] = [
      params({ mode: "one-to-x", x: "200", width: "100", unit: "m" }),                    // large 1:X
      params({ mode: "scale-factor", factorVal: "1.2", width: "100", unit: "m", segVal: "0.05" }), // small factor
      params({ mode: "inch-to-foot", inchPaper: "0.25", footReal: "1", width: "100", unit: "m" }),  // ¼″=1′-0″ (1:48)
      params({ mode: "one-to-x", x: "500", width: "250", unit: "ft" }),
      params({ mode: "scale-factor", factorVal: "10", width: "300", unit: "in" }),
      params({ mode: "one-to-x", x: "50", width: "400", unit: "mm" }),
    ];
    for (const p of configs) {
      const auto = computeBar(p);
      assert(auto, p.mode);
      const rows = seedManualSteps(auto);
      // One seeded row per automatic step boundary after the origin.
      assert.equal(rows.length, auto.numSteps, `${p.mode} ${p.unit}: seed length`);
      // The largest seed IS the automatic bar's whole real span…
      const seedMax = Math.max(...rows.map((r) => parseFloat(r.value)));
      assert.ok(
        Math.abs(seedMax - auto.totalRealValue) / auto.totalRealValue < 1e-5,
        `${p.mode} ${p.unit}: seed max ${seedMax} vs span ${auto.totalRealValue}`,
      );
      // …and it sits inside the range the Manual editor advertises for this scale.
      const range = manualRangeMax(p.unit, auto.scale);
      assert(range !== null);
      assert.ok(seedMax <= range * (1 + 1e-9), `${p.mode} ${p.unit}: ${seedMax} > range ${range}`);
      // Feeding the seed back reproduces the automatic bar exactly: no drift.
      const manual = computeBar({ ...p, stepMode: "manual", stepRows: rows });
      assert(manual);
      assert.equal(manual.numSteps, auto.numSteps, `${p.mode} ${p.unit}: step count`);
      assert.ok(
        Math.abs(manual.totalRealValue - auto.totalRealValue) / auto.totalRealValue < 1e-6,
        `${p.mode} ${p.unit}: real span drift`,
      );
      assert.ok(Math.abs(manual.totalPaperMm - auto.totalPaperMm) < 1e-4, `${p.mode} ${p.unit}: paper drift`);
      // And every seeded row is inside the documented range (none flagged).
      for (const r of rows) {
        assert.ok(parseFloat(r.value) > 0 && parseFloat(r.value) <= range * (1 + 1e-9), `${p.mode} ${p.unit}`);
      }
    }
  });

  // ── Real-length unit table ───────────────────────────────────────────────
  test("unit table: 40 unique dropdown units in the reference's 4 groups", () => {
    assert.deepEqual(UNIT_GROUPS.map((g) => g.label), [
      "Metric", "Imperial / Survey / Nautical", "Scientific / Astronomical", "Typography / Digital",
    ]);
    assert.equal(ALL_UNITS.length, 40);
    assert.equal(new Set(ALL_UNITS).size, 40);
    for (const u of ALL_UNITS) {
      assert.ok(isKnownUnit(u), `${u} is a known unit`);
      assert.ok(METERS_PER_UNIT[u] > 0, `${u} has a positive factor`);
    }
    // Every unit is offered exactly once — the old list showed "nautical mile"
    // twice (NM and its nmi alias). The alias still resolves, it is just not a
    // dropdown entry.
    assert.ok(!ALL_UNITS.includes("nmi"));
    assert.equal(METERS_PER_UNIT.nmi, METERS_PER_UNIT.NM);
    assert.equal(unitOptionLabel("NM"), "nautical mile (NM or nmi)");
    assert.equal(unitOptionLabel("m"), "meter (m)");
    assert.equal(unitOptionLabel("hpgl"), "HP-GL (hpgl)");
  });

  test("every one of the 40 units round-trips through meters", () => {
    for (const a of ALL_UNITS) {
      for (const b of ALL_UNITS) {
        const v = 1234.5678;
        const back = convertLength(convertLength(v, a, b), b, a);
        assert.ok(Math.abs(back - v) / v < 1e-9, `${a} → ${b} → ${a}: ${back}`);
      }
    }
  });

  test("the bar computes a finite, non-zero, ascending readout for all 40 units", () => {
    for (const unit of ALL_UNITS) {
      const bar = computeBar(params({ unit, x: "200", width: "100" }));
      assert(bar, `bar computable for ${unit}`);
      assert.ok(Number.isFinite(bar.totalRealValue) && bar.totalRealValue > 0, `${unit}: ${bar.totalRealValue}`);
      // paper → real → paper returns the original width.
      assert.ok(Math.abs(realToPaperMm(bar.totalRealValue, unit, bar.scale) - 100) < 1e-6, `${unit} round-trip`);
      // Labels start at 0 and ascend strictly — including the extreme units,
      // where four fixed decimals used to collapse every label to "0".
      assert.equal(bar.labels[0].text, "0", unit);
      const nums = bar.labels.map((l) => parseFloat(l.text));
      for (let i = 1; i < nums.length; i++) {
        assert.ok(nums[i] > nums[i - 1], `${unit} labels ascend: ${JSON.stringify(bar.labels.map((l) => l.text))}`);
      }
      assert.ok(Number.parseFloat(fmtLength(bar.totalRealValue, 4)) !== 0, `${unit} readout is not zero`);
    }
  });

  test("scaleNotations round-trips: converting a chip's value back yields the scale", () => {
    for (const s of [0.25, 1, 2, 12, 48, 100, 200, 500, 1000]) {
      const n = scaleNotations(s);
      // one-to-X chip: parse back per the flipX rules.
      const backFromX = n.oneToX.endsWith(":1")
        ? 1 / parseFloat(n.oneToX)
        : parseFloat(n.oneToX.slice(2));
      assert.ok(Math.abs(backFromX - s) / s < 0.005, `oneToX chip round-trip at scale ${s}: ${n.oneToX}`);
      // factor chip: strip "≈ " and "×".
      const backFromF = parseFloat(n.factor.replace("≈ ", "").replace("×", ""));
      assert.ok(Math.abs(backFromF - s) / s < 0.005, `factor chip round-trip at scale ${s}: ${n.factor}`);
      // inchToFoot chip: 12/scale inches per foot.
      const inchVal = parseFloat(n.inchToFoot.replace("≈ ", "").split("″")[0]);
      assert.ok(Math.abs(inchVal - 12 / s) / (12 / s) < 0.005, `inch chip value at scale ${s}: ${n.inchToFoot}`);
    }
  });
});