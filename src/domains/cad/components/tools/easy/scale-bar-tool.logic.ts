/**
 * scale-bar-tool.logic.ts — pure scale/geometry math for the Scale Bar Tool.
 *
 * Deliberately free of React (and of any framework import) so the conversion
 * math can be unit-tested directly and so there is exactly ONE conversion path
 * between paper millimetres and real-world length:
 *
 *   paper mm  ×  scale  =  real mm          (realToPaperMm is its exact inverse)
 *
 * `scale` is the dimensionless real-÷-paper ratio: a 1:200 drawing is scale
 * 200 (paper is 200× smaller than reality); an enlarged 200:1 drawing is
 * scale 1/200. Every readout — the stats panel, the SVG tick labels, and the
 * "1 mm paper = N mm real" line — goes through the two functions below, so
 * they can never disagree on direction.
 */

import { METERS_PER_UNIT } from "../shared/length-units";

// Unit factors come from the shared length-units utility so every unit-handling
// CAD tool stays in sync with one single source of truth.
export const UNIT_TO_M = METERS_PER_UNIT;

// ── Types ────────────────────────────────────────────────────────────────────
export type ScaleMode = "one-to-x" | "inch-to-foot" | "scale-factor";
export type BarStyle = "double-row" | "single-row" | "line";
export type StepMode = "automatic" | "manual";
export type DivStyle = "exponential" | "proportional";

/**
 * One row of the Manual step editor: a real-world boundary value the user
 * typed, plus whether that boundary carries a text label on the bar. Value is
 * a string because it is bound straight to a number input (an empty box must
 * stay empty, not become 0).
 */
export interface ManualStep {
  value: string;
  label: boolean;
}

export interface BarParams {
  mode: ScaleMode;
  x: string;            // "1:X" value
  flipX: boolean;       // true = "X:1" mode
  inchPaper: string;    // inches on paper (e.g. "0.25")
  footReal: string;     // feet on real side
  inchReal: string;     // inches on real side (optional, e.g. "0" for 1'-0")
  factorVal: string;    // scale factor
  unit: string;         // real-length unit
  segVal: string;       // one segment = N units
  width: string;        // bar width in mm (Automatic) — ignored in Manual
  height: string;       // bar height in pt
  lineWidth: string;    // line width in pt
  stepMode: StepMode;
  stepRows: ManualStep[]; // Manual-mode boundary values, in `unit`
  divStyle: DivStyle;
  barStyle: BarStyle;
  color: string;        // hex color
}

export interface BarGeometry {
  scale: number;              // real ÷ paper (dimensionless)
  segPaperMm: number;         // one segment's width on paper, mm
  totalPaperMm: number;       // full bar width on paper, mm
  totalSegments: number;      // how many segments fit the bar
  totalRealValue: number;     // real-world length of the full bar, in `unit`
  /** False when `segVal` ("one segment equals") is longer than the bar's own
   *  real span — i.e. not even one segment fits. In that state `segPaperMm`
   *  exceeds `totalPaperMm` and `numSteps` is only the clamped minimum, so
   *  every segment-derived readout contradicts the bar. The UI must refuse to
   *  present those numbers (and never silently rewrite the user's value). */
  segFits: boolean;
  /** False when the Manual bar ITSELF is bigger than the tool's documented
   *  maximum paper width — i.e. the largest boundary, converted at the current
   *  scale, needs more paper than `SLIDER_RANGES.width.max`. Manual rows are
   *  deliberately preserved across a scale change, so shrinking the scale can
   *  turn a tidy 100 mm bar into a 16.7 m one without the rows moving; that bar
   *  is beyond the range the Width control itself documents, and the per-row
   *  "out of range" advisory already flags every row past the same bound. Like
   *  `segFits`, this is a geometric gate for the UI — nothing here rewrites the
   *  rows. Always true in Automatic mode, where Width defines the paper length
   *  directly. */
  manualFits: boolean;
  numSteps: number;
  steps: number[];            // per-step paper widths (mm), sum === totalPaperMm
  labels: { pos: number; text: string }[];
  /** Real-world value at every boundary, ascending, ALWAYS starting at 0 —
   *  the manual editor's seed when switching Automatic → Manual. */
  boundariesReal: number[];
  /** Which boundaries carry a text label. Same length as boundariesReal. */
  boundaryLabeled: boolean[];
  barHeightMm: number;
  lineWidthMm: number;
}

