"use client";

import { useEffect, useRef, useState } from "react";
import { Btn, CalcLayout, CodeOut, Panel, PanelTitle, Res, ResBox, Row, Sel, SliderNum, TextInput, fmtTrim } from "../ui";
import { FONTS } from "../fonts";

/**
 * Font Glyph PNG Exporter — draws glyphs into a canvas with the browser's own
 * text engine and exports the result as a PNG data URL. Exporting from the live
 * renderer means the output has exactly the shaping, kerning and antialiasing
 * the font produces, which is what a mockup or an icon sheet needs — and it
 * stays entirely on this machine.
 */
export default function FontGlyphPngExporter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fontName, setFontName] = useState("Fraunces");
  const [glyphs, setGlyphs] = useState("Aa Bb Cc 0123 &@#");
  const [size, setSize] = useState("120");
  const [bg, setBg] = useState("#ffffff");
  const [ink, setInk] = useState("#111827");
  const [cols, setCols] = useState("6");
  const [pad, setPad] = useState("16");
  const [dataUrl, setDataUrl] = useState("");

  const font = FONTS.find((f) => f.name === fontName) ?? FONTS[1];
  const px = Math.min(320, Math.max(16, parseFloat(size) || 120));
  const n = Math.min(12, Math.max(1, Math.round(parseFloat(cols) || 6)));
  const p = Math.min(80, Math.max(0, parseFloat(pad) || 16));
  const chars = [...new Set([...glyphs].filter((c) => c !== " "))];
  const rows = Math.max(1, Math.ceil(chars.length / n));
  const cell = px + p * 2;
  const width = cell * n;
  const height = cell * rows;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${px}px ${font.stack}`;
    chars.forEach((ch, i) => {
      const cx = (i % n) * cell + cell / 2;
      const cy = Math.floor(i / n) * cell + cell / 2;
      ctx.fillText(ch, cx, cy);
    });
    try {
      setDataUrl(canvas.toDataURL("image/png"));
    } catch {
      setDataUrl("");
    }
  }, [font, px, n, p, bg, ink, glyphs, width, height, cell, chars]);

  const bytes = dataUrl ? Math.round(((dataUrl.split(",")[1] ?? "").length * 3) / 4) : 0;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${font.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-glyphs.png`;
    a.click();
  };

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Export</PanelTitle>
        <Sel name="font" label="Face" value={fontName} onChange={setFontName} options={FONTS.map((f) => ({ value: f.name, label: `${f.name} — ${f.kind}` }))} />
        <div className="mt-3 space-y-3">
          <TextInput name="glyphs" label="Glyphs to export" value={glyphs} onChange={setGlyphs} placeholder="Aa Bb 0123 …" />
          <SliderNum name="size" label="Glyph size" unit="px" value={size} onChange={setSize} min={16} max={320} step={4} />
          <SliderNum name="cols" label="Columns" value={cols} onChange={setCols} min={1} max={12} step={1} />
          <SliderNum name="pad" label="Padding per cell" unit="px" value={pad} onChange={setPad} min={0} max={80} step={2} />
          <div className="grid grid-cols-2 gap-3">
            <Row label="Background">
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
            <Row label="Ink">
              <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} className="h-9 w-full rounded-lg border border-border" />
            </Row>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Btn onClick={download} disabled={!dataUrl} testid="download-png">
            Download PNG
          </Btn>
          <a href={dataUrl || "#"} download={`${font.name}-glyphs.png`} className={`text-xs underline decoration-dotted ${dataUrl ? "text-foreground" : "pointer-events-none text-muted-foreground"}`}>
            or open the PNG
          </a>
        </div>
        <ResBox>
          <Res name="glyphs" label="Glyphs exported" value={String(chars.length)} />
          <Res name="canvas" label="Canvas size" value={`${width} × ${height}px`} />
          <Res name="bytes" label="PNG size (base64 estimate)" value={bytes ? `${fmtTrim(bytes / 1024, 1)} KB` : "—"} />
          <Res name="transparent" label="Background" value={bg.toLowerCase() === "#ffffff" ? "opaque white" : bg} />
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Canvas</PanelTitle>
          <div className="overflow-x-auto rounded-lg border border-border bg-card/40 p-3">
            <canvas ref={canvasRef} className="max-w-full" style={{ imageRendering: "auto" }} data-testid="glyph-canvas" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The canvas is drawn at {px}px with the browser's text engine, so the PNG contains real rendered outlines — useful
            for a spec sheet, an icon draft or a client mockup. For production iconography, export vector outlines from a
            font editor instead: a PNG cannot scale past its pixel size.
          </p>
        </Panel>

        <Panel>
          <PanelTitle>Export notes</PanelTitle>
          <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>· Canvas rendering uses the same webfont the preview uses; if the font has not loaded yet, the canvas draws the fallback — re-render after the font is ready.</li>
            <li>· For crisp results at small sizes, export at 2–4× the target size and let the design tool downscale.</li>
            <li>· A transparent background is not offered here on purpose: PNG alpha around antialiased edges produces dark fringes when scaled in some tools.</li>
            <li>· Nothing is uploaded — the canvas is drawn and encoded locally in this tab.</li>
          </ul>
        </Panel>

        <CodeOut
          title="What the export does"
          language="html"
          testid="png-method"
          code={`<canvas width="${width}" height="${height}"></canvas>
<script>
  ctx.font = "${px}px ${font.stack}";
  ctx.fillStyle = "${ink}";
  ctx.fillText(glyph, cellCentreX, cellCentreY);
  const png = canvas.toDataURL("image/png");
  // → download as <a download href=png>
</script>`}
        />
      </div>
    </CalcLayout>
  );
}
