"use client";

import { useState } from "react";
import { CalcLayout, FormGrid, Num, Panel, PanelTitle, Res, ResBox, Sel, fmtTrim } from "../ui";
import { contrastRatio, normalizeHex, parseHex, ratioVerdict, relativeLuminance, toHex } from "../color";

/**
 * Contrast Text Checker — WCAG 2.x contrast for one text/background pair.
 * Large text is ≥24px (18pt) regular or ≥18.66px (14pt) bold per WCAG 1.4.3.
 */
export default function ContrastTextChecker() {
  const [fg, setFg] = useState("#1a1a1a");
  const [bg, setBg] = useState("#f5f5f5");
  const [size, setSize] = useState("16");
  const [weight, setWeight] = useState("400");
  const [sample, setSample] = useState("The quick brown fox jumps over the lazy dog");

  const fgRgb = parseHex(fg);
  const bgRgb = parseHex(bg);
  const px = parseFloat(size) || 0;
  const wt = parseFloat(weight) || 400;
  const large = px >= 24 || (px >= 18.66 && wt >= 700);
  const ratio = fgRgb && bgRgb ? contrastRatio(fgRgb, bgRgb) : NaN;
  const verdicts = Number.isFinite(ratio) ? ratioVerdict(ratio, large) : [];

  const fgNorm = normalizeHex(fg);
  const bgNorm = normalizeHex(bg);

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Pair</PanelTitle>
        <FormGrid>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Text color</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={fgNorm ?? "#000000"}
                onChange={(e) => setFg(e.target.value)}
                aria-label="Text color picker"
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background"
              />
              <input
                data-testid="in-fg"
                type="text"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Background</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={bgNorm ?? "#ffffff"}
                onChange={(e) => setBg(e.target.value)}
                aria-label="Background color picker"
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background"
              />
              <input
                data-testid="in-bg"
                type="text"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </label>
          <Num name="size" label="Font size" unit="px" value={size} onChange={setSize} step={0.5} />
          <Sel
            name="weight"
            label="Weight"
            value={weight}
            onChange={setWeight}
            options={[300, 400, 500, 600, 700, 800].map((x) => ({ value: String(x), label: String(x) }))}
          />
        </FormGrid>
        <ResBox>
          <Res name="ratio" label="Contrast ratio" value={Number.isFinite(ratio) ? `${fmtTrim(ratio, 2)} : 1` : "—"} />
          <Res name="size" label="Text classification" value={large ? "Large text" : "Normal text"} />
          <Res
            name="lum"
            label="Relative luminance"
            value={fgRgb && bgRgb ? `${fmtTrim(relativeLuminance(fgRgb), 5)} vs ${fmtTrim(relativeLuminance(bgRgb), 5)}` : "—"}
          />
          {verdicts.map((v) => (
            <Res key={v.label} label={v.label} value={v.pass ? "PASS" : "FAIL"} />
          ))}
        </ResBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Large text = 24px+ regular, or 18.66px+ (14pt) at bold 700. AA needs 4.5:1 normal / 3:1 large; AAA needs 7:1 /
          4.5:1. UI borders and icons need 3:1.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Preview</PanelTitle>
        <div
          className="rounded-lg border border-border p-6"
          style={{ background: bgNorm ?? "#ffffff", color: fgNorm ?? "#000000" }}
        >
          <p style={{ fontSize: `${px || 16}px`, fontWeight: wt, lineHeight: 1.5 }}>{sample}</p>
          <p className="mt-3 opacity-80" style={{ fontSize: `${Math.max(11, (px || 16) * 0.75)}px` }}>
            Secondary line at 75% of the sample size — small text is where contrast failures show first.
          </p>
        </div>
        <div className="mt-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sample text</span>
            <input
              type="text"
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="mt-3 rounded-lg border border-border bg-card/40 p-3 font-mono text-xs text-muted-foreground">
          {fgNorm ?? "invalid"} on {bgNorm ?? "invalid"} · {Number.isFinite(ratio) ? `${fmtTrim(ratio, 2)}:1` : "—"} ·{" "}
          {toHex(fgRgb ?? { r: 0, g: 0, b: 0 })} / {toHex(bgRgb ?? { r: 255, g: 255, b: 255 })}
        </div>
      </Panel>
    </CalcLayout>
  );
}