// ── Documented defaults ──────────────────────────────────────────────────────
// Single source of truth for both the initial state AND the Reset button, so
// the two can never drift apart.
export const DEFAULT_PARAMS: BarParams = {
  mode: "one-to-x",
  x: "200",
  flipX: false,
  inchPaper: "0.25",
  footReal: "1",
  inchReal: "0",
  factorVal: "1.2",
  unit: "m",
  segVal: "1",
  width: "100",
  height: "12",
  lineWidth: "0.5",
  stepMode: "automatic",
  // Starts empty and is filled by `seedManualSteps(bar)` the first time the
  // user switches to Manual, so the editor always opens on the bar they were
  // already looking at (never on the build-time default bar).
  stepRows: [],
  divStyle: "exponential",
  barStyle: "double-row",
  color: "#334155",
};

/**
 * Slider bounds, defined here so the manual editor's documented value range
 * and the Width slider can never disagree about the bar's maximum paper width.
 */
export const SLIDER_RANGES = {
  width: { min: 10, max: 400, step: 5 },
  height: { min: 4, max: 48, step: 1 },
  lineWidth: { min: 0.1, max: 4, step: 0.1 },
} as const;

// ── Number formatting ────────────────────────────────────────────────────────
/** Fixed-decimal formatting with trailing zeros trimmed (200.00 → "200"). */
function fmtTrim(n: number, d = 3): string {
  if (!Number.isFinite(n)) return "—";
  return String(+n.toFixed(d));
}

/**
 * Format a dimensionless mm-per-mm ratio with enough precision that a small
 * (enlarged-scale) value never rounds to a misleading 0. A flat 2 dp turned
 * 1/200 = 0.005 into "0.01"; this keeps 5 dp there while 200 still reads "200".
 */
export function fmtRatio(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const mag = Math.abs(n);
  const d = mag === 0 ? 2 : Math.min(10, Math.max(2, Math.ceil(-Math.log10(mag)) + 2));
  return fmtTrim(n, d);
}

/**
 * Format a real-world length for display.
 *
 * Fixed decimals are right for the ordinary range, but the unit table spans
 * 1e-24 … 1e24, and four fixed decimals render a light-year measurement as
 * "0" — a readout that silently claims the bar is zero long. Outside the range
 * where fixed decimals are meaningful, fall back to significant digits so
 * extreme units stay readable (2.114e-15 ly) instead of collapsing to zero.
 */
export function fmtLength(n: number, d = 4): string {
  if (!Number.isFinite(n)) return "—";
  const mag = Math.abs(n);
  if (mag !== 0 && (mag < 1e-4 || mag >= 1e16)) return String(+n.toPrecision(d));
  return String(+n.toFixed(d));
}

// ── Exponential step sequence (leading half-step then doubling) ──────────────
// Matches the reference: 0-5-10-20-40 for a 40-unit bar with 4 steps.
// Pattern: first step = half of second, then each doubles.
export function exponentialSteps(total: number, numSteps: number): number[] {
  if (numSteps < 1) return [];
  if (numSteps === 1) return [total];
  // Total = s * 2^(n-1)  where s = first (half) step, then s, 2s, 4s, ...
  const s = total / Math.pow(2, numSteps - 1);
  const steps: number[] = [s];
  let d = s;
  for (let i = 1; i < numSteps; i++) {
    d = i === 1 ? s : d * 2; // first two steps equal, then double
    steps.push(d);
  }
  return steps;
}

