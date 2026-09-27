"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FormGrid, Num, NumField, Panel, PanelTitle, Radios, Res, ResBox, Row, SliderNum, fmtTrim } from "./ui";
import { UNIT_GROUPS, unitOptionLabel } from "../shared/length-units";
// All scale/geometry math lives in a React-free module so there is exactly one
// paper ⇄ real conversion path and the formulas can be unit-tested directly.
import {
  DEFAULT_PARAMS,
  SLIDER_RANGES,
  buildScaleLabel,
  computeBar,
  fmtLength,
  fmtRatio,
  manualRangeMax,
  scaleNotations,
  seedManualSteps,
  tenStepSeries,
  type BarParams,
  type BarStyle,
  type DivStyle,
  type ManualStep,
  type ScaleMode,
  type StepMode,
} from "./scale-bar-tool.logic";

// ── SVG renderer ────────────────────────────────────────────────────────────
function renderBarSvg(
  bar: ReturnType<typeof computeBar>,
  p: BarParams,
  margin = 2
): string {
  if (!bar) return "";
  const w = bar.totalPaperMm + margin * 2;
  const h = bar.barHeightMm + 10 + margin * 2; // extra space for labels
  const color = p.color || "#334155";

  // On-screen zoom. The drawing's natural size IS the bar's paper size in mm
  // (e.g. 104 × 18 units), which renders as a tiny sliver with unreadable
  // 3-unit tick labels. Scaling the SVG viewport ×4 leaves the geometry (and
  // every export) untouched while making the preview legible; a bar wider
  // than the panel scrolls inside its overflow-x-auto wrapper.
  const ZOOM = 4;

  const parts: string[] = [];
  const scaleLabel = buildScaleLabel(bar.scale, p);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${+(w * ZOOM).toFixed(3)}" height="${+(h * ZOOM).toFixed(3)}" role="img" aria-label="Scale bar at ${scaleLabel}">`);

  if (p.barStyle === "double-row") {
    // Alternating filled blocks — two rows
    let x = margin;
    for (let i = 0; i < bar.numSteps; i++) {
      const sw = bar.steps[i];
      const fillTop = i % 2 === 0 ? color : "#ffffff";
      const fillBot = i % 2 === 0 ? "#ffffff" : color;
      parts.push(`<rect x="${x}" y="${margin}" width="${sw}" height="${bar.barHeightMm / 2}" fill="${fillTop}" stroke="${color}" stroke-width="${bar.lineWidthMm}"/>`);
      parts.push(`<rect x="${x}" y="${margin + bar.barHeightMm / 2}" width="${sw}" height="${bar.barHeightMm / 2}" fill="${fillBot}" stroke="${color}" stroke-width="${bar.lineWidthMm}"/>`);
      x += sw;
    }
  } else if (p.barStyle === "single-row") {
    let x = margin;
    for (let i = 0; i < bar.numSteps; i++) {
      const sw = bar.steps[i];
      const fill = i % 2 === 0 ? color : "#ffffff";
      parts.push(`<rect x="${x}" y="${margin}" width="${sw}" height="${bar.barHeightMm}" fill="${fill}" stroke="${color}" stroke-width="${bar.lineWidthMm}"/>`);
      x += sw;
    }
  } else {
    // Line style — ruled line with tick marks
    const y = margin + bar.barHeightMm / 2;
    parts.push(`<line x1="${margin}" y1="${y}" x2="${margin + bar.totalPaperMm}" y2="${y}" stroke="${color}" stroke-width="${bar.lineWidthMm}"/>`);
    let x = margin;
    for (let i = 0; i <= bar.numSteps; i++) {
      parts.push(`<line x1="${x}" y1="${margin}" x2="${x}" y2="${margin + bar.barHeightMm}" stroke="${color}" stroke-width="${bar.lineWidthMm}"/>`);
      if (i < bar.numSteps) x += bar.steps[i];
    }
  }

  // Labels
  for (const l of bar.labels) {
    const x = margin + l.pos;
    const anchor = l.pos === 0 ? "start" : l.pos >= bar.totalPaperMm - 0.1 ? "end" : "middle";
    parts.push(`<text x="${x}" y="${margin + bar.barHeightMm + 4}" text-anchor="${anchor}" font-size="3" fill="#0f172a" font-family="ui-monospace, monospace">${l.text}</text>`);
  }

  parts.push("</svg>");
  return parts.join("\n");
}

// ── Export functions ─────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSvg(svgStr: string) {
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  downloadBlob(blob, "scale-bar.svg");
}

