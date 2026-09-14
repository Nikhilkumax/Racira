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
  width: string;        // bar width in mm
  height: string;       // bar height in pt
  lineWidth: string;    // line width in pt
  stepMode: StepMode;
  stepCount: string;    // manual step count
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
  numSteps: number;
  steps: number[];            // per-step paper widths (mm), sum === totalPaperMm
  labels: { pos: number; text: string }[];
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
  stepCount: "5",
  divStyle: "exponential",
  barStyle: "double-row",
  color: "#334155",
};

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

/** Compute all bar geometry parameters. */
export function computeBar(p: BarParams): BarGeometry | null {
  const scale = computeScale(p);
  if (scale === null) return null;
  const segVal = parseFloat(p.segVal);
  const barWidthMm = parseFloat(p.width);
  const barHeightPt = parseFloat(p.height);
  const lineWidthPt = parseFloat(p.lineWidth);
  if (!Number.isFinite(segVal) || segVal <= 0) return null;
  if (!Number.isFinite(barWidthMm) || barWidthMm <= 0) return null;
  if (!Number.isFinite(barHeightPt) || barHeightPt <= 0) return null;
  if (!Number.isFinite(lineWidthPt) || lineWidthPt <= 0) return null;

  const segPaperMm = realToPaperMm(segVal, p.unit, scale);
  const totalPaperMm = barWidthMm;
  const totalSegments = totalPaperMm / segPaperMm;
  const numSteps = p.stepMode === "manual"
    ? Math.max(1, Math.floor(parseFloat(p.stepCount) || 1))
    : p.divStyle === "exponential"
      ? Math.max(2, Math.min(8, Math.round(Math.log2(totalSegments) + 1)))
      : Math.max(2, Math.min(10, Math.round(totalSegments)));

  const steps = p.divStyle === "exponential"
    ? exponentialSteps(totalPaperMm, numSteps)
    : Array.from({ length: numSteps }, () => totalPaperMm / numSteps);

  // Labels: real-world distance at each step boundary. paper × scale = real —
  // the SAME conversion the stats panel uses, applied per boundary.
  const labels: { pos: number; text: string }[] = [];
  let cumMm = 0;
  for (let i = 0; i <= numSteps; i++) {
    labels.push({ pos: cumMm, text: fmtTrim(paperToReal(cumMm, p.unit, scale), 4) });
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
    numSteps,
    steps,
    labels,
    barHeightMm: barHeightPt * 0.352778, // pt → mm
    lineWidthMm: lineWidthPt * 0.352778,
  };
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