// ── The two directions of the paper ⇄ real conversion ────────────────────────

/** Real-world length (in `unit`) → millimetres of paper at `scale`. */
export function realToPaperMm(val: number, unit: string, scale: number): number {
  return (val * UNIT_TO_M[unit] * 1000) / scale;
}

/** Millimetres of paper at `scale` → real-world length in `unit`. */
export function paperToReal(paperMm: number, unit: string, scale: number): number {
  return (paperMm * scale) / (UNIT_TO_M[unit] * 1000);
}

/** Compute the effective real-÷-paper scale from the three input modes. */
export function computeScale(p: BarParams): number | null {
  if (p.mode === "one-to-x") {
    const xVal = parseFloat(p.x);
    if (!Number.isFinite(xVal) || xVal <= 0) return null;
    return p.flipX ? 1 / xVal : xVal;
  }
  if (p.mode === "inch-to-foot") {
    const inchPaper = parseFloat(p.inchPaper) || 0;
    const footReal = parseFloat(p.footReal) || 0;
    const inchRealPart = parseFloat(p.inchReal) || 0;
    // Total real inches = feet × 12 + extra inches
    const totalRealInches = footReal * 12 + inchRealPart;
    if (inchPaper <= 0) return null;
    // Scale = real / paper (both in inches) → dimensionless denominator
    return totalRealInches / inchPaper;
  }
  if (p.mode === "scale-factor") {
    const f = parseFloat(p.factorVal);
    if (!Number.isFinite(f) || f <= 0) return null;
    return f;
  }
  return null;
}

/**
 * Manual-mode boundary values, parsed from the editor's rows: drop blank /
 * non-positive boxes (an unfinished row must not move the bar), sort ascending
 * and collapse duplicates (two rows with the same value would otherwise create
 * a zero-width segment).
 */
export function parseManualSteps(rows: ManualStep[]): { v: number; label: boolean }[] {
  const parsed = rows
    .map((r) => ({ v: parseFloat(r.value), label: !!r.label }))
    .filter((r) => Number.isFinite(r.v) && r.v > 0)
    .sort((a, b) => a.v - b.v);
  const out: { v: number; label: boolean }[] = [];
  for (const r of parsed) {
    if (!out.length || Math.abs(out[out.length - 1].v - r.v) > 1e-12) out.push(r);
  }
  return out;
}