function exportPng(svgStr: string, scale = 4) {
  const canvas = document.createElement("canvas");
  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  img.onload = () => {
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((b) => {
      if (b) downloadBlob(b, "scale-bar.png");
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.src = url;
}

async function exportPdf(svgStr: string) {
  const { jsPDF } = await import("jspdf");
  const vbMatch = svgStr.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w = vbMatch ? parseFloat(vbMatch[1]) : 100;
  const h = vbMatch ? parseFloat(vbMatch[2]) : 20;
  const doc = new jsPDF({ orientation: w > h ? "l" : "p", unit: "mm", format: "a4" });
  const canvas = document.createElement("canvas");
  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve) => {
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => {
        if (b) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            doc.addImage(dataUrl, "PNG", 20, 100, w, h);
            doc.save("scale-bar.pdf");
          };
          reader.readAsDataURL(b);
        }
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    };
    img.src = url;
  });
}

/**
 * DXF R12 export with proper SOLID entities for filled segments.
 * SOLID (code 0 = "SOLID") is the R12 entity for a filled quadrilateral —
 * AutoCAD, QCAD, LibreCAD, BricsCAD all render it as solid fill at the
 * correct scale. This is the highest-value format for users dragging the
 * bar into a drawing title block.
 *
 * Coordinate convention: Y increases upward in DXF model space. The bar
 * is placed at y0..y0+hh in model space, matching the scale (1 DXF unit =
 * 1 mm on paper). All segment widths come directly from bar.steps[] so the
 * bar is geometrically correct for the stated scale.
 */
function exportDxf(bar: ReturnType<typeof computeBar>, p: BarParams) {
  if (!bar) return;

  const lines: string[] = [];
  const push = (code: number, val: string | number) => {
    lines.push(String(code));
    lines.push(String(val));
  };
  const section = (name: string) => { push(0, "SECTION"); push(2, name); };
  const endsec = () => push(0, "ENDSEC");

  // ── HEADER ────────────────────────────────────────────────────────────────
  section("HEADER");
  push(9, "$ACADVER"); push(1, "AC1009"); // DXF R12 — broadest compatibility
  push(9, "$INSUNITS"); push(70, 4);     // 4 = millimeters
  endsec();

  // ── TABLES (minimal: LTYPE + LAYER) ───────────────────────────────────────
  section("TABLES");
  push(0, "TABLE"); push(2, "LTYPE"); push(70, 1);
  push(0, "LTYPE"); push(2, "CONTINUOUS"); push(70, 0);
  push(3, ""); push(72, 65); push(73, 0); push(40, "0.0");
  push(0, "ENDTAB");

  push(0, "TABLE"); push(2, "LAYER"); push(70, 2);
  // Layer 0: solid (filled) segments
  push(0, "LAYER"); push(2, "SCALE_BAR_FILL"); push(70, 0); push(62, 7); push(6, "CONTINUOUS");
  // Layer 1: outlines
  push(0, "LAYER"); push(2, "SCALE_BAR_OUTLINE"); push(70, 0); push(62, 7); push(6, "CONTINUOUS");
  push(0, "ENDTAB");
  endsec();

  // ── BLOCKS (required empty section) ───────────────────────────────────────
  section("BLOCKS");
  push(0, "BLOCK"); push(2, "*MODEL_SPACE"); push(70, 0);
  push(10, "0"); push(20, "0"); push(30, "0"); push(3, "*MODEL_SPACE"); push(1, "");
  push(0, "ENDBLK");
  push(0, "BLOCK"); push(2, "*PAPER_SPACE"); push(70, 0);
  push(10, "0"); push(20, "0"); push(30, "0"); push(3, "*PAPER_SPACE"); push(1, "");
  push(0, "ENDBLK");
  endsec();

  // ── ENTITIES ──────────────────────────────────────────────────────────────
  section("ENTITIES");
  const mg = 2;          // margin in mm
  const y0 = 10;         // y offset from origin
  const hh = bar.barHeightMm;

  /**
   * SOLID entity: 4 corner points in the Z-shaped order required by DXF —
   * (p1, p2, p4, p3) which visually maps to bottom-left, bottom-right,
   * top-right, top-left (i.e. NOT simple clockwise or counter-clockwise).
   * The fourth point (group 13/23) may equal the third for a triangle, but
   * for quads all four are distinct.
   */
  const solid = (x1: number, y1: number, x2: number, y2: number,
                 x3: number, y3: number, x4: number, y4: number,
                 layer = "SCALE_BAR_FILL") => {
    push(0, "SOLID");
    push(8, layer);
    // DXF SOLID corner order: BL, BR, TL, TR  (Z-path winding)
    push(10, x1); push(20, y1); push(30, 0); // pt1 bottom-left
    push(11, x2); push(21, y2); push(31, 0); // pt2 bottom-right
    push(12, x3); push(22, y3); push(32, 0); // pt3 top-left
    push(13, x4); push(23, y4); push(33, 0); // pt4 top-right
  };

  const line = (x1: number, y1: number, x2: number, y2: number,
                layer = "SCALE_BAR_OUTLINE") => {
    push(0, "LINE");
    push(8, layer);
    push(10, x1); push(20, y1); push(30, 0);
    push(11, x2); push(21, y2); push(31, 0);
  };

  if (p.barStyle === "line") {
    // Horizontal rule with tick marks — LINE entities only
    const midY = y0 + hh / 2;
    line(mg, midY, mg + bar.totalPaperMm, midY);
    let x = mg;
    for (let i = 0; i <= bar.numSteps; i++) {
      line(x, y0, x, y0 + hh);
      if (i < bar.numSteps) x += bar.steps[i];
    }
  } else {
    const rows = p.barStyle === "double-row" ? 2 : 1;
    const rowH = hh / rows;
    let x = mg;
    for (let i = 0; i < bar.numSteps; i++) {
      const sw = bar.steps[i];
      for (let r = 0; r < rows; r++) {
        const yBot = y0 + r * rowH;          // bottom of this row (DXF Y up)
        const yTop = yBot + rowH;            // top of this row
        const isFilled =
          (p.barStyle === "double-row" && ((i + r) % 2 === 0)) ||
          (p.barStyle === "single-row" && i % 2 === 0);

        if (isFilled) {
          // SOLID entity — fills with current layer color (black by default)
          solid(
            x,       yBot,   // BL
            x + sw,  yBot,   // BR
            x,       yTop,   // TL
            x + sw,  yTop,   // TR
            "SCALE_BAR_FILL"
          );
        }
        // Outline for every cell (both filled and empty)
        line(x,      yBot, x + sw, yBot);
        line(x + sw, yBot, x + sw, yTop);
        line(x + sw, yTop, x,      yTop);
        line(x,      yTop, x,      yBot);
      }
      x += sw;
    }
  }

  // ── TEXT labels ──────────────────────────────────────────────────────────
  for (const l of bar.labels) {
    push(0, "TEXT");
    push(8, "SCALE_BAR_OUTLINE");
    push(10, mg + l.pos); push(20, y0 + hh + 3); push(30, 0);
    push(40, 2.5); // text height in mm
    push(1, l.text);
    push(72, l.pos === 0 ? 0 : l.pos >= bar.totalPaperMm - 0.1 ? 2 : 1); // justification
  }

  endsec();
  push(0, "EOF");

  const blob = new Blob([lines.join("\n")], { type: "application/dxf" });
  downloadBlob(blob, "scale-bar.dxf");
}

