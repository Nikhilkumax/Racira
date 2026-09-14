"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "./ui";
import { UNIT_LABELS, UNIT_GROUPS } from "../shared/length-units";
// All scale/geometry math lives in a React-free module so there is exactly one
// paper ⇄ real conversion path and the formulas can be unit-tested directly.
import {
  DEFAULT_PARAMS,
  buildScaleLabel,
  computeBar,
  fmtRatio,
  type BarParams,
  type BarStyle,
  type DivStyle,
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
  const [stepCount, setStepCount] = useState(DEFAULT_PARAMS.stepCount);
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
    setStepCount(DEFAULT_PARAMS.stepCount);
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
    width, height, lineWidth, stepMode, stepCount, divStyle, barStyle, color,
  }), [mode, x, flipX, inchPaper, footReal, inchReal, factorVal, unit, segVal,
    width, height, lineWidth, stepMode, stepCount, divStyle, barStyle, color]);

  const bar = useMemo(() => computeBar(params), [params]);
  const svgStr = useMemo(() => renderBarSvg(bar, params), [bar, params]);

  const handleExportSvg = useCallback(() => { if (svgStr) exportSvg(svgStr); }, [svgStr]);
  const handleExportPng = useCallback(() => { if (svgStr) exportPng(svgStr); }, [svgStr]);
  const handleExportPdf = useCallback(() => { if (svgStr) exportPdf(svgStr); }, [svgStr]);
  const handleExportDxf = useCallback(() => { exportDxf(bar, params); }, [bar, params]);

  // Computed results
  const scale = bar?.scale ?? null;
  const segPaperMm = bar?.segPaperMm ?? null;
  const totalPaperMm = bar?.totalPaperMm ?? null;
  const totalReal = bar ? `${fmtTrim(bar.totalRealValue, 4)} ${unit}` : "—";

  const scaleLabel = buildScaleLabel(scale, params);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Scale input</PanelTitle>

        {/* Radio toggle for scale mode */}
        <div className="flex flex-col gap-2 mb-4">
          {([
            ["one-to-x", "One-to-X scale  (e.g. 1 : 200)"],
            ["inch-to-foot", "Inches-to-the-foot  (e.g. ¼″ = 1′-0″)"],
            ["scale-factor", "Scale factor  (e.g. 1.2×)"],
          ] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="scale-mode" value={val} checked={mode === val}
                onChange={() => setMode(val)} className="accent-primary" />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Mode-specific inputs */}
        {mode === "one-to-x" && (
          <FormGrid>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Num name="x" label={flipX ? "Scale X : 1" : "Scale 1 : X"} value={x} onChange={setX} />
              </div>
              <button type="button" onClick={() => setFlipX(!flipX)}
                className="h-9 px-3 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors shrink-0">
                {flipX ? "Show 1 : X" : "Toggle X : 1"}
              </button>
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
                <Num name="factor" label="Scale factor" unit="×" value={factorVal} onChange={setFactorVal} />
              </div>
              <button type="button" onClick={() => {
                const f = parseFloat(factorVal);
                if (Number.isFinite(f) && f > 0) setFactorVal(String(+(1 / f).toFixed(6)));
              }} className="h-9 px-3 rounded-md border border-border bg-muted text-xs font-medium hover:bg-muted/80 transition-colors shrink-0">
                Flip ÷
              </button>
            </div>
          </FormGrid>
        )}

        {/* Computed scale display */}
        <div data-testid="effective-scale" className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          Effective scale: <span className="font-mono font-medium text-foreground">{scaleLabel}</span>
          {scale && <span className="ml-2 text-muted-foreground/70">(1 mm paper = {fmtRatio(scale)} mm real)</span>}
        </div>

        {/* Real-length unit + segment size */}
        <div className="mt-3">
          <div className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Real-length unit</div>
          <select
            data-testid="in-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          >
            {UNIT_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.units.map((u) => (
                  <option key={u} value={u}>{u} — {UNIT_LABELS[u]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <Num name="seg" label="One segment equals" unit={unit} value={segVal} onChange={setSegVal} />
        </div>

        {/* Reset — restores every field on this tool to its default */}
        <div className="mt-4">
          <button
            type="button"
            data-testid="reset"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            ↺ Reset fields
          </button>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Bar geometry &amp; style</PanelTitle>

        <FormGrid>
          <Num name="width" label="Width" unit="mm" value={width} onChange={setWidth} />
          <Num name="height" label="Height" unit="pt" value={height} onChange={setHeight} />
          <Num name="lineWidth" label="Line width" unit="pt" value={lineWidth} onChange={setLineWidth} />
        </FormGrid>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Sel name="stepMode" label="Steps" value={stepMode} onChange={(v) => setStepMode(v as StepMode)}
            options={[{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }]} />
          {stepMode === "manual" && (
            <Num name="stepCount" label="Step count" value={stepCount} onChange={setStepCount} />
          )}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Sel name="divStyle" label="Step division" value={divStyle} onChange={(v) => setDivStyle(v as DivStyle)}
            options={[
              { value: "exponential", label: "Divided exponential" },
              { value: "proportional", label: "Divided proportionally" },
            ]} />
          <Sel name="barStyle" label="Bar style" value={barStyle} onChange={(v) => setBarStyle(v as BarStyle)}
            options={[
              { value: "double-row", label: "Double row" },
              { value: "single-row", label: "Single row" },
              { value: "line", label: "Line" },
            ]} />
        </div>

        {/* Color picker + hex text input */}
        <div className="mt-3 flex items-center gap-3">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Color</label>
          <input data-testid="in-color" type="color" value={color} onChange={(e) => handleColorPicker(e.target.value)}
            className="h-8 w-8 rounded border border-border cursor-pointer shrink-0" />
          <input
            data-testid="in-hex"
            type="text"
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            maxLength={7}
            placeholder="#334155"
            className="w-28 rounded-lg border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        {/* Live computed output */}
        <ResBox>
          <Res name="seg" label="One segment on paper" value={segPaperMm ? `${fmtTrim(segPaperMm, 3)} mm` : "—"} />
          <Res name="total" label="Full bar on paper" value={totalPaperMm ? `${fmtTrim(totalPaperMm, 2)} mm` : "—"} />
          <Res name="real" label="Full bar in real life" value={totalReal} />
          <Res name="steps" label="Step count" value={bar ? String(bar.numSteps) : "—"} />
        </ResBox>

        {/* Live SVG preview */}
        {svgStr && (
          <div className="mt-4">
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

        {/* Download buttons */}
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Download as</div>
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
          <button onClick={handleExportDxf} disabled={!bar}
            className="px-3 py-1.5 rounded-md border border-border bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            ↓ DXF (CAD)
          </button>
          </div>
        </div>
      </Panel>
    </CalcLayout>
  );
}