/** Compute all bar geometry parameters. */
export function computeBar(p: BarParams): BarGeometry | null {
  const scale = computeScale(p);
  if (scale === null) return null;
  const segVal = parseFloat(p.segVal);
  const barWidthMm = parseFloat(p.width);
  const barHeightPt = parseFloat(p.height);
  const lineWidthPt = parseFloat(p.lineWidth);
  if (!Number.isFinite(segVal) || segVal <= 0) return null;
  if (!Number.isFinite(barHeightPt) || barHeightPt <= 0) return null;
  if (!Number.isFinite(lineWidthPt) || lineWidthPt <= 0) return null;

  const segPaperMm = realToPaperMm(segVal, p.unit, scale);

  // ── Which boundaries does the bar have? ─────────────────────────────────
  // Manual: the user's boundary list defines the bar, so its paper length is
  // derived from the LARGEST boundary (real → paper), not from the Width
  // slider — the bar stays geometrically honest (paper mm × scale = real mm)
  // for every boundary the user typed. Automatic: the Width slider defines the
  // bar and the boundaries come from the division style.
  const manualRows = p.stepMode === "manual" ? parseManualSteps(p.stepRows) : [];
  const useManual = p.stepMode === "manual" && manualRows.length >= 1;

  let totalPaperMm: number;
  let steps: number[];
  let boundariesReal: number[];
  let boundaryLabeled: boolean[];

  if (useManual) {
    boundariesReal = [0, ...manualRows.map((r) => r.v)];
    boundaryLabeled = [true, ...manualRows.map((r) => r.label)];
    const pos = boundariesReal.map((v) => realToPaperMm(v, p.unit, scale));
    totalPaperMm = pos[pos.length - 1];
    steps = pos.slice(1).map((v, i) => v - pos[i]);
  } else {
    if (!Number.isFinite(barWidthMm) || barWidthMm <= 0) return null;
    totalPaperMm = barWidthMm;
    const totalSegments = totalPaperMm / segPaperMm;
    const numSteps = p.divStyle === "exponential"
      ? Math.max(2, Math.min(8, Math.round(Math.log2(totalSegments) + 1)))
      : Math.max(2, Math.min(10, Math.round(totalSegments)));
    steps = p.divStyle === "exponential"
      ? exponentialSteps(totalPaperMm, numSteps)
      : Array.from({ length: numSteps }, () => totalPaperMm / numSteps);
    boundaryLabeled = steps.map(() => true).concat(true);
    let cum = 0;
    boundariesReal = [0];
    for (const s of steps) { cum += s; boundariesReal.push(paperToReal(cum, p.unit, scale)); }
  }

  const numSteps = steps.length;
  const totalSegments = totalPaperMm / segPaperMm;
  // "One segment equals" is only meaningful when at least one segment fits on
  // the bar. Nothing here clamps the user's value (that would silently rewrite
  // input on a scale change); the flag lets the UI say so instead.
  const segFits = segPaperMm <= totalPaperMm * (1 + 1e-9) + 1e-9;
  // The Manual bar is bounded by the Width slider's own documented maximum: it
  // is the ONLY paper-width bound a Manual bar has (its length comes from the
  // largest boundary, not from the slider), and it is the same bound the
  // per-row "out of range" advisory uses (see manualRangeMax), so the coarse
  // result gate and the fine per-row flags cannot tell a user two different
  // stories. The 1e-5 slack is the seed's OWN six-digit formatting resolution
  // (`seedManualSteps`), so a Manual bar seeded from a legitimate Automatic bar
  // can never be falsely blocked at the cap — it is 0.004 mm on a 400 mm bar.
  // Automatic bars are exempt: there the user sets the paper width directly.
  const manualFits = !useManual || totalPaperMm <= SLIDER_RANGES.width.max * (1 + 1e-5);

  // Labels: real-world distance at each step boundary. paper × scale = real —
  // the SAME conversion the stats panel uses, applied per boundary. Unlabeled
  // boundaries (fine-subdivision ticks in Manual mode) draw no text.
  const labels: { pos: number; text: string }[] = [];
  let cumMm = 0;
  for (let i = 0; i <= numSteps; i++) {
    if (boundaryLabeled[i]) labels.push({ pos: cumMm, text: fmtLength(paperToReal(cumMm, p.unit, scale), 4) });
    if (i < numSteps) cumMm += steps[i];
  }

  return {
    scale,
    segPaperMm,
    totalPaperMm,
    totalSegments,
    // The full bar's real length, via the single paper → real conversion
    // (equivalent to segVal × totalSegments, but with one code path only).
    totalRealValue: paperToReal(totalPaperMm, p.unit, scale),
    segFits,
    manualFits,
    numSteps,
    steps,
    labels,
    boundariesReal,
    boundaryLabeled,
    barHeightMm: barHeightPt * 0.352778, // pt → mm
    lineWidthMm: lineWidthPt * 0.352778,
  };
}

// ── Manual step editor helpers ───────────────────────────────────────────────

/**
 * Seed rows for the Manual editor from the CURRENT bar's own interior
 * boundaries (0 excluded — the origin is always drawn and always labelled).
 * Switching Automatic → Manual therefore starts from the bar the user was
 * already looking at, instead of an empty list.
 */
export function seedManualSteps(bar: BarGeometry | null | undefined): ManualStep[] {
  if (!bar) return [];
  // `fmtLength` keeps extreme-unit seeds from rounding to "0" and producing
  // duplicate boundary rows.
  return bar.boundariesReal.slice(1).map((v) => ({ value: fmtLength(v, 6), label: true }));
}