/**
 * The single "invert this ratio" affordance: same glyph, same wording and the
 * same trailing-edge-of-its-input placement in EVERY ratio mode (One-to-X and
 * Scale factor). Previously the two modes offered two different controls
 * ("⇄ Toggle X:1" pinned to a radio badge, "Flip ÷" inside the factor row) for
 * the same conceptual action, so the action had to be learned twice.
 */
function RatioFlipButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      data-testid="flip-ratio"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 text-xs font-medium transition-colors hover:bg-muted/80"
    >
      <span aria-hidden="true">⇄</span> Flip ratio
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ScaleBarTool() {
  // Every field is seeded from DEFAULT_PARAMS so Reset has one source of truth
  // to restore to (the initial render and the reset can never drift apart).
  const [mode, setMode] = useState<ScaleMode>(DEFAULT_PARAMS.mode);
  const [x, setX] = useState(DEFAULT_PARAMS.x);
  const [flipX, setFlipX] = useState(DEFAULT_PARAMS.flipX);
  const [inchPaper, setInchPaper] = useState(DEFAULT_PARAMS.inchPaper);
  const [footReal, setFootReal] = useState(DEFAULT_PARAMS.footReal);
  const [inchReal, setInchReal] = useState(DEFAULT_PARAMS.inchReal);
  const [factorVal, setFactorVal] = useState(DEFAULT_PARAMS.factorVal);
  const [unit, setUnit] = useState(DEFAULT_PARAMS.unit);
  const [segVal, setSegVal] = useState(DEFAULT_PARAMS.segVal);
  const [width, setWidth] = useState(DEFAULT_PARAMS.width);
  const [height, setHeight] = useState(DEFAULT_PARAMS.height);
  const [lineWidth, setLineWidth] = useState(DEFAULT_PARAMS.lineWidth);
  const [stepMode, setStepMode] = useState<StepMode>(DEFAULT_PARAMS.stepMode);
  const [stepRows, setStepRows] = useState<ManualStep[]>(DEFAULT_PARAMS.stepRows);
  const [divStyle, setDivStyle] = useState<DivStyle>(DEFAULT_PARAMS.divStyle);
  const [barStyle, setBarStyle] = useState<BarStyle>(DEFAULT_PARAMS.barStyle);
  const [color, setColor] = useState(DEFAULT_PARAMS.color);
  const [hexInput, setHexInput] = useState(DEFAULT_PARAMS.color);
  const svgRef = useRef<HTMLDivElement>(null);

  /** Restore EVERY field on this tool — scale mode/value, units, bar geometry,
   *  steps, division/bar style and colour — back to its documented default. */
  const handleReset = useCallback(() => {
    setMode(DEFAULT_PARAMS.mode);
    setX(DEFAULT_PARAMS.x);
    setFlipX(DEFAULT_PARAMS.flipX);
    setInchPaper(DEFAULT_PARAMS.inchPaper);
    setFootReal(DEFAULT_PARAMS.footReal);
    setInchReal(DEFAULT_PARAMS.inchReal);
    setFactorVal(DEFAULT_PARAMS.factorVal);
    setUnit(DEFAULT_PARAMS.unit);
    setSegVal(DEFAULT_PARAMS.segVal);
    setWidth(DEFAULT_PARAMS.width);
    setHeight(DEFAULT_PARAMS.height);
    setLineWidth(DEFAULT_PARAMS.lineWidth);
    setStepMode(DEFAULT_PARAMS.stepMode);
    setStepRows(DEFAULT_PARAMS.stepRows);
    setDivStyle(DEFAULT_PARAMS.divStyle);
    setBarStyle(DEFAULT_PARAMS.barStyle);
    setColor(DEFAULT_PARAMS.color);
    setHexInput(DEFAULT_PARAMS.color);
  }, []);

  // Sync hex text input ↔ color picker
  const handleColorPicker = (v: string) => { setColor(v); setHexInput(v); };
  const handleHexInput = (v: string) => {
    setHexInput(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setColor(v);
  };

  const params: BarParams = useMemo(() => ({
    mode, x, flipX, inchPaper, footReal, inchReal, factorVal, unit, segVal,
    width, height, lineWidth, stepMode, stepRows, divStyle, barStyle, color,
  }), [mode, x, flipX, inchPaper, footReal, inchReal, factorVal, unit, segVal,
    width, height, lineWidth, stepMode, stepRows, divStyle, barStyle, color]);

  const bar = useMemo(() => computeBar(params), [params]);
  // A result is truthful only when BOTH geometric gates hold:
  //   • segFits    — "one segment equals" is short enough to fit the bar (item 1)
  //   • manualFits — a Manual bar's OWN paper length is within the documented
  //                  Width range, i.e. the rows preserved across a scale change
  //                  still describe a bar this tool can actually draw
  // When either fails there is no honest number set to show: the paper readouts
  // would contradict the bar's own stated bounds and the step count would
  // pretend the divisions fit. So the result — readout, preview and downloads —
  // stays withheld, with an explanation in its place, until the input is fixed.
  const segInvalid = bar !== null && !bar.segFits;
  const manualInvalid = bar !== null && !bar.manualFits;
  const resultInvalid = segInvalid || manualInvalid;
  const svgStr = useMemo(
    () => (bar && !resultInvalid ? renderBarSvg(bar, params) : ""),
    [bar, resultInvalid, params],
  );

  const handleExportSvg = useCallback(() => { if (svgStr) exportSvg(svgStr); }, [svgStr]);
  const handleExportPng = useCallback(() => { if (svgStr) exportPng(svgStr); }, [svgStr]);
  const handleExportPdf = useCallback(() => { if (svgStr) exportPdf(svgStr); }, [svgStr]);
  const handleExportDxf = useCallback(() => { if (svgStr && bar) exportDxf(bar, params); }, [svgStr, bar, params]);

  // Computed results
  const scale = bar?.scale ?? null;
  const segPaperMm = bar?.segPaperMm ?? null;
  const totalPaperMm = bar?.totalPaperMm ?? null;
  // "One segment equals" must fit inside the bar's own real span. That span
  // (Width × scale, or the largest Manual boundary) comes straight from the
  // geometry, which never depends on segVal — so this bound is not circular.
  const segMaxReal = bar ? bar.totalRealValue : null;
  const segNum = parseFloat(segVal);
  const segError = segVal.trim() !== "" && (!Number.isFinite(segNum) || segNum <= 0);
  const segBounded = segMaxReal !== null ? fmtLength(segMaxReal, 4) : "—";
  // What the Manual gate is complaining about: the largest preserved boundary
  // and the paper it demands at the scale now in force.
  const manualMaxReal = bar && bar.boundariesReal.length > 0
    ? bar.boundariesReal[bar.boundariesReal.length - 1]
    : null;
  const manualMaxLabel = manualMaxReal !== null ? `${fmtLength(manualMaxReal, 4)} ${unit}` : "—";
  const manualPaperLabel = bar ? `${fmtTrim(bar.totalPaperMm, 2)} mm` : "—";
  // fmtLength (not fmtTrim): the unit table reaches 1e-24…1e24, where four
  // fixed decimals would print an extreme unit as a bare "0" — claiming the
  // bar has no length when it does.
  const totalReal = bar ? `${fmtLength(bar.totalRealValue, 4)} ${unit}` : "—";

  const scaleLabel = buildScaleLabel(scale, params);

  // The current scale in ALL three notations — shown as chips next to every
  // scale-mode radio, so the conversions stay visible no matter which mode
  // the user is typing in.
  const notations = useMemo(() => scaleNotations(scale), [scale]);

  // ── Manual step editor ──────────────────────────────────────────────────
  // These all operate on plain bound state so the rows behave like every other
  // input on the tool: type, reorder, delete, and the bar re-renders.
  const updateStep = useCallback((i: number, patch: Partial<ManualStep>) => {
    setStepRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }, []);
  const deleteStep = useCallback((i: number) => {
    setStepRows((rows) => rows.filter((_, idx) => idx !== i));
  }, []);
  const addStep = useCallback(() => {
    setStepRows((rows) => [...rows, { value: "", label: true }]);
  }, []);
  /** Ascending by value; blank/unparseable rows sink to the bottom so a
   *  half-typed row is never lost in the middle of the list. */
  const sortStepsAsc = useCallback(() => {
    setStepRows((rows) => [...rows].sort((a, b) => {
      const av = parseFloat(a.value), bv = parseFloat(b.value);
      const an = Number.isFinite(av), bn = Number.isFinite(bv);
      if (!an && !bn) return 0;
      if (!an) return 1;
      if (!bn) return -1;
      return av - bv;
    }));
  }, []);
  /** Quick-fill: replace every row that the ladder covers with 0.1w … w (only
   *  the largest labelled), matching the reference's "Add numbers …" helper. */
  const addTenNumbers = useCallback(() => {
    const series = tenStepSeries(bar ? bar.totalRealValue : 0);
    if (!series.length) return;
    const max = series[series.length - 1];
    setStepRows((rows) => [
      ...rows.filter((r) => {
        const v = parseFloat(r.value);
        return !(Number.isFinite(v) && v <= max);
      }),
      ...series.map((v, i) => ({ value: fmtTrim(v, 6), label: i === series.length - 1 })),
    ]);
  }, [bar]);
  /** Switching to Manual opens the editor seeded with the CURRENT bar's own
   *  interior boundaries (the reference leaves the list blank and falls back to
   *  its automatic steps until two rows exist — see the task report). */
  const handleStepMode = useCallback((v: string) => {
    const next = v as StepMode;
    if (next === "manual") setStepRows((rows) => (rows.length ? rows : seedManualSteps(bar)));
    setStepMode(next);
  }, [bar]);

  // Manual-mode derived values.
  const manualRange = manualRangeMax(unit, scale);
  const tenSeries = tenStepSeries(bar ? bar.totalRealValue : 0);
  const tenLabel = tenSeries.length
    ? `Add numbers ${fmtTrim(tenSeries[0], 4)}, ${fmtTrim(tenSeries[1], 4)}, ${fmtTrim(tenSeries[2], 4)}, .. till ${fmtTrim(tenSeries[9], 4)}`
    : "Add numbers";
  // In Manual mode the boundary list owns the bar's length, so the Width field
  // displays (and is locked to) the derived paper width instead of driving it.
  const widthValue = stepMode === "manual" && bar ? fmtTrim(bar.totalPaperMm, 2) : width;

  return (
    <div data-testid="tool-layout" className="flex flex-col gap-4">
      <Panel>
        <PanelTitle>Scale bar input</PanelTitle>

        {/* Radio toggle for scale mode — each option carries a live chip
            showing the CURRENT scale in that option's notation. Gap-1 (4px)
            between rows: the two-line blocks the badge needs are what set the
            floor here, so the inter-row whitespace is halved rather than the
            pitch (33.6px → 29.6px measured). */}
        <div data-testid="scale-mode-list" className="flex flex-col gap-1 mb-3">
          {([
            ["one-to-x", "One-to-X scale  (e.g. 1 : 200)", notations.oneToX],
            ["inch-to-foot", "Inches-to-the-foot  (e.g. ¼″ = 1′-0″)", notations.inchToFoot],
            ["scale-factor", "Scale factor  (e.g. 1.2×)", notations.factor],
          ] as const).map(([val, label, chip]) => (
            // Just the radio + its live notation chip. The "invert this ratio"
            // control lives on the mode's own value row below, so it is in the
            // same place in every ratio mode (see RatioFlipButton).
            <div key={val} className="flex items-center gap-2 text-sm">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                <input type="radio" name="scale-mode" value={val} checked={mode === val}
                  onChange={() => setMode(val)} className="accent-primary" />
                <span>{label}</span>
                <span data-testid={`chip-${val}`}
                  title="The current scale in this notation (live-computed)"
                  className="ml-auto shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {chip}
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* Mode-specific inputs */}
        {mode === "one-to-x" && (
          <FormGrid>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Num name="x" label={flipX ? "Scale X : 1" : "Scale 1 : X"} value={x} onChange={setX} />
              </div>
              <RatioFlipButton
                onClick={() => setFlipX(!flipX)}
                title={flipX ? "Invert this ratio — show it as 1 : X" : "Invert this ratio — show it as X : 1 (enlargement)"}
              />
            </div>
          </FormGrid>
        )}

        {mode === "inch-to-foot" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Num name="inchPaper" label="Inches on paper" unit="″" value={inchPaper} onChange={setInchPaper} />
              <Num name="footReal" label="Feet (real)" unit="′" value={footReal} onChange={setFootReal} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Num name="inchReal" label="Extra inches (real)" unit="″" value={inchReal} onChange={setInchReal} />
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  e.g. 0.25″ = 1′-0″ → scale 1:48<br />
                  e.g. 0.5″ = 1′-6″ → scale 1:36
                </p>
              </div>
            </div>
          </>
        )}

        {mode === "scale-factor" && (
          <FormGrid>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                {/* No `unit="×"` tag: a bare "×" floating at the far edge of
                    the label row read like a stray control (it was a static
                    unit annotation with no handler). The multiplier notation is
                    already carried by the radio label, the chip and the
                    effective-scale line. */}
                <Num name="factor" label="Scale factor" value={factorVal} onChange={setFactorVal} />
              </div>
              <RatioFlipButton
                onClick={() => {
                  const f = parseFloat(factorVal);
                  if (Number.isFinite(f) && f > 0) setFactorVal(String(+(1 / f).toFixed(6)));
                }}
                title="Invert this ratio — use its reciprocal factor"
              />
            </div>
          </FormGrid>
        )}

        {/* Computed scale as a plain inline line (was a shaded box) — same live
            content, no card wrapper or padding. */}
        <p data-testid="effective-scale" className="mt-1.5 text-xs text-muted-foreground">
          Effective scale: <span className="font-mono font-medium text-foreground">{scaleLabel}</span>
          {scale && <span className="ml-2 text-muted-foreground/70">(1 mm paper = {fmtRatio(scale)} mm real)</span>}
        </p>

        {/* Field rows — label left, control right (the reference's pattern).
            Below `sm` each row stacks label-over-control so the control keeps
            the full width and nothing overflows a phone viewport. */}
        <div className="mt-1">
          <Row label="Real-length unit" testid="row-unit" controlWidth="sm:w-72">
            <select
              data-testid="in-unit"
              aria-label="Real-length unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              {UNIT_GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.units.map((u) => (
                    <option key={u} value={u}>{unitOptionLabel(u)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Row>

          {/* "One segment equals" is bounded by the bar's own real span — the
              same "value can be between …" constraint the Manual step rows use.
              The bound moves with the scale, the width and the unit, so a
              segment that was valid under one scale is flagged the moment it no
              longer fits another one. The value is never rewritten for the user. */}
          <Row label="One segment equals" unit={unit} testid="row-seg">
            <NumField name="seg" value={segVal} onChange={setSegVal}
              invalid={segInvalid || segError} />
            {segInvalid ? (
              <p data-testid="seg-invalid" className="mt-1 text-[11px] font-medium text-destructive">
                Longer than the whole bar: at this scale it only spans {segBounded} {unit}.
              </p>
            ) : segError ? (
              <p data-testid="seg-invalid" className="mt-1 text-[11px] font-medium text-destructive">
                Enter a value greater than 0.
              </p>
            ) : null}
            <p data-testid="seg-range-hint" className="mt-1 text-[11px] italic text-muted-foreground">
              Value can be between 0 and {segBounded} {unit}.
              This range moves with the bar width, scale and unit.
            </p>
          </Row>

          {/* Width / Height / Line width are three separate FULL-WIDTH rows,
              stacked in that order — the reference's own layout. (An earlier
              density pass paired Width+Height into two columns; the reference
              does not, and the pair halved the finest-step sliders' drag
              targets.) Ranges come from the shared SLIDER_RANGES constant.
              In Manual mode the Width field mirrors the width derived from the
              last step boundary and is locked, since the boundary list — not
              the slider — defines how long the bar is. */}
          <SliderNum inline name="width" label="Width" unit="mm" value={widthValue} onChange={setWidth}
            disabled={stepMode === "manual"} {...SLIDER_RANGES.width} />
          {stepMode === "manual" && (
            <p data-testid="width-manual-note" className="mt-0.5 text-[11px] italic text-muted-foreground">
              Width follows the last step in Manual mode ({widthValue} mm on paper).
            </p>
          )}
          <SliderNum inline name="height" label="Height" unit="pt" value={height} onChange={setHeight}
            {...SLIDER_RANGES.height} />
          <SliderNum inline name="lineWidth" label="Line width" unit="pt" value={lineWidth} onChange={setLineWidth}
            {...SLIDER_RANGES.lineWidth} />

          {/* Steps: Automatic/Manual as inline radios (was a dropdown). */}
          <Row label="Steps" testid="row-stepMode" controlWidth="sm:w-auto">
            <Radios name="stepMode" ariaLabel="Steps" value={stepMode}
              onChange={handleStepMode}
              options={[{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }]} />
          </Row>

          {/* Automatic sub-box — the step-count + division controls, matching
              the reference's #automaticBlock. The count is READ-ONLY here
              (live-computed from the scale/width and the division style); the
              reference lets you type it, but its own value is overwritten on
              every re-generate, so showing the computed value is the honest
              version of the same field. */}
          {stepMode === "automatic" && (
            <div data-testid="steps-subbox" className="mt-1 rounded-lg border border-border bg-muted/30 px-3">
              {/* The count is only a real answer when at least one segment fits
                  the bar; otherwise it is the clamped minimum and would imply
                  segments fit when they cannot (see the Result panel). */}
              <Num inline name="stepCount" label="Step count"
                value={bar && bar.segFits ? String(bar.numSteps) : ""}
                onChange={() => {}}
                disabled />
              <div className="pb-2">
                <Radios name="divStyle" ariaLabel="Step division" value={divStyle}
                  onChange={(v) => setDivStyle(v as DivStyle)}
                  options={[
                    { value: "exponential", label: "Divided exponential" },
                    { value: "proportional", label: "Divided proportionally" },
                  ]} />
              </div>
            </div>
          )}

          {/* Manual sub-box — a per-segment editor: one row per boundary value
              (value + unit + Label checkbox + Delete), then Add step / Sort
              steps / the "Add numbers …" quick-fill, then the documented value
              range for the current scale and unit. */}
          {stepMode === "manual" && (
            <div data-testid="steps-manual" className="mt-1 rounded-lg border border-border bg-muted/30 p-3">
              {stepRows.length === 0 ? (
                <p data-testid="steps-manual-empty" className="text-xs text-muted-foreground">
                  No step boundaries yet — use “Add step” below.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stepRows.map((r, i) => {
                    const v = parseFloat(r.value);
                    const outOfRange = r.value.trim() !== "" && (
                      !Number.isFinite(v) || v <= 0 || (manualRange !== null && v > manualRange)
                    );
                    return (
                      <div key={i} data-testid={`step-row-${i}`} className="flex flex-wrap items-center gap-2">
                        <div className="w-24 shrink-0">
                          <NumField name={`stepValue-${i}`} value={r.value}
                            onChange={(nv) => updateStep(i, { value: nv })} />
                        </div>
                        {/* Lowercase, spelled-out unit tag: the old `uppercase`
                            class rendered a bare "M" here while every other unit
                            label on the page reads "m". */}
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{unitOptionLabel(unit)}</span>
                        {outOfRange && (
                          <span data-testid={`step-invalid-${i}`} className="shrink-0 text-[10px] font-medium text-destructive">
                            out of range
                          </span>
                        )}
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                          <input type="checkbox" data-testid={`step-label-${i}`} checked={r.label}
                            onChange={(e) => updateStep(i, { label: e.target.checked })}
                            className="accent-primary" />
                          Label
                        </label>
                        <button type="button" data-testid={`step-delete-${i}`} onClick={() => deleteStep(i)}
                          className="ml-auto shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium hover:bg-muted/80 transition-colors">
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" data-testid="step-add" onClick={addStep}
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 transition-colors">
                  + Add step
                </button>
                <button type="button" data-testid="step-sort" onClick={sortStepsAsc}
                  className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 transition-colors">
                  ↕ Sort steps
                </button>
                {tenSeries.length > 0 && (
                  <button type="button" data-testid="step-add-tens" onClick={addTenNumbers}
                    title="Fill the list with an even 10-value ladder"
                    className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium hover:bg-muted/80 transition-colors">
                    {tenLabel}
                  </button>
                )}
              </div>

              <p data-testid="step-range-hint" className="mt-2 text-[11px] italic text-muted-foreground">
                ↑ Value can be between 0 and {manualRange === null ? "—" : fmtTrim(manualRange, 4)} {unit}.
                This range can be moved by altering the scale or unit.
              </p>
            </div>
          )}

          <Row label="Bar style" testid="row-barStyle" controlWidth="sm:w-auto">
            <Radios name="bar-style" ariaLabel="Bar style" value={barStyle}
              onChange={(v) => setBarStyle(v as BarStyle)}
              options={[
                { value: "double-row", label: "Double row" },
                { value: "single-row", label: "Single row" },
                { value: "line", label: "Line" },
              ]} />
          </Row>

          {/* Color swatch + hex text field. The hex field is Racira's own
              addition — the reference offers no way to type an exact colour. */}
          <Row label="Color" testid="row-color" controlWidth="sm:w-72">
            <div className="flex items-center gap-3">
              <input data-testid="in-color" type="color" value={color} onChange={(e) => handleColorPicker(e.target.value)}
                aria-label="Color picker"
                className="h-8 w-8 rounded border border-border cursor-pointer shrink-0" />
              <input
                data-testid="in-hex"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={7}
                placeholder="#334155"
                aria-label="Hex color"
                className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
            </div>
          </Row>
        </div>

        {/* No Reset here: the tool has exactly ONE (in the Result panel, next
            to the exports), matching the reference. A second identical button
            at the bottom of a long input card only raised the question of
            whether the two reset different scopes. */}
      </Panel>

      {/* Results live in their own highlighted panel below the input card
          (the reference's blue-bordered box). */}
      <div data-testid="result-panel" className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
        <PanelTitle>Result</PanelTitle>

        {/* When either gate fails there is no honest number set to show, so the
            readout is replaced by the reason and the downloads stay disabled
            until it is fixed — rather than printing a bar the tool itself says
            it cannot represent. Both reasons use this one box. */}
        {resultInvalid ? (
          <div data-testid="result-invalid" role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3">
            <p className="text-sm font-semibold text-destructive">Cannot draw this bar.</p>
            {segInvalid ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                “One segment equals” is {segVal} {unit}, but the whole bar only spans {segBounded} {unit} in real life,
                so not even one segment fits on it. Set the segment to at most {segBounded} {unit}, or widen the bar /
                change the scale.
              </p>
            ) : (
              /* Same gate, same treatment as the segment case. Manual rows are
                 kept across a scale change on purpose, so the bar they describe
                 can outgrow the tool's own paper range; the rows are NOT
                 rewritten — the result and every export are withheld instead. */
              <p data-testid="manual-invalid" className="mt-1 text-xs leading-relaxed text-muted-foreground">
                The step rows below are preserved when the scale changes, and at {scaleLabel} the largest boundary
                ({manualMaxLabel}) needs {manualPaperLabel} of paper — more than the {SLIDER_RANGES.width.max} mm a
                Manual bar can be. Reduce the step values, or change the scale / unit. Rows past the range are marked
                “out of range”.
              </p>
            )}
          </div>
        ) : (
        <>
        {/* Live computed output */}
        <ResBox>
          <Res name="seg" label="One segment on paper" value={segPaperMm ? `${fmtTrim(segPaperMm, 3)} mm` : "—"} />
          <Res name="total" label="Full bar on paper" value={totalPaperMm ? `${fmtTrim(totalPaperMm, 2)} mm` : "—"} />
          <Res name="real" label="Full bar in real life" value={totalReal} />
          <Res name="steps" label="Step count" value={bar ? String(bar.numSteps) : "—"} />
        </ResBox>

        {/* Live SVG preview */}
        {svgStr && (
          <div className="mt-3">
            <p data-testid="bar-summary" className="mb-2 text-sm text-foreground">
              The width of the scale bar is {totalPaperMm ? `${fmtTrim(totalPaperMm, 2)} mm` : "—"}
              {totalReal !== "—" ? `, representing ${totalReal} in real life` : ""}.
            </p>
            <div ref={svgRef}
              data-testid="bar-preview"
              className="rounded-md border border-border bg-background p-2 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: svgStr }} />
            <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
              Scale {scaleLabel} — {bar?.numSteps} steps
            </p>
          </div>
        )}
        </>
        )}

        {/* Export row: "Download as:" + buttons, and the tool's ONLY Reset.
            Exports are disabled while no honest bar exists (see svgStr). */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:shrink-0">Download as:</span>
          <div className="flex flex-wrap gap-2">
          <button onClick={handleExportSvg} disabled={!svgStr}
            className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors disabled:opacity-50">
            ↓ SVG
          </button>
          <button onClick={handleExportPng} disabled={!svgStr}
            className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors disabled:opacity-50">
            ↓ PNG
          </button>
          <button onClick={handleExportPdf} disabled={!svgStr}
            className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors disabled:opacity-50">
            ↓ PDF
          </button>
          <button onClick={handleExportDxf} disabled={!svgStr}
            className="px-3 py-1.5 rounded-md border border-border bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            ↓ DXF (CAD)
          </button>
          <button type="button" data-testid="reset-results" onClick={handleReset}
            className="px-3 py-1.5 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors sm:ml-auto">
            ↺ Reset fields
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