/**
 * The quick-fill series: ten evenly spaced values from a tenth of the nearest
 * power of ten below `maxReal` up to that power of ten — e.g. 1, 2, 3 … 10 for
 * a 20 m bar. Mirrors the reference's "Add numbers …" helper, which builds the
 * same 0.1w … w ladder and labels only the largest tick.
 */
export function tenStepSeries(maxReal: number): number[] {
  if (!Number.isFinite(maxReal) || maxReal <= 0) return [];
  const w = Math.pow(10, Math.floor(Math.log10(maxReal)));
  return Array.from({ length: 10 }, (_, i) => +(((i + 1) * w) / 10).toPrecision(12));
}

/**
 * Documented upper bound for a Manual boundary value: the real-world length of
 * the Width slider's maximum paper width at the current scale. Deliberately
 * independent of the current bar (which the last row itself defines) so the
 * hint can never be circular.
 */
export function manualRangeMax(unit: string, scale: number | null | undefined): number | null {
  if (!scale || !Number.isFinite(scale)) return null;
  return paperToReal(SLIDER_RANGES.width.max, unit, scale);
}

/**
 * Human-readable label for the current scale, e.g. "1:200", "200:1",
 * "0.25″=1′-0″", "1.2×".
 *
 * `scale` is real ÷ paper, so in one-to-X mode X is `scale` itself; in X-to-one
 * mode X is `1 / scale`. Getting that backwards is what made a 1:200 drawing
 * print "1:0" and an enlarged 200:1 drawing print "0:1".
 */
export function buildScaleLabel(scale: number | null | undefined, p: BarParams): string {
  if (!scale) return "—";
  if (p.mode === "one-to-x") {
    return p.flipX ? `${fmtTrim(1 / scale, 1)}:1` : `1:${fmtTrim(scale, 1)}`;
  }
  if (p.mode === "inch-to-foot") {
    const ip = parseFloat(p.inchPaper) || 0.25;
    const fr = parseFloat(p.footReal) || 1;
    const ir = parseFloat(p.inchReal) || 0;
    const realPart = ir > 0 ? `${fr}′-${ir}″` : `${fr}′-0″`;
    return `${fmtTrim(ip, 4)}″=${realPart}`;
  }
  return `${fmtTrim(scale, 4)}×`;
}

// ── Cross-notation chips (radio badges) ─────────────────────────────────────
/**
 * The current scale expressed in ALL three notations at once, for the badges
 * shown next to each scale-mode radio. Unlike buildScaleLabel (which renders
 * the ACTIVE mode's own input echo), these are pure conversions of `scale` —
 * a user typing "1:200" simultaneously sees ≈ 0.06″=1′-0″ and ≈ 200×.
 *
 * Derived notations carry a "≈" because they are approximations of a
 * dimensionless ratio in a friendly unit (an arbitrary ratio rarely lands on
 * a tidy architectural fraction). one-to-X needs no "≈" — it IS the ratio.
 *
 * Precision: 4 dp with trailing zeros trimmed. 2 dp would round 1/200 to
 * "0.01×" — the same misleading-small-value bug fmtRatio was written to fix.
 */
export interface ScaleNotations {
  oneToX: string;
  inchToFoot: string;
  factor: string;
}

export function scaleNotations(scale: number | null | undefined): ScaleNotations {
  if (!scale || !Number.isFinite(scale)) {
    return { oneToX: "—", inchToFoot: "—", factor: "—" };
  }
  return {
    oneToX: scale >= 1 ? `1:${fmtTrim(scale, 2)}` : `${fmtTrim(1 / scale, 2)}:1`,
    // Inches-per-foot on paper = 12 / scale (48 ↔ ¼″=1′-0″).
    inchToFoot: `≈ ${fmtTrim(12 / scale, 4)}″=1′-0″`,
    factor: `≈ ${fmtTrim(scale, 4)}×`,
  };
}
